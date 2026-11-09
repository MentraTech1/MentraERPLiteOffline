// المسار: components/Sales/Module_Sales_Container.js
window.Module_Sales_Container = function({ showToast }) {
    const { useState, useEffect, useRef, useCallback } = React;
    const { SalesSearch, SalesCart, SalesSummary, SalesBarcodeScannerModal } = window;

    // --- State Management ---
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    const [discount, setDiscount] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('paid');
    const [printEnabled, setPrintEnabled] = useState(true);
    
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    
    const dbRef = useRef(null);
    const searchInputRef = useRef(null);
    const containerRef = useRef(null);

    const focusSearchInput = useCallback(() => {
        requestAnimationFrame(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        });
    }, []);

    useEffect(() => { focusSearchInput(); }, [focusSearchInput]);

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            const active = document.activeElement;
            const isInsideInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT' || active.isContentEditable);
            if (isInsideInput) return;
            if (e.key && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                if (searchInputRef.current) searchInputRef.current.focus();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // --- تهيئة قاعدة البيانات ---
    useEffect(() => {
        const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
        const db = new window.Dexie(dbName);
        db.version(4).stores({
            settings: 'id, project_name, shop_name, phone, logo',
            products: '++id, name_ar, sku, category, stock_qty, price, cost', 
            invoices: '++id, invoice_number, type, customer_vendor_id, date, total, status',
            invoice_items: '++id, invoice_id, product_id, price, qty, total_item',
            accounts: '++id, code, name_ar, type, balance',
            journal: '++id, date, ref_no, description, total', 
            journal_items: '++id, journal_id, account_id, debit, credit'
        });
        dbRef.current = db;
        db.open();
    }, []);

    const playFeedback = (type = 'click') => {
        if (navigator.vibrate) {
            if (type === 'success') navigator.vibrate([100, 50, 100]);
            else if (type === 'delete') navigator.vibrate(100);
            else navigator.vibrate(40);
        }
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            
            if (type === 'click' || type === 'tap') { 
                osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime); gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1); 
            }
            if (type === 'success') { 
                osc.type = 'triangle'; osc.frequency.setValueAtTime(600, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1); gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3); 
            }
            if (type === 'delete') {
                osc.type = 'square'; osc.frequency.setValueAtTime(200, ctx.currentTime); gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15); 
            }
            osc.start(); osc.stop(ctx.currentTime + 0.3);
        } catch(e) {}
    };

    // --- البحث الحي ---
    useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.trim().length === 0) {
                setSearchResults([]);
                return;
            }
            try {
                const results = await dbRef.current.products
                    .filter(p => (p.name_ar && p.name_ar.includes(searchQuery)) || p.sku === searchQuery || p.barcode === searchQuery)
                    .limit(8)
                    .toArray();

                if (results.length === 1 && (results[0].sku === searchQuery || results[0].barcode === searchQuery)) {
                    addToCart(results[0]);
                    setSearchQuery('');
                    setSearchResults([]);
                } else {
                    setSearchResults(results);
                }
            } catch (error) { console.error(error); }
        };
        fetchResults();
    }, [searchQuery]);

    const addToCart = (product) => {
        const availableStock = parseFloat(product.stock_qty) || 0;
        const exist = cart.find(i => i.id === product.id);
        const currentQtyInCart = exist ? exist.qty : 0;

        if (availableStock <= 0 && currentQtyInCart === 0) {
            playFeedback('delete');
            Swal.fire({ icon: 'warning', title: 'نفد من المخزون', text: product.name_ar + ' غير متوفر', toast: true, position: 'top', timer: 1500, showConfirmButton: false });
            focusSearchInput();
            return;
        }
        if (currentQtyInCart >= availableStock) {
            playFeedback('delete');
            Swal.fire({ icon: 'info', title: 'تجاوز الكمية المتاحة', toast: true, position: 'top', timer: 1500, showConfirmButton: false });
            focusSearchInput();
            return;
        }

        if (exist) {
            setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([{ id: product.id, name: product.name_ar || 'منتج', price: Number(product.price || 0), cost: Number(product.cost || 0), qty: 1, maxStock: availableStock }, ...cart]);
        }
        playFeedback('tap');
        setSearchQuery('');
        setSearchResults([]);
        focusSearchInput();
    };

    const updateQty = (id, change) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.qty + change;
                if (change > 0 && item.maxStock !== undefined && newQty > item.maxStock) {
                    playFeedback('delete');
                    Swal.fire({ icon: 'info', title: 'وصلت للحد الأقصى', toast: true, position: 'top', timer: 1500, showConfirmButton: false });
                    return item;
                }
                if (newQty <= 0) return null;
                playFeedback('tap');
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(Boolean));
        focusSearchInput();
    };

    const removeItem = (id) => {
        setCart(cart.filter(i => i.id !== id));
        playFeedback('delete');
        focusSearchInput();
    };

    const clearCart = async () => {
        if (cart.length === 0) return;
        const res = await Swal.fire({ title: 'إفراغ الفاتورة؟', icon: 'warning', showCancelButton: true, confirmButtonText: 'نعم', cancelButtonText: 'تراجع', confirmButtonColor: '#ef4444', returnFocus: false, customClass: { popup: 'rounded-3xl' } });
        if (res.isConfirmed) { setCart([]); setDiscount(0); }
        focusSearchInput();
    };

    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const finalTotal = Math.max(0, subTotal - (parseFloat(discount) || 0));

    // --- الطباعة ---
    const printReceipt = async (invoiceNumber, customer, itemsToPrint, total, status) => {
        try {
            let shopName = "Mentra ERP"; let shopPhone = "";
            const setting = await dbRef.current.settings.get(1);
            if (setting) { shopName = setting.shop_name || shopName; shopPhone = setting.phone || ""; }
            const dateStr = new Date().toLocaleString('ar-EG');
            
            const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>فاتورة ${invoiceNumber}</title><style>@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');body { font-family: 'Cairo', sans-serif; padding: 10px; color: #000; margin: 0; background: #fff; font-size: 12px; }.receipt-container { max-width: 80mm; margin: 0 auto; }.header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }.header h2 { margin: 0 0 5px 0; font-size: 20px; font-weight: 900; }table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }th { border-bottom: 1px solid #000; padding: 5px 0; text-align: right; font-size: 11px; }td { padding: 6px 0; border-bottom: 1px dotted #ccc; font-size: 12px; font-weight: bold; }.col-qty { text-align: center; width: 15%; }.col-price { text-align: left; width: 25%; }.col-total { text-align: left; width: 25%; font-weight: 900;}.summary { border-top: 2px dashed #000; padding-top: 10px; font-weight: bold; }.summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }.final-total { font-size: 18px; margin-top: 10px; border-top: 2px solid #000; padding-top: 5px; }.footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 1px dashed #000; padding-top: 10px; }@media print { body { padding: 0; } @page { margin: 0; } }</style></head><body><div class="receipt-container"><div class="header"><h2>${shopName}</h2>${shopPhone ? `<p>تليفون: ${shopPhone}</p>` : ''}<p>فاتورة مبيعات - ${status === 'paid' ? 'مسدد' : 'آجل'}</p></div><div style="margin-bottom:10px"><div>رقم: <strong>#${invoiceNumber}</strong></div><div>العميل: <strong>${customer}</strong></div><div>التاريخ: <strong>${dateStr}</strong></div></div><table><thead><tr><th>الصنف</th><th class="col-qty">العدد</th><th class="col-price">السعر</th><th class="col-total">الإجمالي</th></tr></thead><tbody>${itemsToPrint.map(item => `<tr><td>${item.name}</td><td class="col-qty">${item.qty}</td><td class="col-price">${Number(item.price).toLocaleString()}</td><td class="col-total">${(item.qty * item.price).toLocaleString()}</td></tr>`).join('')}</tbody></table><div class="summary"><div class="summary-row"><span>إجمالي القطع:</span><span>${itemsToPrint.reduce((sum, i) => sum + i.qty, 0)} قطعة</span></div>${discount > 0 ? `<div class="summary-row" style="color:red"><span>الخصم:</span><span>${discount} ج.م</span></div>` : ''}<div class="summary-row final-total"><span>الصافي المطلوب:</span><span>${Number(total).toLocaleString()} ج.م</span></div></div><div class="footer"><p>شكراً لثقتكم بنا!</p><p style="font-size:9px;color:#666;margin-top:10px">Mentra ERP</p></div></div></body></html>`;

            let printIframe = document.getElementById('sales-print-frame');
            if (!printIframe) {
                printIframe = document.createElement('iframe'); printIframe.id = 'sales-print-frame'; printIframe.style.position = 'fixed'; printIframe.style.top = '-9999px'; printIframe.style.left = '-9999px'; printIframe.style.width = '0px'; printIframe.style.height = '0px'; printIframe.style.border = 'none'; document.body.appendChild(printIframe);
            }
            const doc = printIframe.contentWindow.document;
            doc.open(); doc.write(html); doc.close();

            setTimeout(() => {
                printIframe.contentWindow.focus(); printIframe.contentWindow.print(); window.focus(); focusSearchInput();
            }, 250);
        } catch (e) { console.error("Print Error:", e); focusSearchInput(); }
    };

    // --- إنهاء عملية البيع (الدفع) ---
    const processCheckout = async (method) => {
        if (cart.length === 0) {
            Swal.fire({ icon: 'error', title: 'الفاتورة فارغة', toast: true, position: 'top', timer: 1500, showConfirmButton: false }); 
            focusSearchInput(); return;
        }
        if (finalTotal < 0) {
            Swal.fire({ icon: 'error', title: 'الخصم غير منطقي', toast: true, position: 'top', timer: 1500, showConfirmButton: false }); 
            focusSearchInput(); return;
        }

        let finalCustomer = customerName.trim();
        if (paymentStatus === 'pending' && finalCustomer === '') {
            playFeedback('delete');
            Swal.fire({ icon: 'warning', title: 'مطلوب اسم العميل', text: 'لا يمكن تسجيل فاتورة آجلة (دين) بدون تحديد اسم العميل.', toast: true, position: 'top', timer: 2500, showConfirmButton: false }); 
            return;
        }
        if (finalCustomer === '') finalCustomer = "عميل نقدي";

        try {
            const db = dbRef.current;
            const today = new Date().toISOString(); 
            const invNumber = 'INV-' + Date.now().toString().slice(-6);
            const itemsToPrint = [...cart]; 
            
            let totalCost = 0; 
            
            // 1. تحديث جداول الفواتير والمخازن
            await db.transaction('rw', db.invoices, db.invoice_items, db.products, async () => {
                const invId = await db.invoices.add({
                    invoice_number: invNumber, customer_vendor_name: finalCustomer, date: today, total: finalTotal, method: method, type: 'SALE', status: paymentStatus, discount: parseFloat(discount) || 0
                });

                for (let item of cart) {
                    await db.invoice_items.add({
                        invoice_id: invId, product_id: item.id, product_name: item.name, price: item.price, cost: item.cost || 0, qty: item.qty, total_item: item.price * item.qty, total_cost: (item.cost || 0) * item.qty
                    });

                    const p = await db.products.get(item.id);
                    if (p) {
                        await db.products.update(item.id, { stock_qty: (parseFloat(p.stock_qty) || 0) - item.qty });
                        totalCost += (item.cost || 0) * item.qty;
                    }
                }
            });

            // =========================================================================
            // 2. استخدام JournalManager الجديد لتوليد وإنشاء القيود والحسابات بضغطة زر!
            // =========================================================================
            if (window.JournalManager) {
                await window.JournalManager.recordSaleInvoice(
                    invNumber,          // رقم الفاتورة للربط المرجعي
                    finalTotal,         // إجمالي المبيعات (نقدية وإيرادات)
                    totalCost,          // إجمالي التكلفة (مخزون وتكلفة البضاعة)
                    method,             // كاش أو شبكة
                    paymentStatus,      // مسدد أو آجل
                    finalCustomer,      // اسم العميل
                    today               // التاريخ
                );
            } else {
                console.warn("JournalManager is not loaded! Accounting entries skipped.");
            }

            playFeedback('success');
            const successMsg = paymentStatus === 'pending' ? 'تم تسجيل الفاتورة آجلة ⏳' : 'تم التحصيل بنجاح 🎉';
            
            Swal.fire({ 
                title: successMsg, text: `الإجمالي: ${finalTotal.toFixed(2)} ج.م`, icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false, timerProgressBar: true
            });

            // تصفير الشاشة
            setCart([]); setCustomerName(''); setDiscount(0); setPaymentStatus('paid'); setSearchQuery('');

            if (printEnabled) {
                await printReceipt(invNumber, finalCustomer, itemsToPrint, finalTotal, paymentStatus);
            } else {
                focusSearchInput();
            }

        } catch (e) {
            console.error(e);
            Swal.fire({ icon: 'error', title: 'حدث خطأ', text: e.message, toast: true, position: 'top' });
            focusSearchInput();
        }
    };

    return (
        <div 
            ref={containerRef}
            onClick={(e) => { if (e.target === containerRef.current) focusSearchInput(); }}
            className="flex flex-col lg:flex-row gap-6 h-full animate-view outline-none" 
            style={{ direction: 'rtl', WebkitTapHighlightColor: 'transparent' }}
        >
            <div className="flex-1 flex flex-col min-w-0 pb-[220px] lg:pb-0">
                <SalesSearch searchInputRef={searchInputRef} searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} addToCart={addToCart} openScanner={() => setIsScannerOpen(true)} />
                <SalesCart cart={cart} updateQty={updateQty} removeItem={removeItem} clearCart={clearCart} />
            </div>

            <SalesSummary subTotal={subTotal} finalTotal={finalTotal} discount={discount} setDiscount={setDiscount} customerName={customerName} setCustomerName={setCustomerName} paymentStatus={paymentStatus} setPaymentStatus={setPaymentStatus} printEnabled={printEnabled} setPrintEnabled={setPrintEnabled} processCheckout={processCheckout} />

            {isScannerOpen && (
                <SalesBarcodeScannerModal closeScanner={() => { setIsScannerOpen(false); focusSearchInput(); }} handleBarcode={(code) => { setSearchQuery(code); setIsScannerOpen(false); focusSearchInput(); }} />
            )}
        </div>
    );
};