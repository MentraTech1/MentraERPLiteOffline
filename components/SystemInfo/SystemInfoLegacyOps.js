window.SystemInfoLegacyOps = function({ onExportExcel, onImportExcel, onClearSystem }) {
    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center"><i className="fas fa-file-excel"></i></div>
                    أدوات البيانات
                </h3>
            </div>
            
            <div className="p-6 space-y-4">
                <button onClick={onExportExcel} className="w-full flex items-center justify-between p-4 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-100 hover:shadow-md transition-all group active:scale-95">
                    <div className="flex items-center gap-3">
                        <i className="fas fa-file-export text-xl group-hover:-translate-y-1 transition-transform"></i>
                        <span className="font-black text-sm">تصدير Excel</span>
                    </div>
                    <i className="fas fa-chevron-left text-xs opacity-50"></i>
                </button>
                
                <div className="relative w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 hover:shadow-md transition-all group cursor-pointer active:scale-95">
                    <div className="flex items-center gap-3">
                        <i className="fas fa-file-import text-xl group-hover:translate-y-1 transition-transform"></i>
                        <span className="font-black text-sm">استيراد Excel</span>
                    </div>
                    <i className="fas fa-chevron-left text-xs opacity-50"></i>
                    <input type="file" accept=".xlsx, .xls" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onImportExcel} />
                </div>

                <div className="w-full h-px bg-slate-100 my-4"></div>

                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-center">
                    <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h4 className="font-black text-rose-700 text-sm mb-1">منطقة الخطر</h4>
                    <p className="text-[10px] text-rose-600/80 font-bold mb-4">هذا الإجراء سيقوم بحذف كافة فواتيرك ومنتجاتك نهائياً.</p>
                    <button onClick={onClearSystem} className="w-full py-3 bg-rose-600 text-white rounded-xl font-black text-xs hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20 active:scale-95">
                        <i className="fas fa-trash-alt ml-2"></i> تصفير النظام بالكامل
                    </button>
                </div>
            </div>
        </div>
    );
};