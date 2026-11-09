// المسار: components/Main/MainHeaderFilter.js
window.MainHeaderFilter = function({ dateFilter, setDateFilter }) {
    const setQuickDate = (type) => {
        const today = new Date();
        const toStr = today.toISOString().split('T')[0];
        let fromStr = toStr;

        if (type === 'month') {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            firstDay.setHours(12);
            fromStr = firstDay.toISOString().split('T')[0];
        }
        setDateFilter({ from: fromStr, to: toStr });
    };

    return (
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-5 animate-view">
            <div className="w-full xl:w-auto text-center sm:text-right">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 flex justify-center sm:justify-start items-center gap-2">
                    <i className="fas fa-chart-line text-blue-600"></i> ملخص الأداء المالي
                </h2>
                <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">إحصائيات مبيعات وأرباح الفترة المحددة</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto bg-slate-50 p-3 md:p-2.5 rounded-xl md:rounded-2xl border border-slate-200">
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => setQuickDate('today')} className="flex-1 sm:flex-none bg-white border border-slate-200 px-3 md:px-4 py-3 sm:py-2 rounded-lg md:rounded-xl text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm active:scale-95 whitespace-nowrap">اليوم</button>
                    <button onClick={() => setQuickDate('month')} className="flex-1 sm:flex-none bg-white border border-slate-200 px-3 md:px-4 py-3 sm:py-2 rounded-lg md:rounded-xl text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm active:scale-95 whitespace-nowrap">هذا الشهر</button>
                </div>
                
                <div className="hidden sm:block w-px h-8 bg-slate-300 mx-1"></div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-black text-slate-400 whitespace-nowrap">من</span>
                        <input type="date" value={dateFilter.from} onChange={(e) => setDateFilter({...dateFilter, from: e.target.value})} className="flex-1 sm:flex-none bg-white border border-slate-200 px-2 md:px-3 py-2.5 sm:py-2 rounded-lg md:rounded-xl text-xs font-black text-slate-800 outline-none focus:border-blue-500 cursor-pointer" />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-black text-slate-400 whitespace-nowrap">إلى</span>
                        <input type="date" value={dateFilter.to} onChange={(e) => setDateFilter({...dateFilter, to: e.target.value})} className="flex-1 sm:flex-none bg-white border border-slate-200 px-2 md:px-3 py-2.5 sm:py-2 rounded-lg md:rounded-xl text-xs font-black text-slate-800 outline-none focus:border-blue-500 cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>
    );
};