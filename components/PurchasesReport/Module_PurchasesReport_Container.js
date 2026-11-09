// المسار: components/PurchasesReport/Module_PurchasesReport_Container.js
window.Module_PurchasesReport_Container = function() {
    const { useState, useEffect, useRef } = React;
    const { PurchasesReportHeader, PurchasesReportStats, PurchasesReportFilter, PurchasesReportList, PurchasesReportDetails } = window;

    const containerRef = useRef(null);

    // --- States ---
    const [allPurchases, setAllPurchases] = useState([]);
    const [allInvoiceItems, setAllInvoiceItems] = useState([]); 
    const [allProducts, setAllProducts] = useState([]); 

    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const pad = n => n < 10 ? '0'+n : n;
    const d = new Date();
    const defaultStart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
    const defaultEnd = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    
    const [dateFilter, setDateFilter] = useState({ start: defaultStart, end: defaultEnd });
    
    const itemsPerPage = 3; 
    const [currentPage, setCurrentPage] = useState(0);

    const [activeTab, setActiveTab] = useState(0);
    
    const [productStats, setProductStats] = useState([]);
    const [productPage, setProductPage] = useState(0);
    const [productSortDesc, setProductSortDesc] = useState(true); 

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [activeInvoice, setActiveInvoice] = useState(null);
    const [editingItems, setEditingItems] = useState([]);

    const dbRef = useRef(null);

    // =========================================================================
    // حماية تجميد الكيبورد والشاشة (Auto Focus Protection)
    // =========================================================================
    useEffect(() => {
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur(); 
        }
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, [activeTab, isDetailsOpen]);

    // --- Init DB & Load Data ---
    const loadPurchasesData = async () => {
        const db = dbRef.current;
        const invoices = await db.invoices.where('type').equalsIgnoreCase('PURCHASE').reverse().toArray();
        const items = await db.invoice_items.toArray();
        const prods = await db.products.toArray();
        
        setAllPurchases(invoices);
        setAllInvoiceItems(items);
        setAllProducts(prods);
    };

    useEffect(() => {
        const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
        const db = new window.Dexie(dbName);
        db.version(4).stores({
            settings: 'id, project_name, shop_name, phone, logo',
            products: '++id, name_ar, sku, category, stock_qty, price, cost', 
            invoices: '++id, invoice_number, type, customer_vendor_id, date, total, status, method, discount',
            invoice_items: '++id, invoice_id, product_id, price, qty, total_item, total_cost',
            accounts: '++id, code, name_ar, type, balance',
            journal: '++id, date, ref_no, description, total', 
            journal_items: '++id, journal_id, account_id, debit, credit',
            stock_movements: '++id, product_id, type, qty, date, ref_id'
        });
        dbRef.current = db;
        db.open();
        loadPurchasesData();
    }, []);

    // --- Apply Filters & Search ---
    useEffect(() => {
        let filtered = allPurchases;
        
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

        setFilteredPurchases(filtered);
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

    }, [allPurchases, allInvoiceItems, allProducts, dateFilter, searchQuery]);

    // --- View Functions ---
    const openDetails = async (id) => {
        const inv = await dbRef.current.invoices.get(id);
        let items = await dbRef.current.invoice_items.where('invoice_id').equals(id).toArray();

        for (let item of items) {
            const p = await dbRef.current.products.get(item.product_id);
            item.product_name = p ? p.name_ar : "صنف مجهول";
        }

        setActiveInvoice(inv);
        setEditingItems(JSON.parse(JSON.stringify(items)));
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsDetailsOpen(true);
    };

    const closeDetails = () => {
        setIsDetailsOpen(false);
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
    // التعديل الذكي: حذف القيد القديم + إنشاء قيد مشتريات جديد ومحدث
    // =========================================================================
    const saveSmartEdit = async (newStatus) => {
        if (!activeInvoice) return;
        const db = dbRef.current;

        try {
            // 1. التحقق من توفر رصيد المخزن قبل تقليل كمية الشراء
            for (let item of editingItems) {
                const original = await db.invoice_items.get(item.id);
                const diff = item.qty - original.qty; 
                const prod = await db.products.get(item.product_id);

                if (prod && diff < 0 && (Number(prod.stock_qty) || 0) < Math.abs(diff)) {
                    Swal.fire({
                        icon: 'error', 
                        title: 'لا يمكن تقليل الكمية', 
                        text: `الكمية الحالية في المخزن من ${item.product_name} لا تكفي لخصم هذا الفارق. المتاح: ${prod.stock_qty}`, 
                        customClass: {popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold'}
                    });
                    return; 
                }
            }

            let finalTotal = 0;

            // 2. تحديث المخزون والفاتورة (Transaction 1)
            await db.transaction('rw', [db.invoices, db.invoice_items, db.products, db.stock_movements], async () => {
                for (let item of editingItems) {
                    const original = await db.invoice_items.get(item.id);
                    const diff = item.qty - (original ? original.qty : 0);
                    const prod = await db.products.get(item.product_id);
                    
                    if (prod) {
                        const newStock = Math.max(0, (Number(prod.stock_qty) || 0) + diff);
                        await db.products.update(prod.id, { stock_qty: newStock });
                    }

                    await db.invoice_items.update(item.id, { 
                        qty: item.qty, 
                        total_item: item.qty * item.price 
                    });

                    if (activeInvoice.invoice_number) {
                        const movement = await db.stock_movements
                            .where('ref_id').equals(activeInvoice.invoice_number)
                            .filter(m => m.product_id === item.product_id)
                            .first();
                        if (movement) {
                            await db.stock_movements.update(movement.id, { qty: item.qty });
                        }
                    }

                    finalTotal += (item.qty * item.price);
                }

                await db.invoices.update(activeInvoice.id, { total: finalTotal, status: newStatus });
            });

            // 3. المحاسبة المضمونة: حذف القيد القديم + إنشاء قيد جديد محدث فوراً
            const invNo = activeInvoice.invoice_number;
            if (window.JournalManager && invNo) {
                // أ. حذف القيد القديم وعكس أثره المالي
                if (typeof window.JournalManager.deleteEntryByRef === 'function') {
                    await window.JournalManager.deleteEntryByRef(invNo);
                }

                // ب. تسجيل القيد الجديد بالقيم المحدثة
                if (typeof window.JournalManager.recordPurchaseInvoice === 'function') {
                    await window.JournalManager.recordPurchaseInvoice(
                        invNo,
                        finalTotal,
                        activeInvoice.method || 'CASH',
                        newStatus,
                        activeInvoice.customer_vendor_name || 'مورد عام',
                        activeInvoice.date || new Date().toISOString()
                    );
                } else if (typeof window.JournalManager.createEntry === 'function') {
                    // بديل أمان احتياطي (Fallback)
                    const cashId = await window.JournalManager.getOrCreateAccount('الصندوق', 'asset', '1001');
                    const bankId = await window.JournalManager.getOrCreateAccount('البنك', 'asset', '1002');
                    const apId = await window.JournalManager.getOrCreateAccount('موردين دائنون', 'liability', '2001');
                    const invId = await window.JournalManager.getOrCreateAccount('المخزون', 'asset', '6001');

                    let creditId = (newStatus === 'pending') ? apId : (activeInvoice.method === 'CARD' ? bankId : cashId);
                    const desc = `فاتورة مشتريات معدلة (${activeInvoice.customer_vendor_name || 'مورد عام'}) - ${invNo}`;

                    await window.JournalManager.createEntry(
                        { 
                            type: 'PURCHASE', 
                            description: desc, 
                            ref_no: invNo, 
                            date: activeInvoice.date || new Date().toISOString() 
                        },
                        [
                            { account_id: invId, debit: finalTotal, credit: 0 },
                            { account_id: creditId, debit: 0, credit: finalTotal }
                        ]
                    );
                }
            }

            Swal.fire({
                icon: 'success', 
                title: 'تم الحفظ والتسوية', 
                text: 'تم تعديل كميات الفاتورة، وتسوية المخزن والقيود المحاسبية بنجاح.', 
                timer: 1800, 
                showConfirmButton: false, 
                customClass: {popup: 'rounded-3xl'}
            });

            closeDetails();
            loadPurchasesData();

        } catch (e) { 
            Swal.fire({icon: 'error', title: 'خطأ', text: e.message});
        }
    };

    // =========================================================================
    // حذف فاتورة المشتريات بالكامل وعكس القيود والمخزن عبر JournalManager
    // =========================================================================
    const deleteInvoice = async () => {
        if (!activeInvoice) return;
        const res = await Swal.fire({
            title: 'تأكيد الحذف؟', 
            text: "سيتم خصم هذه البضاعة من المخزن وعكس أثر القيد المحاسبي بالكامل.", 
            icon: 'warning',
            showCancelButton: true, 
            confirmButtonColor: '#e11d48', 
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'نعم، احذف', 
            cancelButtonText: 'تراجع',
            customClass: {popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold', cancelButton: 'rounded-xl font-bold'}
        });

        if (!res.isConfirmed) return;

        try {
            const db = dbRef.current;
            const invNo = activeInvoice.invoice_number;

            // 1. خصم البضاعة من المخزن وحذف الفاتورة
            await db.transaction('rw', [db.invoices, db.invoice_items, db.products, db.stock_movements], async () => {
                const items = await db.invoice_items.where('invoice_id').equals(activeInvoice.id).toArray();
                
                for (const item of items) {
                    const p = await db.products.get(item.product_id);
                    if (p) {
                        await db.products.update(p.id, { 
                            stock_qty: Math.max(0, Number(p.stock_qty) - Number(item.qty)) 
                        });
                    }
                }

                await db.invoice_items.where('invoice_id').equals(activeInvoice.id).delete();
                if (invNo) await db.stock_movements.where('ref_id').equals(invNo).delete();
                await db.invoices.delete(activeInvoice.id);
            });
            
            // 2. عكس القيد المحاسبي وتعديل أرصدة الحسابات تلقائياً
            if (window.JournalManager && invNo && typeof window.JournalManager.deleteEntryByRef === 'function') {
                await window.JournalManager.deleteEntryByRef(invNo);
            }
            
            Swal.fire({
                icon: 'success', 
                title: 'تم الحذف', 
                text: 'تمت تسوية المخزن وعكس الدفاتر المحاسبية بنجاح', 
                timer: 1500, 
                showConfirmButton: false, 
                customClass: {popup: 'rounded-3xl'}
            });

            closeDetails();
            loadPurchasesData();

        } catch (e) { 
            Swal.fire({icon: 'error', title: 'خطأ', text: e.message}); 
        }
    };

    // --- Exports & Print ---
    const exportToExcel = () => {
        if(filteredPurchases.length === 0 || typeof window.XLSX === 'undefined') return;
        const excelData = filteredPurchases.map(inv => ({
            "رقم الفاتورة": inv.invoice_number,
            "التاريخ": String(inv.date).substring(0, 16).replace('T', ' '),
            "المورد": inv.customer_vendor_name || 'نقدي',
            "الإجمالي": Number(inv.total),
            "الحالة": inv.status === 'paid' ? 'مدفوعة' : 'آجلة'
        }));
        const ws = window.XLSX.utils.json_to_sheet(excelData);
        if(!ws['!views']) ws['!views'] = [];
        ws['!views'].push({rightToLeft: true});
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "المشتريات");
        window.XLSX.writeFile(wb, `مشتريات_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportToPDF = () => {
        if(filteredPurchases.length === 0) return;
        let totalAmount = filteredPurchases.reduce((acc, curr) => acc + Number(curr.total), 0);
        let unpaidAmount = filteredPurchases.filter(i => i.status !== 'paid').reduce((acc, curr) => acc + Number(curr.total), 0);

        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write(`
            <html dir="rtl" lang="ar"><head><title>تقرير المشتريات</title><style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
            body { font-family: 'Cairo', sans-serif; padding: 20px; color: #1e293b; }
            h2 { color: #e11d48; font-size: 20px; text-align: center; font-weight: 900;}
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { padding: 8px; border: 1px solid #cbd5e1; text-align: right; }
            th { background-color: #f8fafc; font-weight: bold;}
            .summary { margin-top:20px; display: flex; justify-content: space-between; background: #fff1f2; padding: 10px; border-radius: 5px; font-weight: bold; }
            </style></head><body>
            <h2>سجل المشتريات والموردين</h2>
            <table><thead><tr><th>الفاتورة</th><th>التاريخ</th><th>المورد</th><th>الحالة</th><th>الإجمالي</th></tr></thead><tbody>
            ${filteredPurchases.map(inv => `<tr><td>${inv.invoice_number}</td><td>${String(inv.date).substring(0, 10)}</td><td>${inv.customer_vendor_name || 'نقدي'}</td><td>${inv.status === 'paid' ? 'مدفوعة' : 'آجلة'}</td><td dir="ltr">${Number(inv.total).toFixed(2)}</td></tr>`).join('')}
            </tbody></table>
            <div class="summary"><span>المشتريات: ${totalAmount.toLocaleString()} ج.م</span><span>الديون (الآجل): ${unpaidAmount.toLocaleString()} ج.م</span></div>
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
                    <title>فاتورة مشتريات #${activeInvoice.invoice_number}</title>
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
                            <p>فاتورة مشتريات مورد</p>
                        </div>
                        <div class="info-box">
                            <div><span>رقم الفاتورة:</span> <strong>#${activeInvoice.invoice_number}</strong></div>
                            <div><span>التاريخ:</span> <strong>${String(activeInvoice.date).substring(0, 16).replace('T', ' ')}</strong></div>
                            <div><span>المورد:</span> <strong>${activeInvoice.customer_vendor_name || 'مورد عام'}</strong></div>
                            <div><span>الدفع:</span> <strong>${activeInvoice.status === 'paid' ? 'مسدد (كاش)' : 'آجل (دين)'}</strong></div>
                        </div>
                        <table>
                            <thead><tr><th>الصنف</th><th>العدد</th><th>التكلفة</th><th>الإجمالي</th></tr></thead>
                            <tbody>
                                ${editingItems.map(item => `<tr><td>${item.product_name}</td><td>${item.qty}</td><td>${Number(item.price).toLocaleString()}</td><td>${(item.qty * item.price).toLocaleString()}</td></tr>`).join('')}
                            </tbody>
                        </table>
                        <div class="summary">
                            <div class="summary-row final-total">
                                <span>إجمالي الفاتورة:</span>
                                <span>${Number(finalTotal).toLocaleString()} ج.م</span>
                            </div>
                        </div>
                        <div class="footer"><p>نسخة للتوثيق المالي والمخزني</p></div>
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
                    <h3 className="font-black text-slate-800 text-sm"><i className="fas fa-chart-pie text-rose-500 ml-2"></i> المنتجات المشتراة</h3>
                    <button 
                        onClick={() => { setProductSortDesc(!productSortDesc); setProductPage(0); }}
                        className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                    >
                        {productSortDesc ? <><i className="fas fa-sort-amount-down ml-1"></i> الأكثر شراءً</> : <><i className="fas fa-sort-amount-up ml-1"></i> الأقل شراءً</>}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pagedProducts.length === 0 ? (
                        <div className="col-span-3 text-center py-10 text-slate-400">لا توجد مشتريات في هذه الفترة</div>
                    ) : (
                        pagedProducts.map((p, idx) => (
                            <div key={p.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-[3rem] -z-0"></div>
                                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-lg"><i className="fas fa-box"></i></div>
                                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg text-[10px] font-black">#{start + idx + 1}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-base mb-1">{p.name}</h4>
                                        <p className="text-xs font-bold text-slate-500">الكمية المشتراة: <span className="text-rose-600 text-sm font-mono">{p.qty}</span> وحدة</p>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">إجمالي التكلفة</p>
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
                            <div className="px-4 py-2 min-w-[70px] text-center"><span className="font-black text-sm text-rose-600">{productPage + 1}</span></div>
                            <button onClick={() => setProductPage(prev => Math.min(lastPage, prev + 1))} disabled={productPage >= lastPage} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"><i className="fas fa-chevron-left text-sm"></i></button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div ref={containerRef} tabIndex="-1" className="pb-24 px-2 md:px-0 text-right font-sans outline-none" dir="rtl" style={{ WebkitTapHighlightColor: 'transparent' }}>
            
            {!isDetailsOpen ? (
                <div className="animate-view">
                    <PurchasesReportHeader exportToExcel={exportToExcel} exportToPDF={exportToPDF} />
                    
                    <PurchasesReportStats filteredPurchases={filteredPurchases} />

                    <PurchasesReportFilter 
                        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                        dateFilter={dateFilter} setDateFilter={setDateFilter}
                        exportToExcel={exportToExcel} exportToPDF={exportToPDF}
                    />

                    {/* شريط التبويبات Tabs */}
                    <div className="flex bg-white p-1.5 rounded-[1rem] shadow-sm border border-slate-100 mb-6 overflow-x-auto hide-scrollbar snap-x">
                        <button onClick={()=>setActiveTab(0)} className={`flex-1 min-w-[100px] px-3 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all snap-center ${activeTab === 0 ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}>شراء كاش</button>
                        <button onClick={()=>setActiveTab(1)} className={`flex-1 min-w-[100px] px-3 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all snap-center ${activeTab === 1 ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-50'}`}>شراء آجل</button>
                        <button onClick={()=>setActiveTab(2)} className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all snap-center ${activeTab === 2 ? 'bg-purple-50 text-purple-600' : 'text-slate-500 hover:bg-slate-50'}`}>حركة المشتريات</button>
                    </div>

                    {/* محتوى التبويبات */}
                    {activeTab === 0 && (
                        <PurchasesReportList 
                            filteredPurchases={filteredPurchases.filter(s => s.status === 'paid')} 
                            currentPage={currentPage} setCurrentPage={setCurrentPage} 
                            itemsPerPage={itemsPerPage} openDetails={openDetails} 
                        />
                    )}

                    {activeTab === 1 && (
                        <PurchasesReportList 
                            filteredPurchases={filteredPurchases.filter(s => s.status !== 'paid')} 
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
                    <PurchasesReportDetails 
                        invoice={activeInvoice} items={editingItems} 
                        onClose={closeDetails} adjustQty={adjustQty}
                        saveSmartEdit={saveSmartEdit} deleteInvoice={deleteInvoice}
                        printSingleInvoice={printSingleInvoice}
                    />
                </div>
            )}
            
        </div>
    );
};