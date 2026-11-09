// المسار: components/Returns/Module_Returns_Container.js
window.Module_Returns_Container = function() {
    const { useState, useEffect, useRef, useCallback } = React;
    const { ReturnsSearch, ReturnsCart, ReturnsSummary, ReturnsScanner } = window;
    
    // States
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [deduction, setDeduction] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [isPrintEnabled, setIsPrintEnabled] = useState(true);
    const [isScanning, setIsScanning] = useState(false);

    // Refs
    const searchInputRef = useRef(null);
    const containerRef = useRef(null);

    // =========================================================================
    // حماية تجميد الكيبورد والتركيز التلقائي الصارم (Auto Focus Protection)
    // =========================================================================
    const focusSearchInput = useCallback(() => {
        requestAnimationFrame(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        });
    }, []);

    // 1. تركيز مبدئي عند فتح الشاشة
    useEffect(() => {
        focusSearchInput();
    }, [focusSearchInput]);

    // 2. مستمع ذكي للوحة المفاتيح: توجيه أي ضغطة زر أو ماسح باركود لحقل البحث
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            const active = document.activeElement;
            const isInsideInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
            
            if (isInsideInput) return;

            if (e.key && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // الحسابات
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const finalTotal = Math.max(0, subtotal - (parseFloat(deduction) || 0));

    // هزة التنبيه للموبايل
    const vibrate = (type = 'click') => {
        if (navigator.vibrate) {
            if (type === 'success') navigator.vibrate([100, 50, 100]);
            else if (type === 'delete') navigator.vibrate(100);
            else navigator.vibrate(40);
        }
    };

    // البحث عن الأصناف
    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.trim().length === 0) {
            setSearchResults(null);
            return;
        }
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({ products: '++id, name_ar, sku, category, stock_qty, price, cost' });
            
            const products = await db.products.filter(p => 
                (p.name_ar && p.name_ar.includes(val)) || 
                p.sku === val || 
                p.barcode === val
            ).limit(8).toArray();
            
            if (products.length === 1 && (products[0].sku === val || products[0].barcode === val)) {
                handleAddToCart(products[0]);
                setSearchResults(null);
                setSearchQuery('');
                return;
            }
            setSearchResults(products);
        } catch (e) { 
            console.error(e); 
        }
    };

    // إضافة صنف للعربة
    const handleAddToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(i => i.id === product.id);
            if (exists) {
                return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [{
                id: product.id,
                name: product.name_ar || 'منتج',
                price: Number(product.price || 0),
                cost: Number(product.cost || 0),
                qty: 1
            }, ...prev];
        });
        vibrate('tap');
        setSearchQuery('');
        setSearchResults(null);
        focusSearchInput();
    };

    const handleUpdateQty = (id, change) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.qty + change;
                return newQty > 0 ? { ...item, qty: newQty } : item;
            }
            return item;
        }).filter(item => item.qty > 0));
        vibrate('tap');
        focusSearchInput();
    };

    const handleRemoveItem = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
        vibrate('delete');
        focusSearchInput();
    };

    const handleClearCart = async () => {
        const res = await window.Swal.fire({ 
            title: 'إلغاء المرتجع؟', 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonText: 'نعم', 
            cancelButtonText: 'تراجع', 
            confirmButtonColor: '#ef4444', 
            returnFocus: false,
            customClass: { popup: 'rounded-3xl' } 
        });
        if (res.isConfirmed) {
            setCart([]);
            setDeduction(0);
        }
        focusSearchInput();
    };

    // ماسح الكاميرا
    const handleScannerResult = async (barcode) => {
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({ products: '++id, name_ar, sku, category, stock_qty, price, cost' });
            
            const products = await db.products.filter(p => p.barcode === barcode || p.sku === barcode).toArray();
            if (products.length > 0) {
                handleAddToCart(products[0]);
                setTimeout(() => setIsScanning(false), 500);
            } else {
                window.Swal.fire({ icon: 'warning', title: 'غير موجود', toast: true, position: 'top', timer: 1500, showConfirmButton: false });
            }
        } catch (e) { 
            console.error(e); 
        } finally {
            focusSearchInput();
        }
    };

    // الطباعة الصامتة عبر iframe خفي لمنع سرقة تركيز المتصفح
    const printReceipt = async (invNumber, custName, items, refundTotal, deductionApplied, method) => {
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({ settings: 'id, project_name, shop_name, phone' });
            
            let shopName = "Mentra ERP", shopPhone = "";
            const setting = await db.settings.get(1);
            if (setting) { shopName = setting.shop_name || shopName; shopPhone = setting.phone || ""; }

            const dateStr = new Date().toLocaleString('ar-EG');
            
            const html = `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8"><title>إيصال مرتجع #${invNumber}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                        body { font-family: 'Cairo', sans-serif; padding: 10px; color: #000; margin: 0; background: #fff; font-size: 12px; }
                        .receipt-container { max-width: 80mm; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .header h2 { margin: 0 0 5px 0; font-size: 20px; font-weight: 900; }
                        .header p { margin: 2px 0; font-size: 11px; font-weight: bold;}
                        .return-badge { display: inline-block; background: #000; color: #fff; padding: 2px 8px; border-radius: 4px; margin-top: 5px; font-weight: bold; }
                        .info-box { margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                        .info-box div { margin-bottom: 4px; display: flex; justify-content: space-between; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                        th { border-bottom: 1px solid #000; padding: 5px 0; text-align: right; font-size: 11px; }
                        td { padding: 6px 0; border-bottom: 1px dotted #ccc; font-size: 12px; font-weight: bold; }
                        .col-qty { text-align: center; width: 15%; }
                        .col-price { text-align: left; width: 25%; }
                        .col-total { text-align: left; width: 25%; font-weight: 900;}
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
                            <div class="return-badge">إيصال مرتجع مبيعات</div>
                        </div>
                        <div class="info-box">
                            <div><span>رقم الإيصال:</span> <strong>#${invNumber}</strong></div>
                            <div><span>التاريخ:</span> <strong>${dateStr}</strong></div>
                            <div><span>العميل:</span> <strong>${custName || 'عميل (مرتجع)'}</strong></div>
                            <div><span>طريقة الرد:</span> <strong>${method === 'CASH' ? 'نقدي (كاش)' : 'شبكة'}</strong></div>
                        </div>
                        <table>
                            <thead><tr><th>الصنف</th><th class="col-qty">العدد</th><th class="col-price">السعر</th><th class="col-total">الإجمالي</th></tr></thead>
                            <tbody>
                                ${items.map(item => `<tr><td>${item.name}</td><td class="col-qty">${item.qty}</td><td class="col-price">${Number(item.price).toLocaleString()}</td><td class="col-total">${(item.qty * item.price).toLocaleString()}</td></tr>`).join('')}
                            </tbody>
                        </table>
                        <div class="summary">
                            <div class="summary-row"><span>إجمالي القطع:</span><span>${items.reduce((sum, i) => sum + i.qty, 0)} قطعة</span></div>
                            ${deductionApplied > 0 ? `<div class="summary-row" style="color: #666;"><span>يخصم (رسوم):</span><span>${Number(deductionApplied).toLocaleString()} ج.م</span></div>` : ''}
                            <div class="summary-row final-total"><span>المبلغ المسترد للعميل:</span><span>${Number(refundTotal).toLocaleString()} ج.م</span></div>
                        </div>
                        <div class="footer"><p>تم استرداد البضاعة للمخزن</p><p style="font-size: 9px; color: #666; margin-top: 10px;">Powered by Mentra ERP</p></div>
                    </div>
                </body>
                </html>
            `;

            let printIframe = document.getElementById('returns-print-frame');
            if (!printIframe) {
                printIframe = document.createElement('iframe');
                printIframe.id = 'returns-print-frame';
                printIframe.style.position = 'fixed';
                printIframe.style.top = '-9999px';
                printIframe.style.left = '-9999px';
                printIframe.style.width = '0px';
                printIframe.style.height = '0px';
                printIframe.style.border = 'none';
                document.body.appendChild(printIframe);
            }

            const doc = printIframe.contentWindow.document;
            doc.open();
            doc.write(html);
            doc.close();

            setTimeout(() => {
                printIframe.contentWindow.focus();
                printIframe.contentWindow.print();
                window.focus();
                focusSearchInput();
            }, 250);

        } catch (e) { 
            console.error("Print Error:", e); 
            focusSearchInput();
        }
    };

    // =========================================================================
    // معالجة المرتجع (مع حماية برمجية كاملة ضد أخطاء عدم توفر الدالة)
    // =========================================================================
    const handleProcessRefund = async (method) => {
        if (cart.length === 0) {
            window.Swal.fire({ icon: 'error', title: 'القائمة فارغة', toast: true, position: 'top', timer: 1500, showConfirmButton: false }); 
            focusSearchInput();
            return;
        }
        
        if (finalTotal < 0) {
            window.Swal.fire({ icon: 'error', title: 'الرسوم أكبر من قيمة البضاعة', toast: true, position: 'top', timer: 1500, showConfirmButton: false }); 
            focusSearchInput();
            return;
        }

        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({
                products: '++id, name_ar, sku, category, stock_qty, price, cost',
                invoices: '++id, invoice_number, type, customer_vendor_id, date, total, status, discount, method',
                invoice_items: '++id, invoice_id, product_id, price, qty, total_item, total_cost',
            });

            const custName = customerName || "عميل (مرتجع)";
            const deductionApplied = parseFloat(deduction) || 0;
            const today = new Date().toISOString(); 
            const invNumber = 'RET-' + Date.now().toString().slice(-6);
            
            const itemsToProcess = [...cart]; 
            let totalCostReturned = 0;

            // 1. تحديث جدول الفواتير وإرجاع المنتجات للمخزن
            await db.transaction('rw', [db.invoices, db.invoice_items, db.products], async () => {
                const invId = await db.invoices.add({
                    invoice_number: invNumber,
                    customer_vendor_name: custName,
                    date: today,
                    total: -finalTotal, 
                    method: method,
                    type: 'RETURN_SALE',
                    status: 'REFUNDED',
                    discount: deductionApplied
                });

                for (let item of itemsToProcess) {
                    await db.invoice_items.add({
                        invoice_id: invId,
                        product_id: item.id,
                        product_name: item.name,
                        price: -item.price,
                        cost: -item.cost,
                        qty: item.qty, 
                        total_item: -(item.price * item.qty),
                        total_cost: -(item.cost * item.qty)
                    });

                    const p = await db.products.get(item.id);
                    if (p) {
                        await db.products.update(item.id, { stock_qty: (parseFloat(p.stock_qty) || 0) + item.qty });
                        totalCostReturned += (item.cost || 0) * item.qty;
                    }
                }
            });

            // 2. المحاسبة والقيود (فحص آمن لمنع توقف الشاشة أو حدوث خطأ)
            if (window.JournalManager && typeof window.JournalManager.recordReturnInvoice === 'function') {
                await window.JournalManager.recordReturnInvoice(
                    invNumber,
                    finalTotal,
                    totalCostReturned,
                    method,
                    custName,
                    today
                );
            } else if (window.JournalManager && typeof window.JournalManager.createEntry === 'function') {
                // خطة بديلة (Fallback) في حالة كان المتصفح محتفظاً بنسخة كاش قديمة من JournalManager
                const cashId = await window.JournalManager.getOrCreateAccount('الصندوق', 'asset', '1001');
                const bankId = await window.JournalManager.getOrCreateAccount('البنك', 'asset', '1002');
                const salesId = await window.JournalManager.getOrCreateAccount('إيرادات المبيعات', 'income', '4001');
                const cogsId = await window.JournalManager.getOrCreateAccount('تكلفة البضاعة المباعة', 'expense', '5001');
                const invId = await window.JournalManager.getOrCreateAccount('المخزون', 'asset', '6001');

                const creditId = method === 'CASH' ? cashId : bankId;
                const items = [
                    { account_id: salesId, debit: finalTotal, credit: 0 },
                    { account_id: creditId, debit: 0, credit: finalTotal }
                ];
                if (totalCostReturned > 0) {
                    items.push({ account_id: invId, debit: totalCostReturned, credit: 0 });
                    items.push({ account_id: cogsId, debit: 0, credit: totalCostReturned });
                }

                await window.JournalManager.createEntry(
                    { type: 'RETURN_SALE', description: `مرتجع مبيعات (${custName}) - ${invNumber}`, ref_no: invNumber, date: today },
                    items
                );
            }

            vibrate('success');

            // تصفير البيانات
            setCart([]);
            setCustomerName('');
            setDeduction(0);
            setSearchResults(null);
            setSearchQuery('');

            window.Swal.fire({ 
                icon: 'success', 
                title: 'تم الإرجاع بنجاح', 
                text: `المبلغ: ${finalTotal.toFixed(2)} ج.م`, 
                toast: true,
                position: 'top-end',
                showConfirmButton: false, 
                timer: 2000,
                timerProgressBar: true
            });

            if (isPrintEnabled) {
                await printReceipt(invNumber, custName, itemsToProcess, finalTotal, deductionApplied, method);
            } else {
                focusSearchInput();
            }

        } catch (e) {
            console.error(e);
            window.Swal.fire({ icon: 'error', title: 'حدث خطأ', text: e.message, toast: true, position: 'top' });
            focusSearchInput();
        }
    };

    return (
        <div 
            ref={containerRef}
            onClick={(e) => {
                if (e.target === containerRef.current) {
                    focusSearchInput();
                }
            }}
            className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6 animate-view outline-none" 
            dir="rtl" 
            style={{ WebkitTapHighlightColor: 'transparent' }}
        >
            {/* الجزء الأيمن (البحث والعربة) */}
            <div className="flex-1 min-w-0 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3 px-2">
                    <i className="fas fa-undo-alt text-amber-500 text-xl"></i>
                    <div>
                        <h2 className="text-slate-800 font-black text-lg leading-tight">مرتجع مبيعات</h2>
                        <p className="text-[10px] text-slate-500 font-bold">إرجاع بضاعة للمخزن ورد أموال للعميل</p>
                    </div>
                </div>

                <ReturnsSearch 
                    searchInputRef={searchInputRef}
                    searchQuery={searchQuery}
                    onSearch={handleSearch} 
                    searchResults={searchResults} 
                    onAddToCart={handleAddToCart}
                    openScanner={() => setIsScanning(true)}
                />

                <ReturnsCart 
                    cart={cart}
                    onUpdateQty={handleUpdateQty}
                    onRemove={handleRemoveItem}
                    onClear={handleClearCart}
                />
            </div>

            {/* الجزء الأيسر / السفلي (الملخص والأزرار) */}
            <ReturnsSummary 
                subtotal={subtotal}
                deduction={deduction}
                finalTotal={finalTotal}
                customerName={customerName}
                isPrintEnabled={isPrintEnabled}
                onDeductionChange={setDeduction}
                onCustomerChange={setCustomerName}
                onPrintToggle={setIsPrintEnabled}
                onProcessRefund={handleProcessRefund}
            />

            {/* مودال الماسح الضوئي */}
            <ReturnsScanner 
                isScanning={isScanning}
                onClose={() => {
                    setIsScanning(false);
                    focusSearchInput();
                }}
                onResult={handleScannerResult}
            />
            
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};