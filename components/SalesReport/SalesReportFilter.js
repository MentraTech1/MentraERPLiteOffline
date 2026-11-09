
// المسار: components/SalesReport/SalesReportFilter.js
window.SalesReportFilter = function({ searchQuery, setSearchQuery, dateFilter, setDateFilter, exportToExcel, exportToPDF }) {
    const setQuickDate = (type) => {
        const today = new Date();
        const pad = n => n < 10 ? '0'+n : n;
        const to = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        let from = to;

        if (type === 'month') {
            from = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-01`;
        }
        setDateFilter({ start: from, end: to });
    };

    return (
        <div className="bg-white p-3 md:p-6 rounded-[1.2rem] md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-3 mb-5 md:mb-6 animate-view">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative w-full md:flex-1">
                    <i className="fas fa-search absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث برقم الفاتورة، العميل..." 
                        className="w-full bg-slate-50 p-3 md:p-3.5 pr-10 outline-none rounded-xl md:rounded-2xl border border-slate-200 focus:border-blue-500 font-bold text-xs md:text-sm text-slate-800 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-slate-200 w-full md:w-auto overflow-x-auto hide-scrollbar">
                    <button onClick={() => setQuickDate('today')} className="flex-1 md:flex-none bg-white border border-slate-200 px-4 py-2 rounded-lg text-[10px] md:text-[11px] font-black text-slate-700 hover:text-blue-600 shadow-sm whitespace-nowrap active:scale-95">اليوم</button>
                    <button onClick={() => setQuickDate('month')} className="flex-1 md:flex-none bg-white border border-slate-200 px-4 py-2 rounded-lg text-[10px] md:text-[11px] font-black text-slate-700 hover:text-blue-600 shadow-sm whitespace-nowrap active:scale-95">الشهر</button>
                    <div className="w-px h-5 bg-slate-300 mx-1 shrink-0"></div>
                    <div className="flex items-center gap-1.5 shrink-0 px-1">
                        <input type="date" value={dateFilter.start} onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})} className="bg-transparent text-[10px] md:text-xs font-black outline-none text-slate-700 w-[95px] md:w-auto" />
                        <span className="text-slate-300">-</span>
                        <input type="date" value={dateFilter.end} onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})} className="bg-transparent text-[10px] md:text-xs font-black outline-none text-slate-700 w-[95px] md:w-auto" />
                    </div>
                </div>
            </div>

            <div className="flex md:hidden items-center gap-2 mt-1">
                <button onClick={exportToExcel} className="flex-1 bg-emerald-50 text-emerald-600 px-3 py-2.5 rounded-lg font-black text-[10px] border border-emerald-100 active:bg-emerald-100"><i className="fas fa-file-excel ml-1"></i> إكسيل</button>
                <button onClick={exportToPDF} className="flex-1 bg-rose-50 text-rose-600 px-3 py-2.5 rounded-lg font-black text-[10px] border border-rose-100 active:bg-rose-100"><i className="fas fa-file-pdf ml-1"></i> PDF</button>
            </div>
        </div>
    );
};