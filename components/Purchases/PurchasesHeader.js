
// المسار: components/Purchases/PurchasesHeader.js
window.PurchasesHeader = function({ stats }) {
    const formatMoney = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="flex gap-3 shrink-0">
            <div className="flex-1 bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between overflow-hidden relative group">
                <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider mb-1">مشتريات اليوم</p>
                    <h4 className="text-lg md:text-2xl font-black text-slate-800 font-mono tracking-tighter">{formatMoney(stats.todayPurchases)}</h4>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-lg md:text-xl relative z-10">
                    <i className="fas fa-shopping-cart"></i>
                </div>
            </div>

            <div className="flex-1 bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between overflow-hidden relative group">
                <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider mb-1">نواقص المخزن</p>
                    <h4 className="text-lg md:text-2xl font-black text-rose-600 font-mono tracking-tighter">{stats.lowStockCount} <span className="text-xs text-slate-500">صنف</span></h4>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-lg md:text-xl relative z-10">
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
            </div>
        </div>
    );
};