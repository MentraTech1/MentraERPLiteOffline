
// المسار: components/SalesReport/SalesReportHeader.js
window.SalesReportHeader = function({ exportToExcel, exportToPDF }) {
    return (
        <div className="flex items-center justify-between gap-3 mb-5 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl md:rounded-[2rem] flex items-center justify-center text-xl md:text-2xl shadow-lg shadow-blue-500/30 shrink-0">
                    <i className="fas fa-file-invoice-dollar"></i>
                </div>
                <div>
                    <h2 className="text-lg sm:text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">سجل المبيعات</h2>
                    <p className="text-[9px] sm:text-xs font-bold text-slate-500 mt-0.5 md:mt-1">إدارة الفواتير والتحصيل</p>
                </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 shrink-0">
                <button onClick={exportToExcel} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white px-4 py-3 rounded-xl font-black text-xs transition-all border border-emerald-100 shadow-sm active:scale-95"><i className="fas fa-file-excel ml-1"></i> إكسيل</button>
                <button onClick={exportToPDF} className="bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white px-4 py-3 rounded-xl font-black text-xs transition-all border border-rose-100 shadow-sm active:scale-95"><i className="fas fa-file-pdf ml-1"></i> PDF</button>
            </div>
        </div>
    );
};