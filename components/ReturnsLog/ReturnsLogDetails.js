// المسار: components/ReturnsLog/ReturnsLogDetails.js
window.ReturnsLogDetails = function({ invoice, items, onClose, onPrint, adjustQty, saveSmartEdit, deleteInvoice }) {
    const { useState, useEffect } = React;
    const [editMethod, setEditMethod] = useState('CASH');

    useEffect(() => {
        if (invoice) {
            setEditMethod(invoice.method || 'CASH');
        }
    }, [invoice]);

    if (!invoice) return null;

    // حساب المبلغ الإجمالي المسترد بشكل ديناميكي من الأصناف
    const totalRefund = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
    const totalPieces = items.reduce((sum, item) => sum + Number(item.qty), 0);

    return (
        <div className="flex flex-col gap-5 md:gap-6">
            
            {/* الهيدر العلوي */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 md:gap-4">
                    <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-600 hover:bg-amber-500 hover:text-white rounded-xl flex items-center justify-center transition-all border border-slate-200 active:scale-90 shadow-sm">
                        <i className="fas fa-arrow-right"></i>
                    </button>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            تفاصيل وتعديل المرتجع 
                            <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg font-mono tracking-tighter">#{invoice.invoice_number}</span>
                        </h2>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1">
                            تاريخ التسجيل: {String(invoice.date).substring(0, 16).replace('T', ' ')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={onPrint} className="flex-1 sm:flex-none bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all border border-indigo-100 shadow-sm flex justify-center items-center gap-2">
                        <i className="fas fa-print"></i> طباعة الإيصال
                    </button>
                    <button onClick={deleteInvoice} className="flex-1 sm:flex-none bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all border border-rose-100 shadow-sm flex justify-center items-center gap-2">
                        <i className="fas fa-trash-alt"></i> حذف المرتجع
                    </button>
                </div>
            </div>

            {/* تفاصيل المرتجع (شبكة مقسمة) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
                
                {/* قائمة الأصناف مع إمكانية تعديل الكميات */}
                <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 mb-4 md:mb-5 text-sm md:text-base flex items-center gap-2">
                        <i className="fas fa-boxes text-amber-500"></i> الأصناف المستردة في الفاتورة (يمكن تعديل الكمية)
                    </h3>
                    
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-amber-300 transition-all">
                                <div className="flex-1">
                                    <p className="font-black text-sm md:text-base text-slate-800">{item.product_name || 'صنف مجهول'}</p>
                                    <p className="text-xs font-bold text-slate-500 mt-1">
                                        سعر الاسترداد للوحدة: <span className="text-slate-700 font-mono">{Number(item.price).toLocaleString()} ج.م</span>
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-4 w-full sm:w-auto bg-white p-2 rounded-xl border border-slate-100 shadow-sm justify-between sm:justify-end">
                                    <span className="text-xs font-black text-slate-400 uppercase hidden sm:block">الكمية</span>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => adjustQty(idx, -1)} 
                                            className="w-8 h-8 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center active:scale-90 transition-all font-bold"
                                        >
                                            <i className="fas fa-minus text-xs"></i>
                                        </button>
                                        <span className="w-8 text-center font-black text-lg text-slate-800 font-mono">{item.qty}</span>
                                        <button 
                                            type="button"
                                            onClick={() => adjustQty(idx, 1)} 
                                            className="w-8 h-8 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center active:scale-90 transition-all font-bold"
                                        >
                                            <i className="fas fa-plus text-xs"></i>
                                        </button>
                                    </div>
                                    <div className="text-left w-20 sm:hidden">
                                        <span className="font-black text-slate-800 font-mono">{(item.qty * item.price).toLocaleString()}</span>
                                    </div>
                                </div>
                                
                                <div className="hidden sm:block text-left w-24 shrink-0">
                                    <span className="text-[10px] font-black text-slate-400 block mb-1">الإجمالي</span>
                                    <span className="font-black text-slate-800 font-mono text-base">{(item.qty * item.price).toLocaleString()} ج.م</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* لوحة التحكم والإعدادات */}
                <div className="space-y-5 md:space-y-6">
                    <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
                        <h3 className="font-black text-slate-800 mb-4 text-sm flex items-center gap-2">
                            <i className="fas fa-cog text-amber-500"></i> خيارات المرتجع
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-500 mb-2 block">اسم العميل</label>
                                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm text-slate-800">
                                    {invoice.customer_vendor_name || 'عميل نقدي عام (بدون اسم)'}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-slate-500 mb-2 block">طريقة رد المبلغ</label>
                                <select 
                                    value={editMethod} 
                                    onChange={(e) => setEditMethod(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-amber-500 transition-colors shadow-sm cursor-pointer"
                                >
                                    <option value="CASH">💵 نقدياً (من الخزينة / الصندوق)</option>
                                    <option value="NETWORK">💳 شبكة / بنكي (البنك)</option>
                                    <option value="PENDING">⏳ آجل (قيد لحساب العميل)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* البطاقة الداكنة للملخص والحفظ */}
                    <div className="bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl relative overflow-hidden text-white">
                        <i className="fas fa-hand-holding-usd absolute -left-4 -bottom-4 text-8xl text-white/5"></i>
                        
                        <div className="mb-4 pb-4 border-b border-slate-700/50 flex justify-between items-center text-amber-400">
                            <span className="text-xs font-black uppercase tracking-wider">إجمالي القطع المستردة</span>
                            <span className="font-black font-mono text-lg">{totalPieces} قطعة</span>
                        </div>

                        <div className="mb-6">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1">المبلغ المردود بعد التعديل</span>
                            <h2 className="text-3xl md:text-4xl font-black text-amber-400 font-mono">
                                {totalRefund.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm text-slate-400">ج.م</span>
                            </h2>
                        </div>

                        <button 
                            type="button"
                            onClick={() => saveSmartEdit(editMethod)} 
                            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-sm md:text-base flex justify-center items-center gap-2 relative z-10"
                        >
                            <i className="fas fa-check-circle"></i> اعتماد وحفظ التعديلات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};