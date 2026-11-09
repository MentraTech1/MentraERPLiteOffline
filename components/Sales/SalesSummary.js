// المسار: components/Sales/SalesSummary.js
window.SalesSummary = function({ subTotal, finalTotal, discount, setDiscount, customerName, setCustomerName, paymentStatus, setPaymentStatus, printEnabled, setPrintEnabled, processCheckout }) {
    
    return (
        <>
            {/* نسخة الديسكتوب (يمين الشاشة) */}
            <div className="hidden lg:flex flex-col w-[340px] shrink-0 bg-[#0b1120] rounded-[2rem] p-6 shadow-2xl sticky top-4 h-fit border border-slate-800 text-white">
                <div className="flex justify-between items-center mb-5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ملخص الحساب</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-1 rounded-md tracking-wider">POS READY</span>
                </div>
                
                <div className="flex justify-between items-center text-sm font-bold text-slate-300 mb-3">
                    <span>الإجمالي الفرعي</span>
                    <span className="font-mono">{subTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                    <span className="text-xs font-black text-rose-400">الخصم (ج.م)</span>
                    <input 
                        type="number" 
                        value={discount === 0 ? '' : discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        placeholder="0"
                        className="w-20 bg-transparent border-b-2 border-rose-500/30 text-center text-white text-lg font-mono font-black outline-none focus:border-rose-400"
                    />
                </div>

                <div className="flex flex-col justify-start items-center border-t border-white/10 pt-4 mb-6">
                    <div className="text-xs font-black text-emerald-400 mb-1 uppercase tracking-widest">المطلوب دفعه</div>
                    <div className="text-5xl font-black text-white font-mono tracking-tighter">{finalTotal.toFixed(2)}</div>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                    <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="اسم العميل (اختياري)..."
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white text-sm font-bold outline-none focus:border-blue-500"
                    />
                    <select 
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white text-sm font-bold outline-none focus:border-blue-500 cursor-pointer"
                    >
                        <option value="paid">✅ مسدد</option>
                        <option value="pending">⏳ آجل</option>
                    </select>
                </div>

                <label className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10 cursor-pointer mb-6 select-none">
                    <input 
                        type="checkbox" 
                        checked={printEnabled} 
                        onChange={(e) => setPrintEnabled(e.target.checked)}
                        className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-300">طباعة بون الفاتورة تلقائياً</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => processCheckout('CASH')} className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 p-4 rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                        <i className="fas fa-money-bill-wave"></i> كاش
                    </button>
                    <button type="button" onClick={() => processCheckout('CARD')} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                        <i className="fas fa-credit-card"></i> شبكة
                    </button>
                </div>
            </div>

            {/* نسخة الموبايل (شريط سفلي) */}
            <div className="lg:hidden fixed bottom-[64px] left-0 right-0 bg-[#0b1120] rounded-t-[1.5rem] p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] border-t border-slate-800 z-[60] pb-safe text-white">
                <div className="flex items-center gap-2 mb-2">
                    <div className="shrink-0">
                        <div className="text-[9px] font-black text-emerald-400 uppercase">المطلوب</div>
                        <div className="text-2xl font-black text-white font-mono leading-none">{finalTotal.toFixed(2)}</div>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1.5 shrink-0">
                        <span className="text-[10px] font-black text-rose-400">خصم</span>
                        <input 
                            type="number" 
                            value={discount === 0 ? '' : discount} 
                            onChange={(e) => setDiscount(e.target.value)} 
                            placeholder="0" 
                            className="w-12 bg-transparent border-b-2 border-rose-500/30 text-white text-center font-mono font-black outline-none text-xs" 
                        />
                    </div>
                    
                    <input 
                        type="text" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)} 
                        placeholder="العميل..." 
                        className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500" 
                    />
                    
                    <select 
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-1 py-1.5 text-xs font-bold text-white outline-none"
                    >
                        <option value="paid">مسدد</option>
                        <option value="pending">آجل</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button type="button" onClick={() => processCheckout('CASH')} className="bg-emerald-500 text-slate-900 rounded-xl py-2.5 font-black text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"><i className="fas fa-money-bill-wave"></i> كاش</button>
                    <button type="button" onClick={() => processCheckout('CARD')} className="bg-blue-600 text-white rounded-xl py-2.5 font-black text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"><i className="fas fa-credit-card"></i> شبكة</button>
                </div>
            </div>
        </>
    );
};