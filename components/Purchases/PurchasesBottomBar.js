
// المسار: components/Purchases/PurchasesBottomBar.js
window.PurchasesBottomBar = function({ total, paymentStatus, onPaymentStatusChange, onSave, onClear }) {
    const formatMoney = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="bg-slate-900 border-t border-slate-800 p-4 shrink-0 pb-safe z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-slate-400 font-black uppercase tracking-widest">إجمالي التكلفة</span>
                <span className="text-2xl md:text-3xl font-black text-emerald-400 font-mono tracking-tighter">{formatMoney(total)} <span className="text-sm text-slate-500">ج.م</span></span>
            </div>

            <div className="flex gap-2 items-center mb-4">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider shrink-0 w-16">نوع الدفع:</span>
                <div className="flex bg-slate-800 p-1 rounded-xl flex-1">
                    <button onClick={() => onPaymentStatusChange('paid')} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${paymentStatus === 'paid' ? 'bg-emerald-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}>نقدي (كاش)</button>
                    <button onClick={() => onPaymentStatusChange('pending')} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${paymentStatus === 'pending' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>آجل (دين)</button>
                </div>
            </div>
            
            <div className="flex gap-2">
                <button onClick={onClear} className="w-14 h-14 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-[1.2rem] font-black active:scale-95 transition-all flex items-center justify-center border border-rose-500/20 shrink-0">
                    <i className="fas fa-trash-alt text-lg"></i>
                </button>
                
                <button onClick={onSave} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-900 h-14 rounded-[1.2rem] font-black shadow-[0_5px_15px_rgba(16,185,129,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2 text-sm md:text-base">
                    <i className="fas fa-check-double text-lg"></i> اعتماد الفاتورة
                </button>
            </div>
        </div>
    );
};