// المسار: components/Settings/SettingsBackup.js
window.SettingsBackup = function({ onExport, onTriggerImport, onImportFile, fileInputRef, onFactoryReset, hasSecurityKey }) {
    
    // دالة استدعاء النافذة المنبثقة (SweetAlert)
    const handleOpenResetModal = async () => {
        // 1. التحقق من وجود مفتاح أمان
        if (!hasSecurityKey) {
            return window.Swal.fire({
                icon: 'warning',
                title: 'تنبيه أمني',
                text: 'يجب إنشاء وحفظ مفتاح أمان (من تبويب بيانات الحساب) لتتمكن من فرمتة النظام.',
                customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold px-6 py-2 bg-blue-600' }
            });
        }

        // 2. إظهار نافذة SweetAlert الاحترافية
        const { value: enteredKey } = await window.Swal.fire({
            html: `
                <div class="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-inner mt-4">
                    <i class="fas fa-radiation-alt animate-spin" style="animation-duration: 3s;"></i>
                </div>
                <h3 class="text-2xl font-black text-slate-800 mb-2">تحذير أمني خطير!</h3>
                <p class="text-sm font-bold text-slate-500 leading-relaxed bg-red-50 p-3 rounded-xl border border-red-100 mb-4">
                    أنت على وشك <span class="text-red-600 font-black">حذف جميع بيانات النظام بالكامل</span>. هذه العملية لا يمكن التراجع عنها!
                </p>
                <label class="block text-center text-xs font-black text-slate-400 mb-2">
                    يرجى إدخال <span class="text-violet-600 font-black bg-violet-50 px-2 py-0.5 rounded border border-violet-100">مفتاح الأمان</span> لتأكيد الحذف:
                </label>
            `,
            input: 'text',
            inputPlaceholder: 'A1B2-C3D4-E5F6',
            inputAttributes: {
                dir: 'ltr',
                style: 'text-align: center; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;'
            },
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-trash-alt mr-2"></i> تأكيد الحذف',
            cancelButtonText: 'تراجع وإلغاء',
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-[2.5rem] p-4 border border-red-100 shadow-2xl',
                input: 'w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl text-center font-black tracking-widest text-slate-800 outline-none focus:border-red-400 focus:bg-white transition-all shadow-inner uppercase mx-auto w-[90%]',
                actions: 'flex gap-3 w-full px-4 mt-6',
                confirmButton: 'flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center justify-center',
                cancelButton: 'flex-1 py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl font-black text-sm transition-colors active:scale-95 border border-slate-200'
            },
            inputValidator: (value) => {
                if (!value) {
                    return 'يجب إدخال مفتاح الأمان!';
                }
            }
        });

        // 3. إذا قام المستخدم بإدخال المفتاح وضغط تأكيد
        if (enteredKey) {
            onFactoryReset(enteredKey.trim());
        }
    };

    return (
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 animate-view" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-4 border-b border-slate-50">
                <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><i className="fas fa-cloud-download-alt text-blue-500"></i> النسخ الاحتياطي وإدارة البيانات</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">يُرجى حفظ نسخة احتياطية من بياناتك بشكل دوري لتجنب فقدانها.</p>
                </div>
                <input type="file" ref={fileInputRef} accept=".json" className="hidden" onChange={onImportFile} />
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
                {/* استدعاء دالة الـ SweetAlert المخصصة */}
                <button onClick={handleOpenResetModal} className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-sm">
                    تهيئة النظام
                </button>
            </div>
        </div>
    );
};