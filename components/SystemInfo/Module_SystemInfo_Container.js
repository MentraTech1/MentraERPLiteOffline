// المسار: components/SystemInfo/Module_SystemInfo_Container.js
window.Module_SystemInfo_Container = function(props) {
    const { useState, useEffect } = React;
    const { SystemInfoHeader, SystemInfoProgress, SystemInfoOverview, SystemInfoAdvancedOps, SystemInfoLegacyOps, SystemInfoUpsell } = window;

    // States
    const [counts, setCounts] = useState({ products: 0, invoices: 0, accounts: 0, journal: 0, stock_movements: 0, invoice_items: 0 });
    const [progress, setProgress] = useState({ isVisible: false, status: '', percent: 0, details: '' });

    // استدعاء السجلات الخاصة بالقاعدة
    const fetchCounters = async () => {
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({
                products: '++id', invoices: '++id', invoice_items: '++id',
                accounts: '++id', journal: '++id', stock_movements: '++id'
            });

            const tables = ['products', 'invoices', 'invoice_items', 'accounts', 'journal', 'stock_movements'];
            let newCounts = {};
            for (let table of tables) {
                newCounts[table] = await db[table].count();
            }
            setCounts(newCounts);
        } catch (e) { console.error("Counter Fetch Error:", e); }
    };

    // التشغيل الأول
    useEffect(() => { 
        fetchCounters(); 
        if(window.loadBackupHistory) window.loadBackupHistory();
    }, []);

    // 1. المعالجات الخاصة بالنسخ المتقدم BackupManager
    const handleAdvancedBackup = async () => {
        try {
            if(!window.backupManager) throw new Error("مكتبة النسخ غير متوفرة");
            
            setProgress({ isVisible: true, status: 'جاري تهيئة النسخة المتقدمة...', percent: 0, details: 'جمع البيانات...' });
            
            // دالة تحديث الواجهة لتتوافق مع نظام الـ Lazy Loading للبيانات الضخمة
            const updateUI = (info) => {
                setProgress({ isVisible: true, status: info.status, percent: info.percent, details: info.details });
            };

            const result = await window.backupManager.createFullBackup({
                encrypt: true, 
                compress: true, 
                description: `نسخة متقدمة - ${new Date().toLocaleString('ar-EG')}`
            }, updateUI); // تمرير دالة التحديث
            
            if (result.success) {
                setProgress({ isVisible: true, status: '✅ تم الإنشاء بنجاح!', percent: 100, details: `المدة: ${result.duration}ms | الحجم: ${(result.metadata.size / 1024).toFixed(1)}KB` });
                await window.backupManager.saveBackupToFile(result.data, result.filename);
                
                setTimeout(() => {
                    setProgress({ isVisible: false, status: '', percent: 0, details: '' });
                    if(window.loadBackupHistory) window.loadBackupHistory();
                    window.Swal.fire({ icon: 'success', title: 'نجح النسخ الاحتياطي', text: 'تم إنشاء نسخة مشفرة ومضغوطة بنجاح', customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold' } });
                }, 2000);
            }
        } catch (error) {
            window.Swal.fire({ icon: 'error', title: 'فشل النسخ الاحتياطي', text: error.message, customClass: { popup: 'rounded-3xl' } });
            setProgress({ isVisible: false, status: '', percent: 0, details: '' });
        }
    };

    // 2. المعالجات (Handlers) الخاصة بالـ Excel
    const handleExportExcel = async () => {
        try {
            if (!window.XLSX) return window.Swal.fire('خطأ', 'مكتبة Excel غير متوفرة', 'error');
            const wb = window.XLSX.utils.book_new();
            const tables = ['products', 'invoices', 'invoice_items', 'accounts', 'journal', 'journal_items', 'stock_movements'];
            
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({
                products: '++id, name_ar', invoices: '++id', invoice_items: '++id',
                accounts: '++id', journal: '++id', journal_items: '++id', stock_movements: '++id'
            });

            for (let table of tables) {
                const data = await db[table].toArray();
                const ws = window.XLSX.utils.json_to_sheet(data);
                window.XLSX.utils.book_append_sheet(wb, ws, table);
            }
            window.XLSX.writeFile(wb, `MENTRA_EXCEL_EXPORT_${new Date().getTime()}.xlsx`);
        } catch(e) { console.error(e); window.Swal.fire('خطأ', 'فشل التصدير', 'error'); }
    };

    // 3. استيراد الإكسيل
    const handleImportExcel = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                if (!window.XLSX) throw new Error("مكتبة الاستيراد غير متوفرة");
                const data = new Uint8Array(e.target.result);
                const workbook = window.XLSX.read(data, { type: 'array' });
                const totalSheets = workbook.SheetNames.length;
                
                if (!window.confirm("⚠️ تنبيه: سيتم تحديث البيانات الموجودة ببيانات الملف. استمرار؟")) {
                    event.target.value = null;
                    return;
                }

                setProgress({ isVisible: true, status: 'جاري قراءة ملف Excel...', percent: 0, details: 'جارٍ فتح الملف' });

                const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
                const db = new window.Dexie(dbName);
                db.version(4).stores({
                    products: '++id', invoices: '++id', invoice_items: '++id',
                    accounts: '++id', journal: '++id', journal_items: '++id', stock_movements: '++id'
                });

                await db.transaction('rw', db.products, db.invoices, db.invoice_items, db.accounts, db.journal, db.journal_items, db.stock_movements, async () => {
                    for (let i = 0; i < totalSheets; i++) {
                        const sheetName = workbook.SheetNames[i];
                        if (db[sheetName]) {
                            setProgress(p => ({ ...p, status: `جاري استيراد سجل: ${sheetName}` }));
                            let jsonData = window.XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                            const cleanData = jsonData.map(item => {
                                for (let key in item) {
                                    if (['id', 'qty', 'price', 'total', 'balance', 'cost', 'debit', 'credit'].some(k => key.includes(k))) {
                                        item[key] = parseFloat(item[key]) || 0;
                                    }
                                }
                                return item;
                            });
                            await db[sheetName].bulkPut(cleanData);
                        }
                        setProgress(p => ({ ...p, percent: Math.round(((i + 1) / totalSheets) * 100) }));
                    }
                });

                setProgress(p => ({ ...p, status: "✅ نجح الاستيراد!", percent: 100, details: "تم حفظ السجلات في قاعدة البيانات" }));
                setTimeout(() => {
                    setProgress({ isVisible: false, status: '', percent: 0, details: '' });
                    fetchCounters();
                    window.Swal.fire({icon:'success', title:'تم بنجاح', text:'تم تحديث الجداول بنجاح!', customClass: {popup:'rounded-3xl'}});
                }, 1000);
            } catch (err) {
                window.Swal.fire({icon:'error', title:'فشل الاستيراد', text: err.message, customClass: {popup:'rounded-3xl'}});
                setProgress({ isVisible: false, status: '', percent: 0, details: '' });
            }
            event.target.value = null; // تفريغ الـ input لاستخدامه مرة أخرى
        };
        reader.readAsArrayBuffer(file);
    };

    // 4. تصفير النظام (حذف جميع البيانات)
    const handleClearSystem = async () => {
        const confirm1 = window.confirm("⚠️ تحذير نهائي: أنت على وشك حذف كافة البيانات. هل أنت متأكد؟");
        if (!confirm1) return;

        const confirm2 = window.prompt("لتأكيد الحذف النهائي، اكتب كلمة (حذف) في المربع أدناه:");
        if (confirm2 !== 'حذف') return;
        
        try {
            setProgress({ isVisible: true, status: 'جاري مسح قواعد البيانات...', percent: 30, details: 'هذه العملية لا يمكن التراجع عنها' });
            
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            const tables = ['products', 'invoices', 'invoice_items', 'accounts', 'journal', 'journal_items', 'stock_movements'];
            
            db.version(4).stores({
                products: '++id', invoices: '++id', invoice_items: '++id',
                accounts: '++id', journal: '++id', journal_items: '++id', stock_movements: '++id'
            });

            await db.transaction('rw', tables, async () => {
                for (let table of tables) { await db[table].clear(); }
            });

            setProgress({ isVisible: true, status: '✅ تم تصفير النظام بنجاح!', percent: 100, details: 'قاعدة البيانات فارغة تماماً الآن' });
            
            setTimeout(() => {
                setProgress({ isVisible: false, status: '', percent: 0, details: '' });
                fetchCounters();
                window.Swal.fire({icon: 'success', title: 'عملية ناجحة', text: 'تم مسح كافة البيانات بنجاح.', customClass:{popup:'rounded-3xl'}});
            }, 1000);
        } catch (err) {
            window.Swal.fire({icon: 'error', title: 'فشل المسح', text: err.message, customClass:{popup:'rounded-3xl'}});
            setProgress({ isVisible: false, status: '', percent: 0, details: '' });
        }
    };

    // الرندر (الواجهة)
    return (
        <div className="animate-view space-y-6 pb-20" dir="rtl" style={{ WebkitTapHighlightColor: 'transparent' }}>
            <SystemInfoHeader />
            
            <SystemInfoProgress {...progress} />
            
            <SystemInfoOverview counts={counts} />
            
            {/* تخطيط جديد: شبكة تفصل العمليات المتقدمة عن العمليات التقليدية */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <SystemInfoAdvancedOps 
                        onCreateAdvanced={handleAdvancedBackup}
                        onQuickBackup={() => { if(window.createQuickBackup) window.createQuickBackup(); }}
                        onRestoreBackup={(e) => { if(window.restoreBackupFromFile) window.restoreBackupFromFile(e); }}
                        onSettings={() => { if(window.showBackupSettings) window.showBackupSettings(); }}
                    />
                </div>
                
                <div className="lg:col-span-4">
                    <SystemInfoLegacyOps 
                        onRefreshHistory={() => { if(window.loadBackupHistory) window.loadBackupHistory(); }}
                        onExportExcel={handleExportExcel}
                        onImportExcel={handleImportExcel}
                        onClearSystem={handleClearSystem}
                    />
                </div>
            </div>

            {window.SystemInfoUpsell && <SystemInfoUpsell />}
        </div>
    );
};