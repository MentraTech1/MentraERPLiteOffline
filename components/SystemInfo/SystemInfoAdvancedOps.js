window.SystemInfoAdvancedOps = function({ onCreateAdvanced, onQuickBackup, onRestoreBackup, onSettings }) {
    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><i className="fas fa-shield-alt"></i></div>
                    إدارة النسخ الاحتياطي
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-2">قم بتأمين بياناتك يدوياً أو استعادة نسخة سابقة.</p>
            </div>
            
            <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={onCreateAdvanced} className="flex items-start gap-4 p-5 bg-white border-2 border-emerald-100 rounded-2xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group text-right">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform"><i className="fas fa-lock"></i></div>
                    <div>
                        <span className="block font-black text-sm text-slate-800 mb-1">نسخة مشفرة</span>
                        <span className="block text-[10px] text-slate-500 font-bold leading-relaxed">أعلى درجات الأمان، يتم تشفير وضغط البيانات لملف صغير.</span>
                    </div>
                </button>

                <button onClick={onQuickBackup} className="flex items-start gap-4 p-5 bg-white border-2 border-blue-100 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all group text-right">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform"><i className="fas fa-bolt"></i></div>
                    <div>
                        <span className="block font-black text-sm text-slate-800 mb-1">نسخة سريعة</span>
                        <span className="block text-[10px] text-slate-500 font-bold leading-relaxed">تصدير فوري لملف JSON لسهولة القراءة والسرعة.</span>
                    </div>
                </button>

                <div className="relative flex items-start gap-4 p-5 bg-white border-2 border-amber-100 rounded-2xl hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 transition-all group text-right cursor-pointer">
                    <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform"><i className="fas fa-history"></i></div>
                    <div>
                        <span className="block font-black text-sm text-slate-800 mb-1">استعادة بيانات</span>
                        <span className="block text-[10px] text-slate-500 font-bold leading-relaxed">اختر ملف (.json أو .enc) لاسترجاع النظام كما كان.</span>
                    </div>
                    <input type="file" accept=".json,.enc" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onRestoreBackup} />
                </div>

                <button onClick={onSettings} className="flex items-start gap-4 p-5 bg-white border-2 border-slate-200 rounded-2xl hover:border-slate-800 hover:shadow-lg hover:shadow-slate-500/10 transition-all group text-right">
                    <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform"><i className="fas fa-cog"></i></div>
                    <div>
                        <span className="block font-black text-sm text-slate-800 mb-1">الإعدادات والجدولة</span>
                        <span className="block text-[10px] text-slate-500 font-bold leading-relaxed">تخصيص النسخ التلقائي والحد الأقصى للملفات المحفوظة.</span>
                    </div>
                </button>
            </div>

            {/* تم نقل سجل النسخ هنا ليكون السياق متصلاً */}
            <div className="mt-auto bg-slate-50/50 p-6 md:p-8 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-slate-800 text-sm"><i className="fas fa-list-ul text-slate-400 ml-2"></i> سجل العمليات السابقة</h4>
                    <button onClick={() => { if(window.loadBackupHistory) window.loadBackupHistory(); }} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        <i className="fas fa-sync-alt ml-1"></i> تحديث القائمة
                    </button>
                </div>
                <div id="backup-history-container" className="space-y-3 max-h-80 overflow-y-auto hide-scrollbar">
                    {/* يتم الحقن هنا */}
                </div>
            </div>
        </div>
    );
};