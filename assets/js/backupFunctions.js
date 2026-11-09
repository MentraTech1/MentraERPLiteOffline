/**
 * MENTRA ERP - Backup Functions
 * تم إصلاح أخطاء DOM Null وضبط Pagination لـ 3
 */

const swalCustomClass = {
    popup: 'rounded-3xl',
    confirmButton: 'rounded-xl font-bold',
    cancelButton: 'rounded-xl font-bold'
};

// 1. النسخ الاحتياطي السريع
window.createQuickBackup = async () => {
    try {
        Swal.fire({
            title: 'جاري إنشاء النسخة...',
            text: 'يرجى الانتظار، يتم تصدير بياناتك...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); },
            customClass: swalCustomClass
        });

        const result = await backupManager.createFullBackup({
            encrypt: false,
            compress: false,
            description: `نسخة سريعة - ${new Date().toLocaleString('ar-EG')}`
        }); 
        
        if (result.success) {
            await backupManager.saveBackupToFile(result.data, result.filename);
            if (typeof window.loadBackupHistory === 'function') window.loadBackupHistory();
            
            Swal.fire({
                icon: 'success', title: 'نجح التصدير!', text: 'تم إنشاء نسخة احتياطية سريعة بنجاح',
                confirmButtonText: 'تم', customClass: swalCustomClass
            });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'فشل النسخ الاحتياطي', text: error.message, customClass: swalCustomClass });
    }
};

// 2. تحميل سجل النسخ الاحتياطية (Pagination Limit = 3)
window._currentBackupsList = [];
window._visibleBackupCount = 3; 

window.loadBackupHistory = async (isLoadMore = false) => {
    try {
        const container = document.getElementById('backup-history-container');
        if (!container) return; 

        if (!isLoadMore) {
            window._currentBackupsList = await backupManager.getBackupList();
            window._visibleBackupCount = 3; 
        }

        const backups = window._currentBackupsList;
        
        if (backups.length === 0) {
            container.innerHTML = `
                <div class="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <div class="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-sm mb-4">
                        <i class="fas fa-inbox text-2xl text-slate-300"></i>
                    </div>
                    <p class="text-slate-500 font-bold text-sm">لا توجد نسخ احتياطية حالياً</p>
                </div>
            `;
            return;
        }

        const visibleBackups = backups.slice(0, window._visibleBackupCount);
        let htmlContent = visibleBackups.map(backup => `
            <div class="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl ${backup.encrypted ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <i class="fas ${backup.encrypted ? 'fa-shield-alt' : 'fa-file-archive'} text-xl"></i>
                    </div>
                    <div class="min-w-0">
                        <p class="font-black text-sm text-slate-800 truncate" dir="ltr">${backup.filename}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-[11px] font-bold text-slate-500"><i class="far fa-clock mr-1"></i> ${new Date(backup.timestamp).toLocaleString('ar-EG')}</span>
                            <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span class="text-[11px] font-black ${backup.encrypted ? 'text-emerald-500' : 'text-blue-500'}">${backup.encrypted ? 'مشفرة' : 'عادية'}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-3 shrink-0 pl-2">
                    <span class="text-[11px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md hidden sm:block">${(backup.size / 1024).toFixed(1)} KB</span>
                    <button onclick="deleteBackupRecord(${backup.id})" class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="حذف النسخة">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');

        if (window._visibleBackupCount < backups.length) {
            htmlContent += `
                <button onclick="loadMoreBackups()" class="w-full py-4 mt-2 bg-slate-50 border border-slate-100 text-blue-600 rounded-2xl font-black text-xs hover:bg-blue-50 hover:border-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <span>عرض المزيد (${backups.length - window._visibleBackupCount} متبقي)</span>
                    <i class="fas fa-chevron-down animate-bounce mt-1"></i>
                </button>
            `;
        }

        container.innerHTML = htmlContent;
    } catch (error) {
        console.error('History load error:', error);
    }
};

window.loadMoreBackups = () => {
    window._visibleBackupCount += 3; 
    window.loadBackupHistory(true);
};

// 3. حذف النسخة
window.deleteBackupRecord = async (backupId) => {
    try {
        const confirmed = await Swal.fire({
            title: 'حذف النسخة؟', text: 'هل أنت متأكد من حذف هذا السجل؟', icon: 'warning',
            showCancelButton: true, confirmButtonText: 'نعم، حذف', cancelButtonText: 'إلغاء', customClass: swalCustomClass
        });

        if (confirmed.isConfirmed) {
            await backupManager.deleteBackup(backupId);
            window.loadBackupHistory(); 
            Swal.fire({ icon: 'success', title: 'تم الحذف!', showConfirmButton: false, timer: 1500, customClass: swalCustomClass });
        }
    } catch (error) { console.error(error); }
};

// 4. إعدادات النسخ الاحتياطي
window.showBackupSettings = async () => {
    try {
        const settings = await backupManager.db.settings.get(1) || { auto_backup: true, schedule: 'daily' };
        const { value: formValues } = await Swal.fire({
            title: 'إعدادات النسخ الاحتياطي',
            html: `
                <div class="text-right space-y-4">
                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <label class="font-bold text-sm">النسخ الاحتياطي التلقائي</label>
                        <input type="checkbox" id="auto_backup" ${settings.auto_backup ? 'checked' : ''} class="w-5 h-5">
                    </div>
                    <div class="p-3 bg-slate-50 rounded-xl">
                        <label class="font-bold text-sm block mb-2">جدولة النسخ</label>
                        <select id="schedule" class="w-full p-2 border border-slate-300 rounded-lg text-sm">
                            <option value="hourly" ${settings.schedule === 'hourly' ? 'selected' : ''}>كل ساعة</option>
                            <option value="daily" ${settings.schedule === 'daily' ? 'selected' : ''}>يومياً</option>
                            <option value="weekly" ${settings.schedule === 'weekly' ? 'selected' : ''}>أسبوعياً</option>
                        </select>
                    </div>
                </div>
            `,
            showCancelButton: true, confirmButtonText: 'حفظ الإعدادات',
            preConfirm: () => ({
                auto_backup: document.getElementById('auto_backup').checked,
                schedule: document.getElementById('schedule').value,
            }),
            customClass: swalCustomClass
        });

        if (formValues) {
            await backupManager.saveSettings(formValues);
            Swal.fire({ icon: 'success', title: 'تم الحفظ', timer: 1500, showConfirmButton: false, customClass: swalCustomClass });
        }
    } catch (error) { console.error(error); }
};

// 5. استعادة نسخة احتياطية من ملف (مع شريط تحميل ذكي)
window.restoreBackupFromFile = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    try {
        const confirmed = await Swal.fire({
            title: 'تأكيد الاستعادة الخطرة',
            text: 'سيتم مسح جميع بياناتك الحالية واستبدالها ببيانات هذا الملف. هل أنت متأكد؟',
            icon: 'warning',
            showCancelButton: true, confirmButtonText: 'نعم، استعادة البيانات', cancelButtonText: 'إلغاء',
            confirmButtonColor: '#ef4444', customClass: swalCustomClass
        });

        if (!confirmed.isConfirmed) {
            event.target.value = '';
            return;
        }

        Swal.fire({
            title: 'جاري استعادة النظام...',
            html: `
                <div class="mt-4">
                    <div class="text-sm font-bold text-slate-600 mb-2" id="restore-status">جاري قراءة الملف...</div>
                    <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div id="restore-progress-bar" class="bg-blue-500 h-full transition-all duration-200" style="width: 0%"></div>
                    </div>
                </div>
            `,
            allowOutsideClick: false, showConfirmButton: false, customClass: swalCustomClass
        });

        // إعطاء المتصفح فرصة لرسم نافذة التحميل قبل بدء العمليات الثقيلة
        await new Promise(resolve => setTimeout(resolve, 100));

        const updateUI = (info) => {
            const statusEl = document.getElementById('restore-status');
            const barEl = document.getElementById('restore-progress-bar');
            if (statusEl) statusEl.innerText = `${info.percent}% - ${info.status}`;
            if (barEl) barEl.style.width = `${info.percent}%`;
        };

        const backupData = await backupManager.loadBackupFromFile(file);
        const options = { encrypted: file.name.endsWith('.enc'), compressed: true, clearBeforeRestore: true };
        const result = await backupManager.restoreBackup(backupData, options, updateUI);
        
        if (result.success) {
            Swal.fire({
                icon: 'success', title: 'نجحت الاستعادة!',
                text: 'تم استرجاع بياناتك بنجاح. سيتم إعادة تحميل النظام لتطبيق التغييرات.',
                confirmButtonText: 'إعادة تحميل النظام', allowOutsideClick: false, customClass: swalCustomClass
            }).then(() => {
                window.location.reload(); 
            });
        }
    } catch (error) {
        console.error('Restore error:', error);
        Swal.fire({ icon: 'error', title: 'فشل الاستعادة', text: error.message, confirmButtonText: 'حسناً', customClass: swalCustomClass });
    } finally {
        if (event.target) event.target.value = ''; 
    }
};