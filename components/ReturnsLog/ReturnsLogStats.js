// المسار: components/ReturnsLog/ReturnsLogStats.js
window.ReturnsLogStats = function({ stats }) {
    const formatMoney = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-5 mb-5 animate-view" style={{ animationDelay: '0.1s' }}>
            <div className="col-span-2 md:col-span-1 bg-slate-900 p-6 rounded-[1.2rem] shadow-lg text-white relative overflow-hidden">
                <i className="fas fa-hand-holding-usd absolute -left-2 -bottom-2 text-6xl text-white/5"></i>
                <p className="text-[11px] font-black text-slate-400 uppercase mb-2">إجمالي الأموال المردودة</p>
                <div className="text-3xl md:text-4xl font-black font-mono truncate text-amber-500">{formatMoney(stats.totalRefunded)}</div>
                <p className="text-[10px] font-bold text-slate-400 mt-2"><i className="fas fa-receipt ml-1"></i> إجمالي حركة الإرجاعات</p>
            </div>
            
            <div className="col-span-1 bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm relative flex flex-col justify-center">
                <p className="text-[11px] font-black text-slate-400 uppercase mb-2">عدد فواتير المرتجع</p>
                <p className="text-xl md:text-2xl font-black text-slate-800 font-mono mb-1 truncate">{stats.returnsCount}</p>
                <p className="text-[10px] font-bold text-slate-400"><i className="fas fa-file-invoice ml-1"></i> فاتورة مسجلة</p>
            </div>
            
            <div className="col-span-1 bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm relative flex flex-col justify-center">
                <p className="text-[11px] font-black text-slate-400 uppercase mb-2">القطع المرتجعة للمخزن</p>
                <p className="text-xl md:text-2xl font-black text-amber-600 font-mono mb-1 truncate">{stats.totalItemsQty}</p>
                <p className="text-[10px] font-bold text-amber-500"><i className="fas fa-box ml-1"></i> قطعة مستردة</p>
            </div>
        </div>
    );
};