
// المسار: components/Purchases/Module_Purchases_Container.js
window.Module_Purchases_Container = function() {
    const { useState, useEffect } = React;
    const { PurchasesHeader, PurchasesSearch, PurchasesInputCard, PurchasesCart, PurchasesBottomBar } = window;

    // States
    const [invoiceNo, setInvoiceNo] = useState(`PUR-${Math.floor(Math.random()*900000)}`);
    const [stats, setStats] = useState({ todayPurchases: 0, lowStockCount: 0 });
    const [allProducts, setAllProducts] = useState([]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [hideResults, setHideResults] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cart, setCart] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState('paid');
    const [vendorName, setVendorName] = useState(''); // تمت إضافة اسم المورد ليكون كاشير متكامل

    const totalCart = cart.reduce((acc, curr) => acc + curr.total, 0);

    // ستايلات الموبايل و الـ POS Layout الإضافية
    useEffect(() => {
        if (!document.getElementById('purchases-custom-styles')) {
            const style = document.createElement('style');
            style.id = 'purchases-custom-styles';
            style.innerHTML = `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .pb-safe { padding-bottom: env(safe-area-inset-bottom, 10px); }
                /* لمنع السكرول في الشاشة الرئيسية والسماح به داخل القوائم فقط */
                body { overflow: hidden; }
                .pos-layout { height: calc(100vh - 80px); }
                @media (max-width: 1023px) { 
                    body { overflow: auto; } 
                    .pos-layout { height: auto; min-height: 100vh; padding-bottom: 80px; }
                }
            `;
            document.head.appendChild(style);
        }
        return () => { document.body.style.overflow = 'auto'; } // تنظيف عند الخروج
    }, []);

    const vibrate = (type = 'click') => {
        if (navigator.vibrate) {
            if (type === 'success') navigator.vibrate([100, 50, 100]);
            else if (type === 'error' || type === 'delete') navigator.vibrate([50, 50]);
            else navigator.vibrate(20);
        }
    };

    const initData = async () => {
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({
                products: '++id, name_ar, sku, category, stock_qty, price, cost',
                invoices: '++id, invoice_number, type, customer_vendor_id, date, total, status',
                invoice_items: '++id, invoice_id, product_id, price, qty, total_item',
                accounts: '++id, code, name_ar, type, balance',
                journal: '++id, date, ref_no, description, total',
                journal_items: '++id, journal_id, account_id, debit, credit',
                stock_movements: '++id, product_id, type, qty, date, ref_id'
            });

            const defaultAccounts = [
                { code: '1001', name_ar: 'الصندوق', type: 'asset', balance: 0 },
                { code: '1002', name_ar: 'البنك', type: 'asset', balance: 0 },
                { code: '1003', name_ar: 'عملاء مدينون', type: 'asset', balance: 0 },
                { code: '2001', name_ar: 'موردين دائنون', type: 'liability', balance: 0 },
                { code: '3001', name_ar: 'رأس المال', type: 'equity', balance: 0 },
                { code: '4001', name_ar: 'إيرادات المبيعات', type: 'income', balance: 0 },
                { code: '5001', name_ar: 'تكلفة البضاعة المباعة', type: 'expense', balance: 0 },
                { code: '6001', name_ar: 'المخزون', type: 'asset', balance: 0 }
            ];

            for (const account of defaultAccounts) {
                const exists = await db.accounts.where('code').equals(account.code).count();
                if (exists === 0) await db.accounts.add(account);
            }

            const products = await db.products.toArray();
            setAllProducts(products);

            const invoices = await db.invoices.toArray();
            const today = new Date().toISOString().split('T')[0];
            const todayPurchases = invoices.filter(inv => inv.type === 'PURCHASE' && String(inv.date).startsWith(today));
            const totalToday = todayPurchases.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
            const lowStockCount = products.filter(p => p.stock_qty <= 5).length;

            setStats({ todayPurchases: totalToday, lowStockCount });
        } catch (e) { console.error(e); }
    };

    useEffect(() => { initData(); }, []);

    useEffect(() => {
        const val = searchTerm.trim().toLowerCase();
        if(!val) { setHideResults(true); return; }

        const filtered = allProducts.filter(p => 
            (p.name_ar && p.name_ar.toLowerCase().includes(val)) || 
            (p.sku && p.sku.toLowerCase().includes(val))
        ).slice(0, 8); // زيادة النتائج المعروضة قليلاً

        setSearchResults(filtered);
        setHideResults(false);
    }, [searchTerm, allProducts]);

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setSearchTerm('');
        setHideResults(true);
        vibrate('tap');
    };

    const handleAddToCart = (qty, cost) => {
        if(qty <= 0 || cost <= 0) {
            vibrate('error');
            window.Swal.fire({icon: 'error', title: 'خطأ', text: 'أدخل كمية وتكلفة صحيحة', toast: true, position: 'top', timer: 2000, showConfirmButton: false});
            return;
        }

        setCart(prev => {
            const existing = prev.find(i => i.productId === selectedProduct.id);
            if (existing) {
                return prev.map(i => i.productId === selectedProduct.id ? 
                    { ...i, qty: i.qty + qty, cost: cost, total: (i.qty + qty) * cost } : i);
            }
            return [{
                productId: selectedProduct.id,
                name: selectedProduct.name_ar,
                qty,
                cost,
                total: qty * cost
            }, ...prev];
        });

        vibrate('success');
        setSelectedProduct(null);
    };

    const handleRemoveItem = (productId) => {
        setCart(prev => prev.filter(i => i.productId !== productId));
        vibrate('delete');
    };

    const handleClearCart = async () => {
        if(cart.length === 0) return;
        const res = await window.Swal.fire({
            title: 'إفراغ الفاتورة؟', icon: 'warning', showCancelButton: true,
            confirmButtonText: 'نعم', cancelButtonText: 'تراجع', confirmButtonColor: '#ef4444',
            customClass: { popup: 'rounded-3xl' }
        });
        if(res.isConfirmed) {
            setCart([]);
            setSelectedProduct(null);
            setVendorName('');
            vibrate('delete');
        }
    };

    const handleSavePurchase = async () => {
        if (cart.length === 0) {
            vibrate('error');
            window.Swal.fire({icon: 'warning', title: 'الفاتورة فارغة!', toast: true, position: 'top', timer: 2000, showConfirmButton: false});
            return;
        }

        const confirmResult = await window.Swal.fire({
            title: 'تأكيد الترحيل؟',
            text: `ستتم إضافة الأصناف للمخزن بإجمالي ${totalCart.toLocaleString()} ج.م`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'نعم، قم بالترحيل',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#10b981',
            customClass: {popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold', cancelButton: 'rounded-xl font-bold'}
        });

        if (!confirmResult.isConfirmed) return;

        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({
                products: '++id, name_ar, sku, category, stock_qty, price, cost',
                invoices: '++id, invoice_number, type, customer_vendor_id, date, total, status',
                invoice_items: '++id, invoice_id, product_id, price, qty, total_item',
                accounts: '++id, code, name_ar, type, balance',
                journal: '++id, date, ref_no, description, total',
                journal_items: '++id, journal_id, account_id, debit, credit',
                stock_movements: '++id, product_id, type, qty, date, ref_id'
            });

            await db.transaction('rw', [db.invoices, db.invoice_items, db.products, db.journal, db.journal_items, db.accounts, db.stock_movements], async () => {
                const dateISO = new Date().toISOString();

                // 1. الفاتورة (مع إضافة اسم المورد)
                const invId = await db.invoices.add({
                    invoice_number: invoiceNo, type: 'PURCHASE', customer_vendor_name: vendorName || 'مورد عام', date: dateISO, total: totalCart, status: paymentStatus 
                });

                let totalCost = 0;

                // 2. تحديث المخزون وحفظ التفاصيل
                for (let item of cart) {
                    await db.invoice_items.add({
                        invoice_id: invId, product_id: item.productId, product_name: item.name,
                        qty: item.qty, price: item.cost, cost: item.cost, total_item: item.total, total_cost: item.total
                    });

                    const product = await db.products.get(Number(item.productId));
                    if (product) {
                        const newQty = (parseFloat(product.stock_qty) || 0) + item.qty;
                        await db.products.update(Number(item.productId), { stock_qty: newQty, cost: item.cost });
                        totalCost += item.total;
                    }

                    await db.stock_movements.add({
                        product_id: Number(item.productId), type: 'in', qty: item.qty, date: dateISO, ref_id: invoiceNo
                    });
                }

                // 3. القيود المحاسبية التلقائية
                const cashAccount = await db.accounts.where('code').equals('1001').first();
                const inventoryAccount = await db.accounts.where('code').equals('6001').first();
                const creditorsAccount = await db.accounts.where('code').equals('2001').first(); 

                if(!inventoryAccount) throw new Error('حساب المخزون غير موجود في الدليل');
                if(paymentStatus === 'paid' && !cashAccount) throw new Error('حساب الصندوق غير موجود');
                if(paymentStatus === 'pending' && !creditorsAccount) throw new Error('حساب الموردين الدائنين غير موجود');

                const journalDesc = vendorName ? `مشتريات من المورد: ${vendorName} - فاتورة ${invoiceNo}` : `مشتريات - فاتورة رقم ${invoiceNo}`;
                const journalId = await db.journal.add({ date: dateISO, ref_no: invoiceNo, description: journalDesc, total: totalCost, type: 'PURCHASE' });

                await db.journal_items.add({ journal_id: journalId, account_id: inventoryAccount.id, debit: totalCost, credit: 0, description: `إضافة للمخزن - ${invoiceNo}` });

                if (paymentStatus === 'paid') {
                    await db.journal_items.add({ journal_id: journalId, account_id: cashAccount.id, debit: 0, credit: totalCost, description: `مشتريات نقدية - ${invoiceNo}` });
                } else if (paymentStatus === 'pending') {
                    await db.journal_items.add({ journal_id: journalId, account_id: creditorsAccount.id, debit: 0, credit: totalCost, description: `مشتريات آجلة (مورد) - ${invoiceNo}` });
                }
            });

            // النجاح
            vibrate('success');
            await window.Swal.fire({
                icon: 'success', title: 'تم الترحيل بنجاح 🚀', text: 'تم تحديث المخزون وإنشاء القيود اليومية',
                timer: 2000, showConfirmButton: false, customClass: {popup: 'rounded-3xl'}
            });
            
            // إعادة التهيئة
            setCart([]);
            setSelectedProduct(null);
            setVendorName('');
            setInvoiceNo(`PUR-${Math.floor(Math.random()*900000)}`);
            initData();

        } catch (err) {
            console.error('Transaction Failed:', err);
            vibrate('error');
            window.Swal.fire({ icon: 'error', title: 'لم يكتمل الترحيل!', text: 'السبب: ' + err.message, customClass: {popup: 'rounded-3xl'} });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 p-2 lg:p-4 pos-layout bg-slate-50 font-sans animate-view" dir="rtl">
            
            {/* الجزء الأيمن: البحث وإدخال المشتريات (يأخذ المساحة الأكبر) */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto hide-scrollbar">
                <PurchasesHeader stats={stats} />
                
                <PurchasesSearch 
                    searchTerm={searchTerm} 
                    onSearchChange={setSearchTerm} 
                    searchResults={searchResults} 
                    onSelectProduct={handleSelectProduct} 
                    hideResults={hideResults} 
                />
                
                {selectedProduct ? (
                    <PurchasesInputCard 
                        product={selectedProduct} 
                        onAdd={handleAddToCart} 
                        onCancel={() => setSelectedProduct(null)} 
                    />
                ) : (
                    <div className="flex-1 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 min-h-[300px] shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <i className="fas fa-barcode text-4xl text-slate-300"></i>
                        </div>
                        <p className="font-black text-lg">جاهز لاستلام المشتريات</p>
                        <p className="text-xs font-bold text-slate-400 mt-2">ابحث عن الصنف بالأعلى لتسجيل الدخول</p>
                    </div>
                )}
            </div>

            {/* الجزء الأيسر: سلة المشتريات (POS Style Dark Mode) */}
            <div className="w-full lg:w-[400px] bg-[#0b1120] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden shrink-0 border border-slate-800">
                {/* هيدر السلة (رقم الفاتورة واسم المورد) */}
                <div className="p-4 md:p-5 border-b border-slate-800 bg-slate-900/50 space-y-3 shrink-0">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold text-sm"><i className="fas fa-file-invoice text-emerald-500 ml-1"></i> فاتورة مشتريات</span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg font-mono font-black text-xs">{invoiceNo}</span>
                    </div>
                    <div className="relative">
                        <i className="fas fa-truck absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
                        <input 
                            type="text" 
                            value={vendorName}
                            onChange={(e) => setVendorName(e.target.value)}
                            placeholder="اسم المورد (اختياري)..." 
                            className="w-full bg-slate-800/50 border border-slate-700 focus:border-emerald-500 rounded-xl py-2.5 pr-9 pl-3 text-sm font-bold text-white outline-none transition-colors placeholder-slate-500"
                        />
                    </div>
                </div>

                {/* محتوى السلة الممرر */}
                <PurchasesCart 
                    cart={cart} 
                    onRemove={handleRemoveItem} 
                />

                {/* شريط الإجمالي والحفظ (الأسفل) */}
                <PurchasesBottomBar 
                    total={totalCart} 
                    paymentStatus={paymentStatus} 
                    onPaymentStatusChange={setPaymentStatus} 
                    onSave={handleSavePurchase} 
                    onClear={handleClearCart} 
                />
            </div>
        </div>
    );
};