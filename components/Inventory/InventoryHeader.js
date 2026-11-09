// المسار: components/Inventory/InventoryHeader.js
window.InventoryHeader = function({ onExportExcel, onExportPDF, onAddProduct }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm animate-view mb-6">
            <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <i className="fas fa-boxes-stacked text-lg"></i>
                    </div>
                    إدارة المخزن
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-1 mr-14">تحكم كامل في الأصناف، الكميات، والأسعار</p>
            </div>
            
            <div className="flex w-full md:w-auto gap-3">
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={onExportExcel} className="flex-1 md:flex-none bg-slate-50 text-slate-600 px-4 py-3 rounded-xl font-black text-xs md:text-sm hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all border border-slate-200 flex items-center justify-center gap-2 active:scale-95 shadow-sm">
                        <i className="fas fa-file-excel text-emerald-500"></i> <span className="hidden sm:inline">إكسيل</span>
                    </button>
                    <button onClick={onExportPDF} className="flex-1 md:flex-none bg-slate-50 text-slate-600 px-4 py-3 rounded-xl font-black text-xs md:text-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all border border-slate-200 flex items-center justify-center gap-2 active:scale-95 shadow-sm">
                        <i className="fas fa-file-pdf text-rose-500"></i> <span className="hidden sm:inline">PDF</span>
                    </button>
                </div>
                <button onClick={onAddProduct} className="flex-[2] md:flex-none bg-blue-600 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 active:scale-95">
                    <i className="fas fa-plus"></i> إضافة صنف
                </button>
            </div>
        </div>
    );
};