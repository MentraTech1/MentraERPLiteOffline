// المسار: components/Settings/SettingsBackup.js
window.SettingsBackup = function({ onExport, onTriggerImport, onImportFile, fileInputRef, onFactoryReset }) {
    return (
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 animate-view" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-4 border-b border-slate-50">
                <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><i className="fas fa-cloud-download-alt text-blue-500"></i> النسخ الاحتياطي وإدارة البيانات</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">يُرجى حفظ نسخة احتياطية من بياناتك بشكل دوري لتجنب فقدانها.</p>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept=".json" 
                    className="hidden" 
                    onChange={onImportFile} 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* المخزون */}
                <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-blue-200 transition-all">
                    <div className="absolute -right-4 -top-4 text-6xl text-blue-500/5 group-hover:scale-110 transition-transform"><i className="fas fa-box"></i></div>
                    <h4 className="font-black text-sm text-slate-700 z-10 flex items-center gap-2"><i className="fas fa-box text-blue-500"></i> الأصناف والمخازن</h4>
                    <div className="grid grid-cols-2 gap-2 mt-auto z-10">
                        <button onClick={() => onExport('inventory')} className="bg-white text-slate-600 border border-slate-200 p-2.5 rounded-xl font-bold text-[11px] hover:bg-slate-100 active:scale-95 transition-all">تصدير</button>
                        <button onClick={onTriggerImport} className="bg-blue-50 text-blue-600 p-2.5 rounded-xl font-bold text-[11px] hover:bg-blue-100 active:scale-95 transition-all">استيراد</button>
                    </div>
                </div>

                {/* المبيعات */}
                <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-emerald-200 transition-all">
                    <div className="absolute -right-4 -top-4 text-6xl text-emerald-500/5 group-hover:scale-110 transition-transform"><i className="fas fa-file-invoice-dollar"></i></div>
                    <h4 className="font-black text-sm text-slate-700 z-10 flex items-center gap-2"><i className="fas fa-file-invoice text-emerald-500"></i> الفواتير والحسابات</h4>
                    <div className="grid grid-cols-2 gap-2 mt-auto z-10">
                        <button onClick={() => onExport('sales')} className="bg-white text-slate-600 border border-slate-200 p-2.5 rounded-xl font-bold text-[11px] hover:bg-slate-100 active:scale-95 transition-all">تصدير</button>
                        <button onClick={onTriggerImport} className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl font-bold text-[11px] hover:bg-emerald-100 active:scale-95 transition-all">استيراد</button>
                    </div>
                </div>

                {/* النسخة الشاملة */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-800 rounded-[1.5rem] p-5 flex flex-col gap-4 text-white shadow-lg md:col-span-1 sm:col-span-2 relative overflow-hidden">
                    <div className="absolute -left-6 -bottom-6 text-7xl text-white/5"><i className="fas fa-database"></i></div>
                    <div>
                        <h4 className="font-black text-sm text-white mb-1"><i className="fas fa-database text-rose-400 ml-1"></i> النظام بالكامل</h4>
                        <p className="text-[10px] text-slate-400 font-bold">نسخة شاملة (منتجات، فواتير، إعدادات)</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 mt-auto z-10">
                        <button onClick={() => onExport('full')} className="bg-rose-500 text-white p-3 rounded-xl font-black text-xs hover:bg-rose-600 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <i className="fas fa-download"></i> إنشاء نسخة احتياطية
                        </button>
                    </div>
                </div>

            </div>
            
            {/* Danger Zone */}
            <div className="mt-8 pt-6 border-t border-red-100 flex items-center justify-between bg-red-50/50 p-4 rounded-2xl">
                <div>
                    <h4 className="font-black text-red-600 text-sm flex items-center gap-2"><i className="fas fa-exclamation-triangle"></i> منطقة الخطر</h4>
                    <p className="text-[10px] font-bold text-red-400 mt-1">حذف كافة البيانات نهائياً وبدء النظام من جديد.</p>
                </div>
                <button onClick={onFactoryReset} className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl font-black text-xs transition-all active:scale-95">
                    إعادة ضبط المصنع
                </button>
            </div>
        </div>
    );
};