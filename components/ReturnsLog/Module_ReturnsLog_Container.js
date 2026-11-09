// المسار: components/ReturnsLog/Module_ReturnsLog_Container.js
window.Module_ReturnsLog_Container = function() {
    const { useState, useEffect, useRef, useMemo } = React;
    const { ReturnsLogHeader, ReturnsLogStats, ReturnsLogFilter, ReturnsLogList, ReturnsLogDetails } = window;

    const containerRef = useRef(null);

    const pad = n => n < 10 ? '0'+n : n;
    const d = new Date();
    const defaultStart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
    const defaultEnd = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    // --- States ---
    const [returnsData, setReturnsData] = useState([]);
    const [filteredReturns, setFilteredReturns] = useState([]);
    const [itemsData, setItemsData] = useState([]); 
    const [allProducts, setAllProducts] = useState([]); 
    
    const [filters, setFilters] = useState({ search: '', fromDate: defaultStart, toDate: defaultEnd });
    const [currentPage, setCurrentPage] = useState(0); 
    const itemsPerPage = 3; 

    // تبويبات إحصائيات المنتجات
    const [activeTab, setActiveTab] = useState(0); 
    const [productStats, setProductStats] = useState([]);
    const [productPage, setProductPage] = useState(0);
    const [productSortDesc, setProductSortDesc] = useState(true); 

    const [selectedInvoice, setSelectedInvoice] = useState(null);
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
    }, [activeTab, selectedInvoice]);

    // تهيئة قاعدة البيانات المحلية
    const initDB = () => {
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
        return db;
    };

    const fetchData = async () => {
        try {
            const db = dbRef.current || initDB();
            const allReturns = await db.invoices.where('type').equalsIgnoreCase('RETURN_SALE').reverse().toArray();
            const invIds = allReturns.map(r => r.id);
            const allItems = await db.invoice_items.where('invoice_id').anyOf(invIds).toArray();
            const prods = await db.products.toArray(); 

            setReturnsData(allReturns);
            setItemsData(allItems);
            setAllProducts(prods);
        } catch (e) { 
            console.error("Database Fetch Error:", e); 
        }
    };

    useEffect(() => { 
        initDB();
        fetchData(); 
    }, []);

    // فلترة البيانات وحساب إحصائيات المنتجات المرتجعة
    useEffect(() => {
        const filtered = returnsData.filter(inv => {
            const dateStr = String(inv.date).substring(0, 10);
            const dateMatch = (dateStr >= filters.fromDate && dateStr <= filters.toDate);
            const searchMatch = inv.invoice_number.toLowerCase().includes(filters.search.toLowerCase()) || 
                                (inv.customer_vendor_name && inv.customer_vendor_name.toLowerCase().includes(filters.search.toLowerCase()));
            return dateMatch && searchMatch;
        });
        
        setFilteredReturns(filtered);
        setCurrentPage(0); 
        setProductPage(0);

        const invoiceIds = new Set(filtered.map(i => i.id));
        const filteredItems = itemsData.filter(item => invoiceIds.has(item.invoice_id));
        
        const counts = {};
        filteredItems.forEach(item => {
            if(!counts[item.product_id]) counts[item.product_id] = { id: item.product_id, qty: 0, total: 0 };
            const qty = Math.abs(Number(item.qty));
            const price = Math.abs(Number(item.price));
            counts[item.product_id].qty += qty;
            counts[item.product_id].total += (qty * price);
        });

        const prodArr = Object.values(counts).map(c => {
            const p = allProducts.find(prod => prod.id === c.id);
            return { ...c, name: p ? p.name_ar : 'منتج محذوف' };
        });

        setProductStats(prodArr);

    }, [returnsData, itemsData, allProducts, filters]);

    const stats = useMemo(() => {
        let totalRefunded = 0;
        let totalItemsQty = 0;
        
        filteredReturns.forEach(inv => {
            totalRefunded += Math.abs(parseFloat(inv.total) || 0);
            const items = itemsData.filter(i => i.invoice_id === inv.id);
            items.forEach(item => { totalItemsQty += Math.abs(item.qty); });
        });

        return { totalRefunded, returnsCount: filteredReturns.length, totalItemsQty };
    }, [filteredReturns, itemsData]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleItemClick = async (invoice) => {
        try {
            const db = dbRef.current;
            const items = await db.invoice_items.where('invoice_id').equals(invoice.id).toArray();
            
            for (let itm of items) {
                if (!itm.product_name) {
                    const p = await db.products.get(itm.product_id);
                    itm.product_name = p ? p.name_ar : 'صنف مجهول';
                }
                itm.qty = Math.abs(Number(itm.qty) || 0);
                itm.price = Math.abs(Number(itm.price) || 0);
                itm.total_item = itm.qty * itm.price;
            }

            setSelectedInvoice(invoice);
            setEditingItems(JSON.parse(JSON.stringify(items)));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) { 
            console.error(e); 
        }
    };

    const adjustQty = (idx, amount) => {
        const newItems = [...editingItems];
        newItems[idx].qty = Math.max(0, newItems[idx].qty + amount);
        newItems[idx].total_item = newItems[idx].qty * newItems[idx].price;
        setEditingItems(newItems);
    };

    // =========================================================================
    // التعديل الذكي: يحذف القيد القديم ويضيف قيداً جديداً محدثاً فوراً!
    // =========================================================================
    const saveSmartEdit = async (newMethod) => {
        if (!selectedInvoice) return;
        const db = dbRef.current;

        try {
            // 1. التحقق من رصيد المخزن قبل السماح بالتعديل
            for (let item of editingItems) {
                const original = await db.invoice_items.get(item.id);
                if (original) {
                    const originalQty = Math.abs(original.qty);
                    const diff = item.qty - originalQty; 
                    const prod = await db.products.get(item.product_id);

                    if (prod && diff < 0 && (Number(prod.stock_qty) || 0) < Math.abs(diff)) {
                        Swal.fire({
                            icon: 'error',
                            title: 'رصيد المخزن لا يكفي للتعديل',
                            text: `المتاح من ${item.product_name} بالمخزن هو ${prod.stock_qty} فقط، لا يمكن سحب ${Math.abs(diff)} قطعة.`,
                            customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold' }
                        });
                        return;
                    }
                }
            }

            let finalTotal = 0;
            let totalCostReturned = 0;

            // 2. تحديث المخزون والفواتير
            await db.transaction('rw', [db.invoices, db.invoice_items, db.products, db.stock_movements], async () => {
                for (let item of editingItems) {
                    const original = await db.invoice_items.get(item.id);
                    const originalQty = original ? Math.abs(original.qty) : 0;
                    const diff = item.qty - originalQty; 
                    const prod = await db.products.get(item.product_id);

                    if (prod) {
                        const newStock = Math.max(0, (Number(prod.stock_qty) || 0) + diff);
                        await db.products.update(prod.id, { stock_qty: newStock });
                        const unitCost = Number(prod.cost) || 0;
                        totalCostReturned += (unitCost * item.qty);
                    }

                    await db.invoice_items.update(item.id, { 
                        qty: item.qty, 
                        total_item: -(item.qty * item.price)
                    });

                    if (selectedInvoice.invoice_number) {
                        const movement = await db.stock_movements
                            .where('ref_id')
                            .equals(selectedInvoice.invoice_number)
                            .filter(m => m.product_id === item.product_id)
                            .first();
                        if (movement) {
                            await db.stock_movements.update(movement.id, { qty: item.qty });
                        }
                    }

                    finalTotal += (item.qty * item.price);
                }

                await db.invoices.update(selectedInvoice.id, { 
                    total: -finalTotal, 
                    method: newMethod 
                });
            });

            // 3. المحاسبة المضمونة: حذف القيد القديم + إنشاء قيد جديد محدث فوراً
            const invNo = selectedInvoice.invoice_number;
            if (window.JournalManager && invNo) {
                
                // أ. حذف القيد القديم وعكس أثره المالي
                if (typeof window.JournalManager.deleteEntryByRef === 'function') {
                    await window.JournalManager.deleteEntryByRef(invNo);
                }

                // ب. إنشاء القيد الجديد المحدث فوراً
                if (typeof window.JournalManager.recordReturnInvoice === 'function') {
                    await window.JournalManager.recordReturnInvoice(
                        invNo,
                        finalTotal,
                        totalCostReturned,
                        newMethod || selectedInvoice.method || 'CASH',
                        selectedInvoice.customer_vendor_name || 'عميل (مرتجع)',
                        selectedInvoice.date || new Date().toISOString()
                    );
                } else if (typeof window.JournalManager.createEntry === 'function') {
                    // كود أمان احتياطي (Fallback) يضمن إنشاء القيد الجديد حتى لو لم تتحدث دالة recordReturnInvoice في المتصفح!
                    const cashId = await window.JournalManager.getOrCreateAccount('الصندوق', 'asset', '1001');
                    const bankId = await window.JournalManager.getOrCreateAccount('البنك', 'asset', '1002');
                    const arId = await window.JournalManager.getOrCreateAccount('عملاء مدينون', 'asset', '1003');
                    const salesId = await window.JournalManager.getOrCreateAccount('إيرادات المبيعات', 'income', '4001');
                    const cogsId = await window.JournalManager.getOrCreateAccount('تكلفة البضاعة المباعة', 'expense', '5001');
                    const invId = await window.JournalManager.getOrCreateAccount('المخزون', 'asset', '6001');

                    let creditId = cashId;
                    const m = String(newMethod || selectedInvoice.method || 'CASH').toUpperCase();
                    if (m === 'NETWORK' || m === 'CARD') creditId = bankId;
                    else if (m === 'PENDING') creditId = arId;

                    const items = [
                        { account_id: salesId, debit: finalTotal, credit: 0 },
                        { account_id: creditId, debit: 0, credit: finalTotal }
                    ];

                    if (totalCostReturned > 0) {
                        items.push({ account_id: invId, debit: totalCostReturned, credit: 0 });
                        items.push({ account_id: cogsId, debit: 0, credit: totalCostReturned });
                    }

                    await window.JournalManager.createEntry(
                        {
                            type: 'RETURN_SALE',
                            description: `قيد مرتجع مبيعات معدل - فاتورة #${invNo}`,
                            ref_no: invNo,
                            date: selectedInvoice.date || new Date().toISOString()
                        },
                        items
                    );
                }
            }

            Swal.fire({
                icon: 'success', 
                title: 'تم تعديل الفاتورة والقيد', 
                text: 'تم تحديث كميات المخزن وحذف القيد القديم وتسجيل قيد جديد محدث بنجاح.',
                timer: 1800, 
                showConfirmButton: false, 
                customClass: { popup: 'rounded-3xl' }
            });

            setSelectedInvoice(null);
            setEditingItems([]);
            fetchData();

        } catch (e) {
            Swal.fire({ icon: 'error', title: 'خطأ أثناء التعديل', text: e.message });
        }
    };

    // =========================================================================
    // إلغاء وحذف حركة المرتجع بالكامل عبر JournalManager
    // =========================================================================
    const handleVoidReturn = async (id) => {
        const res = await window.Swal.fire({
            title: 'حذف حركة المرتجع بالكامل؟',
            text: 'سيتم سحب البضاعة من المخزن، وعكس القيود المحاسبية وإرجاع أرصدة الحسابات لما كانت عليه.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#94a3b8',
            cancelButtonText: 'تراجع',
            confirmButtonText: 'نعم، احذف نهائياً',
            customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold', cancelButton: 'rounded-xl font-bold' }
        });
        
        if (!res.isConfirmed) return;
        
        try {
            const db = dbRef.current;
            const inv = await db.invoices.get(id);
            const invNo = inv ? inv.invoice_number : null;

            // 1. إعادة سحب البضاعة من المخزن وحذف الفاتورة
            await db.transaction('rw', [db.invoices, db.invoice_items, db.products, db.stock_movements], async () => {
                const items = await db.invoice_items.where('invoice_id').equals(id).toArray();

                for (let item of items) {
                    const prod = await db.products.get(item.product_id);
                    if (prod) {
                        const newStock = Math.max(0, (Number(prod.stock_qty) || 0) - Math.abs(item.qty));
                        await db.products.update(prod.id, { stock_qty: newStock });
                    }
                }
                
                await db.invoice_items.where('invoice_id').equals(id).delete();
                if (invNo) await db.stock_movements.where('ref_id').equals(invNo).delete();
                await db.invoices.delete(id);
            });
            
            // 2. عكس القيد المحاسبي بالكامل وحذفه عبر JournalManager
            if (window.JournalManager && invNo && typeof window.JournalManager.deleteEntryByRef === 'function') {
                await window.JournalManager.deleteEntryByRef(invNo);
            }
            
            window.Swal.fire({
                icon: 'success', 
                title: 'تم الحذف والتسوية', 
                text: 'تم إلغاء المرتجع، وتسوية أرصدة الحسابات والمخزن بالكامل.', 
                timer: 2000, 
                showConfirmButton: false, 
                customClass: { popup: 'rounded-3xl' }
            });

            setSelectedInvoice(null);
            setEditingItems([]);
            fetchData();
        } catch (e) { 
            window.Swal.fire({ icon: 'error', title: 'خطأ', text: e.message }); 
        }
    };

    // الطباعة وتصدير الإكسيل و PDF
    const handlePrint = async (invoice, items) => {
        try {
            const db = dbRef.current;
            let shopName = "Mentra ERP", shopPhone = "";
            const setting = await db.settings.get(1);
            if(setting) { shopName = setting.shop_name || shopName; shopPhone = setting.phone || ""; }

            const dateStr = String(invoice.date).substring(0, 16).replace('T', ' ');
            const finalRefund = items.reduce((s, i) => s + (i.qty * i.price), 0);
            
            let printWin = window.open('', '_blank');
            let html = `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8"><title>إيصال مرتجع #${invoice.invoice_number}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                        body { font-family: 'Cairo', sans-serif; padding: 10px; color: #000; margin: 0; background: #fff; font-size: 12px; }
                        .receipt-container { max-width: 80mm; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .header h2 { margin: 0 0 5px 0; font-size: 20px; font-weight: 900; }
                        .return-badge { display: inline-block; background: #000; color: #fff; padding: 2px 8px; border-radius: 4px; margin-top: 5px; font-weight:bold; }
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
                        <div class="header"><h2>${shopName}</h2>${shopPhone ? `<p>تليفون: ${shopPhone}</p>` : ''}<div class="return-badge">إيصال مرتجع مبيعات</div></div>
                        <div class="info-box">
                            <div><span>رقم الإيصال:</span> <strong>#${invoice.invoice_number}</strong></div>
                            <div><span>التاريخ:</span> <strong>${dateStr}</strong></div>
                            <div><span>العميل:</span> <strong>${invoice.customer_vendor_name || 'عميل نقدي'}</strong></div>
                            <div><span>طريقة الرد:</span> <strong>${invoice.method === 'NETWORK' ? 'شبكة (بطاقة)' : invoice.method === 'PENDING' ? 'آجل' : 'نقدي (كاش)'}</strong></div>
                        </div>
                        <table>
                            <thead><tr><th>الصنف</th><th>العدد</th><th>السعر</th><th>الإجمالي</th></tr></thead>
                            <tbody>
                                ${items.map(item => `<tr><td>${item.product_name || 'صنف مجهول'}</td><td align="center">${item.qty}</td><td align="left">${Number(item.price).toLocaleString()}</td><td align="left">${(item.qty * item.price).toLocaleString()}</td></tr>`).join('')}
                            </tbody>
                        </table>
                        <div class="summary">
                            <div class="summary-row"><span>إجمالي القطع المستردة:</span><span>${items.reduce((sum, item) => sum + item.qty, 0)} قطعة</span></div>
                            <div class="summary-row final-total"><span>المبلغ المسترد للعميل:</span><span>${finalRefund.toLocaleString()} ج.م</span></div>
                        </div>
                        <div class="footer"><p>تم تسوية البضاعة بالمخزن</p></div>
                    </div>
                    <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
                </body>
                </html>
            `;
            printWin.document.write(html);
            printWin.document.close();
        } catch(e) { console.error(e); }
    };

    const handleExportExcel = () => {
        if(filteredReturns.length === 0 || typeof window.XLSX === 'undefined') return;
        const excelData = filteredReturns.map(inv => ({
            "رقم المرتجع": inv.invoice_number,
            "التاريخ": String(inv.date).substring(0, 16).replace('T', ' '),
            "العميل": inv.customer_vendor_name || 'عميل نقدي',
            "القيمة المردودة": Math.abs(Number(inv.total))
        }));
        const ws = window.XLSX.utils.json_to_sheet(excelData);
        if(!ws['!views']) ws['!views'] = [];
        ws['!views'].push({rightToLeft: true});
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "المرتجعات");
        window.XLSX.writeFile(wb, `سجل_المرتجعات_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleExportPDF = () => {
        if(filteredReturns.length === 0) return;
        let totalAmount = filteredReturns.reduce((acc, curr) => acc + Math.abs(Number(curr.total)), 0);

        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write(`
            <html dir="rtl" lang="ar"><head><title>تقرير المرتجعات</title><style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
            body { font-family: 'Cairo', sans-serif; padding: 20px; color: #1e293b; }
            h2 { color: #f59e0b; font-size: 20px; text-align: center; font-weight: 900;}
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { padding: 8px; border: 1px solid #cbd5e1; text-align: right; }
            th { background-color: #f8fafc; font-weight: bold;}
            .summary { margin-top:20px; display: flex; justify-content: space-between; background: #fffbeb; padding: 10px; border-radius: 5px; font-weight: bold; }
            </style></head><body>
            <h2>سجل مرتجعات المبيعات</h2>
            <table><thead><tr><th>رقم المرتجع</th><th>التاريخ</th><th>العميل</th><th>القيمة المردودة</th></tr></thead><tbody>
            ${filteredReturns.map(inv => `<tr><td>${inv.invoice_number}</td><td>${String(inv.date).substring(0, 10)}</td><td>${inv.customer_vendor_name || 'نقدي'}</td><td dir="ltr">${Math.abs(Number(inv.total)).toFixed(2)}</td></tr>`).join('')}
            </tbody></table>
            <div class="summary"><span>المردودات: ${filteredReturns.length} فاتورة</span><span>إجمالي الأموال المردودة: ${totalAmount.toLocaleString()} ج.م</span></div>
            <script> window.onload = function() { setTimeout(()=> {window.print(); window.close();}, 500); } </script>
            </body></html>
        `);
        printWindow.document.close();
    };

    // مكون بطاقات المنتجات المرتجعة (Tab 1)
    const RenderProductCards = () => {
        const sortedProducts = [...productStats].sort((a, b) => productSortDesc ? b.qty - a.qty : a.qty - b.qty);
        const start = productPage * itemsPerPage;
        const pagedProducts = sortedProducts.slice(start, start + itemsPerPage);
        const lastPage = Math.ceil(sortedProducts.length / itemsPerPage) - 1 || 0;

        return (
            <div className="animate-view">
                <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 text-sm"><i className="fas fa-chart-bar text-amber-500 ml-2"></i> إحصائيات المنتجات المرتجعة</h3>
                    <button 
                        onClick={() => { setProductSortDesc(!productSortDesc); setProductPage(0); }}
                        className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                    >
                        {productSortDesc ? <><i className="fas fa-sort-amount-down ml-1"></i> الأكثر إرجاعاً</> : <><i className="fas fa-sort-amount-up ml-1"></i> الأقل إرجاعاً</>}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pagedProducts.length === 0 ? (
                        <div className="col-span-3 text-center py-10 text-slate-400">لا توجد منتجات مرتجعة في هذه الفترة</div>
                    ) : (
                        pagedProducts.map((p, idx) => (
                            <div key={p.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-[3rem] -z-0"></div>
                                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-lg"><i className="fas fa-undo-alt"></i></div>
                                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg text-[10px] font-black">#{start + idx + 1}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-base mb-1">{p.name}</h4>
                                        <p className="text-xs font-bold text-slate-500">الكمية المرتجعة: <span className="text-amber-600 text-sm font-mono">{p.qty}</span> وحدة</p>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">القيمة المستردة للعملاء</p>
                                        <p className="font-black text-rose-600 text-lg font-mono">{p.total.toLocaleString()} ج.م</p>
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
                            <div className="px-4 py-2 min-w-[70px] text-center"><span className="font-black text-sm text-amber-600">{productPage + 1}</span></div>
                            <button onClick={() => setProductPage(prev => Math.min(lastPage, prev + 1))} disabled={productPage >= lastPage} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"><i className="fas fa-chevron-left text-sm"></i></button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div ref={containerRef} tabIndex="-1" className="pb-24 px-2 md:px-0 text-right font-sans outline-none" dir="rtl" style={{ WebkitTapHighlightColor: 'transparent' }}>
            
            {!selectedInvoice ? (
                <div className="animate-view">
                    <ReturnsLogHeader onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} />
                    <ReturnsLogStats stats={stats} />
                    <ReturnsLogFilter 
                        filters={filters} 
                        onFilterChange={handleFilterChange} 
                        onExportExcel={handleExportExcel} 
                        onExportPDF={handleExportPDF} 
                    />

                    {/* شريط التبويبات Tabs */}
                    <div className="flex bg-white p-1.5 rounded-[1rem] shadow-sm border border-slate-100 mb-6 overflow-x-auto hide-scrollbar snap-x">
                        <button onClick={()=>setActiveTab(0)} className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all snap-center ${activeTab === 0 ? 'bg-amber-50 text-amber-600' : 'text-slate-500 hover:bg-slate-50'}`}>قائمة المرتجعات</button>
                        <button onClick={()=>setActiveTab(1)} className={`flex-1 min-w-[150px] px-3 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all snap-center ${activeTab === 1 ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-50'}`}>المنتجات الأكثر إرجاعاً</button>
                    </div>

                    {/* محتوى التبويبات */}
                    {activeTab === 0 && (
                        <ReturnsLogList 
                            filteredReturns={filteredReturns} 
                            currentPage={currentPage} 
                            setCurrentPage={setCurrentPage} 
                            itemsPerPage={itemsPerPage} 
                            openDetails={handleItemClick} 
                        />
                    )}

                    {activeTab === 1 && (
                        <RenderProductCards />
                    )}

                </div>
            ) : (
                <div className="animate-slideInRight">
                    <ReturnsLogDetails 
                        invoice={selectedInvoice} 
                        items={editingItems} 
                        onClose={() => { setSelectedInvoice(null); setEditingItems([]); }} 
                        onPrint={() => handlePrint(selectedInvoice, editingItems)} 
                        adjustQty={adjustQty}
                        saveSmartEdit={saveSmartEdit}
                        deleteInvoice={() => handleVoidReturn(selectedInvoice.id)} 
                    />
                </div>
            )}
            
        </div>
    );
};