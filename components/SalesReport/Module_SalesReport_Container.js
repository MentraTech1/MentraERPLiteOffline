// المسار: components/SalesReport/Module_SalesReport_Container.js
window.Module_SalesReport_Container = function() {
    const { useState, useEffect, useRef } = React;
    const { SalesReportHeader, SalesReportStats, SalesReportFilter, SalesReportList, SalesReportDetails } = window;

    const containerRef = useRef(null);

    // --- States ---
    const [allSales, setAllSales] = useState([]);
    const [allInvoiceItems, setAllInvoiceItems] = useState([]); 
    const [allProducts, setAllProducts] = useState([]); 

    const [filteredSales, setFilteredSales] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const pad = n => n < 10 ? '0'+n : n;
    const d = new Date();
    const defaultStart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
    const defaultEnd = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    
    const [dateFilter, setDateFilter] = useState({ start: defaultStart, end: defaultEnd });
    
    const itemsPerPage = 3; 
    const [currentPage, setCurrentPage] = useState(0);

    // Tab States (0: كاش، 1: آجل، 2: منتجات)
    const [activeTab, setActiveTab] = useState(0);
    
    const [productStats, setProductStats] = useState([]);
    const [productPage, setProductPage] = useState(0);
    const [productSortDesc, setProductSortDesc] = useState(true); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeInvoice, setActiveInvoice] = useState(null);
    const [editingItems, setEditingItems] = useState([]);
    const [invoiceProfit, setInvoiceProfit] = useState(0);

    const dbRef = useRef(null);

    // =========================================================================
    // حماية تجميد المتصفح وعدم الاستجابة للكيبورد (محتفظ بها كما طلبت)
    // =========================================================================
    useEffect(() => {
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur(); 
        }
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, [activeTab, isModalOpen]); // تم إضافة التبعيات لضمان عملها عند التبديل

    // --- Init DB & Load Data ---
    const loadSalesData = async () => {
        const db = dbRef.current;
        const invoices = await db.invoices.where('type').equalsIgnoreCase('SALE').reverse().toArray();
        const items = await db.invoice_items.toArray();
        const prods = await db.products.toArray();
        
        setAllSales(invoices);
        setAllInvoiceItems(items);
        setAllProducts(prods);
    };

    useEffect(() => {
        const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
        const db = new window.Dexie(dbName);
        db.version(4).stores({
            settings: 'id, project_name, shop_name, phone, logo',
            products: '++id, name_ar, sku, category, stock_qty, price, cost', 
            invoices: '++id, invoice_number, type, customer_vendor_id, date, total, status, discount, method',
            invoice_items: '++id, invoice_id, product_id, price, qty, total_item, total_cost',
            accounts: '++id, code, name_ar, type, balance',
            journal: '++id, date, ref_no, description, total', 
            journal_items: '++id, journal_id, account_id, debit, credit',
            stock_movements: '++id, product_id, type, qty, date, ref_id'
        });
        dbRef.current = db;
        db.open();
        loadSalesData();
    }, []);

    // --- Apply Filters & Search ---
    useEffect(() => {
        let filtered = allSales;
        
        if (dateFilter.start && dateFilter.end) {
            filtered = filtered.filter(inv => {
                const invDate = String(inv.date).substring(0, 10);
                return invDate >= dateFilter.start && invDate <= dateFilter.end;
            });
        }
        
        if (searchQuery.trim()) {
            const term = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(inv => 
                (inv.invoice_number && inv.invoice_number.toLowerCase().includes(term)) || 
                (inv.customer_vendor_name && inv.customer_vendor_name.toLowerCase().includes(term))
            );
        }

        setFilteredSales(filtered);
        setCurrentPage(0);
        setProductPage(0);
        
        const invoiceIds = new Set(filtered.map(i => i.id));
        const filteredItems = allInvoiceItems.filter(item => invoiceIds.has(item.invoice_id));
        
        const counts = {};
        filteredItems.forEach(item => {
            if(!counts[item.product_id]) counts[item.product_id] = { id: item.product_id, qty: 0, total: 0 };
            counts[item.product_id].qty += Number(item.qty);
            counts[item.product_id].total += (Number(item.qty) * Number(item.price));
        });

        const prodArr = Object.values(counts).map(c => {
            const p = allProducts.find(prod => prod.id === c.id);
            return { ...c, name: p ? p.name_ar : 'منتج محذوف' };
        });

        setProductStats(prodArr);

    }, [allSales, allInvoiceItems, allProducts, dateFilter, searchQuery]);

    // --- View Functions ---
    const openDetails = async (id) => {
        const inv = await dbRef.current.invoices.get(id);
        let items = await dbRef.current.invoice_items.where('invoice_id').equals(id).toArray();
        let invoiceTotalCost = 0;

        for (let item of items) {
            const p = await dbRef.current.products.get(item.product_id);
            item.product_name = p ? p.name_ar : "صنف مجهول";
            const unitCost = p ? (Number(p.cost) || 0) : 0;
            item.cost = unitCost; // حفظ التكلفة لاستخدامها في التعديل
            invoiceTotalCost += (unitCost * item.qty);
        }

        setActiveInvoice(inv);
        setEditingItems(JSON.parse(JSON.stringify(items)));
        setInvoiceProfit(Number(inv.total) - invoiceTotalCost);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setActiveInvoice(null);
            setEditingItems([]);
        }, 300);
    };

    const adjustQty = (idx, amount) => {
        const newItems = [...editingItems];
        newItems[idx].qty = Math.max(0, newItems[idx].qty + amount);
        setEditingItems(newItems);
    };

    // =========================================================================
    // 1. التعديل الذكي باستخدام JournalManager
    // =========================================================================
    const saveSmartEdit = async (newStatus) => {
        try {
            const db = dbRef.current;
            let newTotalAmount = 0;
            let newTotalCost = 0;

            // 1. فحص توفر المخزون قبل التعديل
            for (let item of editingItems) {
                const original = await db.invoice_items.get(item.id);
                const diff = item.qty - original.qty; 
                const prod = await db.products.get(item.product_id);

                if (prod && diff > 0 && prod.stock_qty < diff) {
                    Swal.fire({icon: 'error', title: 'رصيد غير كافٍ', text: `المتاح من ${item.product_name}: ${prod.stock_qty}`, customClass: {popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold'}});
                    return; 
                }
            }

            // 2. تحديث جداول الفواتير والمخازن
            await db.transaction('rw', [db.invoices, db.invoice_items, db.products], async () => {
                for (let item of editingItems) {
                    const original = await db.invoice_items.get(item.id);
                    const diff = item.qty - original.qty;
                    const prod = await db.products.get(item.product_id);
                    
                    if (prod) await db.products.update(prod.id, { stock_qty: Number(prod.stock_qty) - diff });
                    
                    const itemCost = item.cost || (prod ? prod.cost : 0);
                    await db.invoice_items.update(item.id, { 
                        qty: item.qty, 
                        total_item: item.qty * item.price,
                        total_cost: item.qty * itemCost 
                    });
                    
                    newTotalAmount += (item.qty * item.price);
                    newTotalCost += (item.qty * itemCost);
                }
                
                // تطبيق الخصم القديم (إن وجد)
                const discount = Number(activeInvoice.discount) || 0;
                newTotalAmount = Math.max(0, newTotalAmount - discount);

                await db.invoices.update(activeInvoice.id, { total: newTotalAmount, status: newStatus });
            });

            // 3. المحاسبة: تعديل القيود اليومية وعكس الأرصدة عبر JournalManager
            if (window.JournalManager && activeInvoice.invoice_number) {
                await window.JournalManager.updateSaleInvoice(
                    activeInvoice.invoice_number, // المرجع القديم الذي سيتم عكسه
                    newTotalAmount,               // الإجمالي الجديد
                    newTotalCost,                 // التكلفة الجديدة
                    activeInvoice.method || 'CASH', 
                    newStatus,                    // الحالة الجديدة (مثلاً تحولت من آجل لمدفوع)
                    activeInvoice.customer_vendor_name,
                    activeInvoice.date
                );
            }

            Swal.fire({icon: 'success', title: 'تم الحفظ', text: 'تم التعديل وتحديث المخزن والدفاتر', timer: 1500, showConfirmButton: false, customClass: {popup: 'rounded-3xl'}});
            closeDetailsModal();
            loadSalesData();
        } catch (e) { 
            Swal.fire({icon: 'error', title: 'خطأ', text: e.message});
        }
    };

    // =========================================================================
    // 2. الحذف الذكي باستخدام JournalManager
    // =========================================================================
    const deleteInvoice = async () => {
        if (!activeInvoice) return;
        const res = await Swal.fire({
            title: 'تأكيد الحذف؟', text: "سيتم إرجاع البضاعة للمخزن وتحديث الحسابات والدفاتر بالكامل.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#e11d48', cancelButtonColor: '#94a3b8',
            confirmButtonText: 'نعم، احذف', cancelButtonText: 'تراجع',
            customClass: {popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold', cancelButton: 'rounded-xl font-bold'}
        });

        if (!res.isConfirmed) return;

        try {
            const db = dbRef.current;
            const invNo = activeInvoice.invoice_number;

            // 1. إرجاع المخزون وحذف السجلات الأساسية
            await db.transaction('rw', [db.invoices, db.invoice_items, db.products, db.stock_movements], async () => {
                const items = await db.invoice_items.where('invoice_id').equals(activeInvoice.id).toArray();
                for (const item of items) {
                    const p = await db.products.get(item.product_id);
                    if (p) await db.products.update(p.id, { stock_qty: Number(p.stock_qty) + Number(item.qty) });
                }
                await db.invoice_items.where('invoice_id').equals(activeInvoice.id).delete();
                if(invNo) await db.stock_movements.where('ref_id').equals(invNo).delete();
                await db.invoices.delete(activeInvoice.id);
            });
            
            // 2. المحاسبة: عكس التأثير المالي وحذف القيد عبر JournalManager
            if (window.JournalManager && invNo) {
                await window.JournalManager.deleteEntryByRef(invNo);
            }
            
            Swal.fire({icon: 'success', title: 'تم الحذف', text: 'تمت تسوية المخزن والدفاتر', timer: 1500, showConfirmButton: false, customClass: {popup: 'rounded-3xl'}});
            closeDetailsModal();
            loadSalesData();
        } catch (e) { 
            Swal.fire({icon: 'error', title: 'خطأ', text: e.message}); 
        }
    };

    // --- Exports & Print ---
    const exportToExcel = () => {
        if(filteredSales.length === 0) return;
        const excelData = filteredSales.map(inv => ({
            "رقم الفاتورة": inv.invoice_number,
            "التاريخ": String(inv.date).substring(0, 16).replace('T', ' '),
            "العميل": inv.customer_vendor_name || 'نقدي',
            "الإجمالي": Number(inv.total),
            "الحالة": inv.status === 'paid' ? 'مدفوعة' : 'آجلة'
        }));
        const ws = window.XLSX.utils.json_to_sheet(excelData);
        if(!ws['!views']) ws['!views'] = [];
        ws['!views'].push({rightToLeft: true});
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "المبيعات");
        window.XLSX.writeFile(wb, `مبيعات_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportToPDF = () => {
        if(filteredSales.length === 0) return;
        let totalAmount = filteredSales.reduce((acc, curr) => acc + Number(curr.total), 0);
        let unpaidAmount = filteredSales.filter(i => i.status !== 'paid').reduce((acc, curr) => acc + Number(curr.total), 0);

        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write(`
            <html dir="rtl" lang="ar"><head><title>تقرير المبيعات</title><style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
            body { font-family: 'Cairo', sans-serif; padding: 20px; color: #1e293b; }
            h2 { color: #2563eb; font-size: 20px; text-align: center; font-weight: 900;}
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { padding: 8px; border: 1px solid #cbd5e1; text-align: right; }
            th { background-color: #f8fafc; font-weight: bold;}
            .summary { margin-top:20px; display: flex; justify-content: space-between; background: #eff6ff; padding: 10px; border-radius: 5px; font-weight: bold; }
            </style></head><body>
            <h2>سجل المبيعات والعملاء</h2>
            <table><thead><tr><th>الفاتورة</th><th>التاريخ</th><th>العميل</th><th>الحالة</th><th>الإجمالي</th></tr></thead><tbody>
            ${filteredSales.map(inv => `<tr><td>${inv.invoice_number}</td><td>${String(inv.date).substring(0, 10)}</td><td>${inv.customer_vendor_name || 'نقدي'}</td><td>${inv.status === 'paid' ? 'مدفوعة' : 'آجلة'}</td><td dir="ltr">${Number(inv.total).toFixed(2)}</td></tr>`).join('')}
            </tbody></table>
            <div class="summary"><span>المبيعات: ${totalAmount.toLocaleString()} ج.م</span><span>الديون: ${unpaidAmount.toLocaleString()} ج.م</span></div>
            <script> window.onload = function() { setTimeout(()=> {window.print(); window.close();}, 500); } </script>
            </body></html>
        `);
        printWindow.document.close();
    };

    const printSingleInvoice = async () => {
        if (!activeInvoice) return;
        try {
            let shopName = "Mentra ERP";
            let shopPhone = "";
            const setting = await dbRef.current.settings.get(1);
            if(setting) { shopName = setting.shop_name || shopName; shopPhone = setting.phone || ""; }

            const finalTotal = editingItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
            
            let printWin = window.open('', '_blank');
            let html = `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>فاتورة #${activeInvoice.invoice_number}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                        body { font-family: 'Cairo', sans-serif; padding: 10px; color: #000; margin: 0; background: #fff; font-size: 12px; }
                        .receipt-container { max-width: 80mm; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .header h2 { margin: 0 0 5px 0; font-size: 20px; font-weight: 900; }
                        .info-box { margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                        .info-box div { margin-bottom: 4px; display: flex; justify-content: space-between; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                        th { border-bottom: 1px solid #000; padding: 5px 0; text-align: right; font-size: 11px; }
                        td { padding: 6px 0; border-bottom: 1px dotted #ccc; font-size: 12px; font-weight: bold; }
                        .summary { border-top: 2px dashed #000; padding-top: 10px; font-weight: bold; }
                        .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                        .final-total { font-size: 18px; margin-top: 10px; border-top: 2px solid #000; padding-top: 5px; }
                        .footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 1px dashed #000; padding-top: 10px; }
                        @media print { body { padding: 0; } @page { margin: 0; } }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <div class="header">
                            <h2>${shopName}</h2>
                            ${shopPhone ? `<p>تليفون: ${shopPhone}</p>` : ''}
                            <p>فاتورة مبيعات ضريبية</p>
                        </div>
                        <div class="info-box">
                            <div><span>رقم الفاتورة:</span> <strong>#${activeInvoice.invoice_number}</strong></div>
                            <div><span>التاريخ:</span> <strong>${String(activeInvoice.date).substring(0, 16).replace('T', ' ')}</strong></div>
                            <div><span>العميل:</span> <strong>${activeInvoice.customer_vendor_name || 'عميل نقدي'}</strong></div>
                            <div><span>الدفع:</span> <strong>${activeInvoice.status === 'paid' ? 'نقدي (كاش)' : 'آجل (دين)'}</strong></div>
                        </div>
                        <table>
                            <thead><tr><th>الصنف</th><th>العدد</th><th>السعر</th><th>الإجمالي</th></tr></thead>
                            <tbody>
                                ${editingItems.map(item => `<tr><td>${item.product_name}</td><td>${item.qty}</td><td>${Number(item.price).toLocaleString()}</td><td>${(item.qty * item.price).toLocaleString()}</td></tr>`).join('')}
                            </tbody>
                        </table>
                        <div class="summary">
                            <div class="summary-row final-total">
                                <span>الصافي المطلوب:</span>
                                <span>${Number(finalTotal).toLocaleString()} ج.م</span>
                            </div>
                        </div>
                        <div class="footer"><p>شكراً لثقتكم بنا!</p></div>
                    </div>
                    <script>window.onload=function(){setTimeout(()=>{window.print();window.close();},500);}</script>
                </body>
                </html>
            `;
            printWin.document.write(html);
            printWin.document.close();
        } catch (e) { Swal.fire('خطأ', 'حدث خطأ أثناء إعداد الطباعة', 'error'); }
    };

    // --- مكون بطاقات المنتجات (Tab 2) ---
    const RenderProductCards = () => {
        const sortedProducts = [...productStats].sort((a, b) => productSortDesc ? b.qty - a.qty : a.qty - b.qty);
        const start = productPage * itemsPerPage;
        const pagedProducts = sortedProducts.slice(start, start + itemsPerPage);
        const lastPage = Math.ceil(sortedProducts.length / itemsPerPage) - 1 || 0;

        return (
            <div className="animate-view">
                <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 text-sm"><i className="fas fa-chart-bar text-blue-500 ml-2"></i> إحصائيات حركة المنتجات</h3>
                    <button 
                        onClick={() => { setProductSortDesc(!productSortDesc); setProductPage(0); }}
                        className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                    >
                        {productSortDesc ? <><i className="fas fa-sort-amount-down ml-1"></i> الأكثر مبيعاً</> : <><i className="fas fa-sort-amount-up ml-1"></i> الأقل مبيعاً</>}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pagedProducts.length === 0 ? (
                        <div className="col-span-3 text-center py-10 text-slate-400">لا توجد مبيعات في هذه الفترة</div>
                    ) : (
                        pagedProducts.map((p, idx) => (
                            <div key={p.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-[3rem] -z-0"></div>
                                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-lg"><i className="fas fa-box-open"></i></div>
                                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg text-[10px] font-black">#{start + idx + 1}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-base mb-1">{p.name}</h4>
                                        <p className="text-xs font-bold text-slate-500">الكمية المباعة: <span className="text-blue-600 text-sm font-mono">{p.qty}</span> وحدة</p>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">إجمالي الإيرادات</p>
                                        <p className="font-black text-slate-900 text-lg font-mono">{p.total.toLocaleString()} ج.م</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {sortedProducts.length > 0 && (
                    <div className="flex justify-center items-center mt-6">
                        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-1">
                            <button onClick={() => setProductPage(prev => Math.max(0, prev - 1))} disabled={productPage === 0} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"><i className="fas fa-chevron-right text-sm"></i></button>
                            <div className="px-4 py-2 min-w-[70px] text-center"><span className="font-black text-sm text-blue-600">{productPage + 1}</span></div>
                            <button onClick={() => setProductPage(prev => Math.min(lastPage, prev + 1))} disabled={productPage >= lastPage} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"><i className="fas fa-chevron-left text-sm"></i></button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div ref={containerRef} tabIndex="-1" className="pb-24 px-2 md:px-0 text-right font-sans outline-none" dir="rtl" style={{ WebkitTapHighlightColor: 'transparent' }}>
            
            {!isModalOpen ? (
                <div className="animate-view">
                    <SalesReportHeader exportToExcel={exportToExcel} exportToPDF={exportToPDF} />
                    
                    <SalesReportStats filteredSales={filteredSales} />

                    <SalesReportFilter 
                        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                        dateFilter={dateFilter} setDateFilter={setDateFilter}
                        exportToExcel={exportToExcel} exportToPDF={exportToPDF}
                    />

                    <div className="flex bg-white p-1.5 rounded-[1rem] shadow-sm border border-slate-100 mb-6 overflow-x-auto hide-scrollbar snap-x">
                        <button onClick={()=>setActiveTab(0)} className={`flex-1 min-w-[100px] px-3 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all snap-center ${activeTab === 0 ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}>البيع كاش</button>
                        <button onClick={()=>setActiveTab(1)} className={`flex-1 min-w-[100px] px-3 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all snap-center ${activeTab === 1 ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-50'}`}>البيع آجل</button>
                        <button onClick={()=>setActiveTab(2)} className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all snap-center ${activeTab === 2 ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>حركة المنتجات</button>
                    </div>

                    {activeTab === 0 && (
                        <SalesReportList 
                            filteredSales={filteredSales.filter(s => s.status === 'paid')} 
                            currentPage={currentPage} setCurrentPage={setCurrentPage} 
                            itemsPerPage={itemsPerPage} openDetails={openDetails} 
                        />
                    )}

                    {activeTab === 1 && (
                        <SalesReportList 
                            filteredSales={filteredSales.filter(s => s.status !== 'paid')} 
                            currentPage={currentPage} setCurrentPage={setCurrentPage} 
                            itemsPerPage={itemsPerPage} openDetails={openDetails} 
                        />
                    )}

                    {activeTab === 2 && (
                        <RenderProductCards />
                    )}

                </div>
            ) : (
                <div className="animate-slideInRight">
                    <SalesReportDetails 
                        invoice={activeInvoice} items={editingItems} profit={invoiceProfit}
                        onClose={closeDetailsModal} adjustQty={adjustQty}
                        saveSmartEdit={saveSmartEdit} deleteInvoice={deleteInvoice}
                        printSingleInvoice={printSingleInvoice}
                    />
                </div>
            )}
            
        </div>
    );
};