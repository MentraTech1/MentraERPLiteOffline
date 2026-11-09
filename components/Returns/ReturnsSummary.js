// المسار: components/Returns/ReturnsSummary.js
window.ReturnsSummary = function({ subtotal, deduction, finalTotal, customerName, isPrintEnabled, onDeductionChange, onCustomerChange, onPrintToggle, onProcessRefund }) {
    return (
        <React.Fragment>
            {/* تصميم الديسكتوب (ثابت لا يعاد إنشاؤه من الصفر) */}
            <div className="hidden lg:flex flex-col bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl sticky top-4 w-[340px] shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">ملخص المرتجع</span>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-1 rounded-md">RET-POS</span>
                </div>
                
                <div className="flex justify-between mb-3 text-sm font-bold text-slate-400">
                    <span>قيمة البضاعة</span>
                    <span className="font-mono">{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 mb-5 border border-white/5">
                    <span className="text-sm font-black text-rose-400">خصم (رسوم إرجاع)</span>
                    <input 
                        type="number" 
                        value={deduction === 0 ? '' : deduction} 
                        onChange={(e) => onDeductionChange(e.target.value)} 
                        placeholder="0" 
                        className="w-16 bg-transparent border-b-2 border-rose-500/30 text-white text-center font-mono font-black outline-none focus:border-rose-400" 
                    />
                </div>
                
                <div className="border-t border-white/10 pt-5 text-center mb-6">
                    <div className="text-[11px] font-black text-amber-400 mb-1">المبلغ المرتجع للعميل</div>
                    <div className="text-5xl font-black text-white font-mono leading-none">{finalTotal.toFixed(2)}</div>
                </div>
                
                <input 
                    type="text" 
                    value={customerName} 
                    onChange={(e) => onCustomerChange(e.target.value)} 
                    placeholder="اسم العميل (اختياري)..." 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-white outline-none mb-3 focus:border-amber-500" 
                />
                
                <label className="flex items-center gap-2 mb-4 bg-white/5 p-2.5 rounded-xl border border-white/10 cursor-pointer select-none">
                    <input type="checkbox" checked={isPrintEnabled} onChange={(e) => onPrintToggle(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                    <span className="text-xs font-bold text-slate-300">طباعة إيصال المرتجع للعميل</span>
                </label>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button type="button" onClick={() => onProcessRefund('CASH')} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-3 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"><i className="fas fa-hand-holding-usd"></i> نقدي</button>
                    <button type="button" onClick={() => onProcessRefund('CARD')} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"><i className="fas fa-credit-card"></i> شبكة</button>
                </div>
            </div>

            {/* تصميم الموبايل */}
            <div className="lg:hidden shrink-0 bg-slate-900 rounded-t-[2rem] p-3 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.35)] z-50">
                <div className="flex items-center gap-2 mb-2">
                    <div className="shrink-0">
                        <div className="text-[9px] font-black text-amber-400 uppercase">المبلغ للعميل</div>
                        <div className="text-2xl font-black text-white font-mono leading-none">{finalTotal.toFixed(2)}</div>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1.5 shrink-0">
                        <span className="text-[10px] font-black text-rose-400">رسوم</span>
                        <input 
                            type="number" 
                            value={deduction === 0 ? '' : deduction} 
                            onChange={(e) => onDeductionChange(e.target.value)} 
                            placeholder="0" 
                            className="w-12 bg-transparent border-b-2 border-rose-500/30 text-white text-center font-mono font-black outline-none text-xs" 
                        />
                    </div>
                    
                    <input 
                        type="text" 
                        value={customerName} 
                        onChange={(e) => onCustomerChange(e.target.value)} 
                        placeholder="العميل..." 
                        className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-white outline-none focus:border-amber-500" 
                    />
                </div>
                
                <label className="flex items-center gap-2 mb-2 p-1 cursor-pointer select-none">
                    <input type="checkbox" checked={isPrintEnabled} onChange={(e) => onPrintToggle(e.target.checked)} className="w-3.5 h-3.5 accent-amber-500" />
                    <span className="text-[11px] font-bold text-slate-300">طباعة بون المرتجع</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => onProcessRefund('CASH')} className="bg-rose-500 text-white rounded-xl py-2.5 font-black text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"><i className="fas fa-hand-holding-usd"></i> إرجاع نقدي</button>
                    <button type="button" onClick={() => onProcessRefund('CARD')} className="bg-amber-500 text-white rounded-xl py-2.5 font-black text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"><i className="fas fa-credit-card"></i> إرجاع شبكة</button>
                </div>
            </div>
        </React.Fragment>
    );
};