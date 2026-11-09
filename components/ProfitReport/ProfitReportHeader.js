// المسار: components/ProfitReport/ProfitReportHeader.js
window.ProfitReportHeader = function({ dateFilter, onDateChange, onQuickDate, onSearch }) {
    return (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6 animate-view">
            <div className="flex items-center gap-3 md:gap-4 w-full xl:w-auto">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl md:rounded-[2rem] flex items-center justify-center text-xl md:text-2xl shadow-lg shadow-indigo-500/30 shrink-0">
                    <i className="fas fa-chart-pie"></i>
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight">تقرير الأرباح والسيولة</h1>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-1">تحليل مالي دقيق شامل المبيعات والمرتجعات</p>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0">
                <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-2 rounded-xl md:rounded-2xl border border-slate-200 w-full md:w-auto">
                    <div className="flex gap-1 w-full sm:w-auto justify-center">
                        <button onClick={() => onQuickDate('today')} className="flex-1 sm:flex-none bg-white border border-slate-200 px-3 py-2 rounded-lg md:rounded-xl text-[11px] font-black text-slate-700 hover:text-indigo-600 transition-all shadow-sm active:scale-95">اليوم</button>
                        <button onClick={() => onQuickDate('month')} className="flex-1 sm:flex-none bg-white border border-slate-200 px-3 py-2 rounded-lg md:rounded-xl text-[11px] font-black text-slate-700 hover:text-indigo-600 transition-all shadow-sm active:scale-95">الشهر</button>
                    </div>
                    <div className="hidden sm:block w-px h-6 bg-slate-300 mx-1"></div>
                    <div className="flex items-center justify-between sm:justify-start gap-2 px-1 w-full sm:w-auto mt-2 sm:mt-0">
                        <input type="date" value={dateFilter.from} onChange={(e) => onDateChange('from', e.target.value)} className="bg-transparent text-[11px] md:text-xs font-black outline-none text-slate-700 w-full cursor-pointer focus:text-indigo-600" />
                        <span className="text-slate-300 font-black">-</span>
                        <input type="date" value={dateFilter.to} onChange={(e) => onDateChange('to', e.target.value)} className="bg-transparent text-[11px] md:text-xs font-black outline-none text-slate-700 w-full cursor-pointer focus:text-indigo-600" />
                    </div>
                </div>
                <button onClick={onSearch} className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl md:rounded-2xl font-black text-xs hover:bg-indigo-600 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0">
                    <i className="fas fa-search"></i> بحث
                </button>
            </div>
        </div>
    );
};