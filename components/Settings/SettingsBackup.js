// المسار: components/Settings/SettingsBackup.js
window.SettingsBackup = function({ onExport, onTriggerImport, onImportFile, fileInputRef, onFactoryReset }) {
    // تعريف State للتحكم في النافذة المنبثقة ونص التأكيد
    const { useState } = React;
    const [showResetModal, setShowResetModal] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    // الكلمة المطلوبة لتأكيد الحذف
    const requiredWord = "حذف";

    // فتح نافذة التحذير
    const handleOpenResetModal = () => {
        setConfirmText(""); // تصفير الحقل عند الفتح
        setShowResetModal(true);
    };

    // تنفيذ الحذف الفعلي
    const handleConfirmReset = () => {
        if (confirmText === requiredWord) {
            setShowResetModal(false);
            onFactoryReset(); // استدعاء الدالة الأصلية للحذف
        }
    };

    return (
        <div className="relative">
            {/* المحتوى الأساسي للصفحة */}
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
                <div className="mt-8 pt-6 border-t border-red-100 flex items-center justify-between bg-red-50/50 p-4 rounded-2xl border-2 border-transparent hover:border-red-100 transition-colors">
                    <div>
                        <h4 className="font-black text-red-600 text-sm flex items-center gap-2"><i className="fas fa-exclamation-triangle"></i> منطقة الخطر (إعادة ضبط)</h4>
                        <p className="text-[10px] font-bold text-red-400 mt-1">حذف كافة البيانات نهائياً وبدء النظام من جديد.</p>
                    </div>
                    {/* تم تغيير الزر ليفتح القائمة المنبثقة بدلاً من التنفيذ المباشر */}
                    <button onClick={handleOpenResetModal} className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-sm">
                        تهيئة النظام
                    </button>
                </div>
            </div>

            {/* ==================================================== */}
            {/* النافذة المنبثقة للتحذير من إعادة ضبط المصنع (شيك وآمنة) */}
            {/* ==================================================== */}
            {showResetModal && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out forwards' }}>
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative transform transition-all border border-red-100" style={{ animation: 'slideUp 0.3s ease-out forwards' }}>
                        
                        {/* أيقونة التحذير المتحركة */}
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-inner">
                            <i className="fas fa-radiation-alt animate-spin" style={{ animationDuration: '3s' }}></i>
                        </div>
                        
                        {/* النصوص التحذيرية */}
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black text-slate-800 mb-2">تحذير أمني خطير!</h3>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed bg-red-50 p-3 rounded-xl border border-red-100">
                                أنت على وشك <span className="text-red-600 font-black">حذف جميع بيانات النظام بالكامل</span> بما في ذلك الفواتير والمخازن. هذه العملية لا يمكن التراجع عنها!
                            </p>
                        </div>

                        {/* حقل الإدخال للتأكيد */}
                        <div className="mb-6">
                            <label className="block text-center text-xs font-black text-slate-400 mb-2">
                                لتأكيد العملية، يرجى كتابة كلمة <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded">حذف</span> أدناه:
                            </label>
                            <input 
                                type="text" 
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="اكتب كلمة حذف هنا"
                                className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl text-center font-black text-slate-800 outline-none focus:border-red-400 focus:bg-white transition-all shadow-inner"
                            />
                        </div>

                        {/* الأزرار */}
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowResetModal(false)} 
                                className="flex-1 py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl font-black text-sm transition-colors active:scale-95 border border-slate-200">
                                تراجع وإلغاء
                            </button>
                            <button 
                                onClick={handleConfirmReset} 
                                disabled={confirmText !== requiredWord}
                                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 group">
                                <i className="fas fa-trash-alt group-hover:animate-bounce"></i> تأكيد الحذف
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};