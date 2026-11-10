// المسار: components/Settings/Module_Settings_Container.js
window.Module_Settings_Container = function({ session, showToast }) {
    const { useState, useEffect, useRef } = React;

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile'); 
    
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);
    const [isKeyVisible, setIsKeyVisible] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '', username: '', password: '', confirmPassword: '',
        shop_name: '', phone: '', email: '', address: '', security_key: ''
    });

    const getDB = () => {
        const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
        const db = new window.Dexie(dbName);
        db.version(4).stores({
            settings: 'id, project_name, shop_name, phone, logo, email, address',
            local_users: '++id, username, full_name, role',
            active_session: 'id, user_id, login_time',
            products: '++id, name_ar, sku, category, stock_qty, price, cost',
            invoices: '++id, invoice_number, type, customer_vendor_id, date, total, status',
            invoice_items: '++id, invoice_id, product_id, price, qty, total_item'
        });
        return db;
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const db = getDB();
                await db.open();
                
                const activeSession = await db.active_session.toCollection().first();
                if (!activeSession) return;

                const user = await db.local_users.get(activeSession.user_id);
                const settings = await db.settings.toCollection().first();

                if (user && settings) {
                    setFormData({
                        full_name: user.full_name || '',
                        username: user.username || '',
                        password: '', confirmPassword: '',
                        shop_name: settings.shop_name || '',
                        phone: user.phone || settings.phone || '',
                        email: settings.email || '',
                        address: settings.address || '',
                        security_key: user.security_key || ''
                    });
                }
            } catch (err) {
                console.error(err);
                if(showToast) showToast('فشل تحميل الإعدادات', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generateSecurityKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let newKey = '';
        for (let i = 0; i < 12; i++) {
            if (i > 0 && i % 4 === 0) newKey += '-';
            newKey += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        handleChange('security_key', newKey);
        setIsKeyVisible(true);
    };

    const handleSave = async () => {
        if (formData.password && formData.password !== formData.confirmPassword) {
            return window.Swal.fire('خطأ', 'كلمتا المرور غير متطابقتين!', 'error');
        }

        setIsSaving(true);
        try {
            const db = getDB();
            await db.open();
            const activeSession = await db.active_session.toCollection().first();
            
            const userUpdate = { full_name: formData.full_name, username: formData.username, phone: formData.phone, security_key: formData.security_key };
            if (formData.password) userUpdate.password = formData.password;
            await db.local_users.update(activeSession.user_id, userUpdate);

            const settings = await db.settings.toCollection().first();
            await db.settings.update(settings.id, {
                shop_name: formData.shop_name,
                phone: formData.phone,
                email: formData.email,
                address: formData.address
            });

            localStorage.setItem('userName', formData.full_name);
            if(showToast) showToast('تم حفظ الإعدادات بنجاح', 'success');
        } catch (err) {
            window.Swal.fire('خطأ', 'فشل حفظ الإعدادات', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async (type) => {
        try {
            const db = getDB();
            let data = {};
            if (type === 'inventory') {
                data.products = await db.products.toArray();
            } else if (type === 'sales') {
                data.invoices = await db.invoices.toArray();
                data.invoice_items = await db.invoice_items.toArray();
            } else {
                data.products = await db.products.toArray();
                data.invoices = await db.invoices.toArray();
                data.invoice_items = await db.invoice_items.toArray();
                data.local_users = await db.local_users.toArray();
                data.settings = await db.settings.toArray();
            }

            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Mentra_Backup_${type}_${new Date().getTime()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            window.Swal.fire('خطأ', 'فشل التصدير', 'error');
        }
    };

    // تنفيذ الحذف الفعلي بعد استلام المفتاح من النافذة
    const handleFactoryReset = async (enteredKey) => {
        // مقارنة المفتاح (غير حساس لحالة الأحرف)
        if (enteredKey.toUpperCase() !== formData.security_key.toUpperCase()) {
            return window.Swal.fire({
                icon: 'error',
                title: 'مفتاح خاطئ',
                text: 'مفتاح الأمان الذي أدخلته غير صحيح. يرجى التأكد والمحاولة مرة أخرى.',
                customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold px-6 py-2 bg-red-600' }
            });
        }

        // إذا كان المفتاح صحيحاً، قم بالحذف
        try {
            const db = getDB();
            await db.delete(); // مسح قاعدة البيانات الحالية
            
            // إزالة المحل من قائمة المحلات في الـ LocalStorage
            const currentDBName = localStorage.getItem('mentra_current_db');
            let shops = JSON.parse(localStorage.getItem('mentra_shops_list') || '[]');
            shops = shops.filter(s => s.dbName !== currentDBName);
            localStorage.setItem('mentra_shops_list', JSON.stringify(shops));
            
            window.Swal.fire({
                icon: 'success',
                title: 'تم الحذف بنجاح',
                text: 'تم ضبط المصنع. سيتم تسجيل الخروج الآن...',
                showConfirmButton: false,
                timer: 1500,
                customClass: { popup: 'rounded-[2rem]' }
            });
            
            // تسجيل الخروج والعودة للصفحة الرئيسية
            setTimeout(() => {
                localStorage.clear();
                window.location.replace('index.html');
            }, 1500);
        } catch (err) {
            console.error(err);
            window.Swal.fire({
                icon: 'error',
                title: 'خطأ داخلي',
                text: 'حدث خطأ أثناء محاولة مسح البيانات.',
                customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold px-6 py-2' }
            });
        }
    };

    if (loading) return <div className="flex justify-center items-center p-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div></div>;

    return (
        <div className="space-y-6 md:space-y-8 animate-view pb-24 max-w-7xl mx-auto" dir="rtl">
            <window.SettingsHeader />
            
            <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-full md:w-fit mx-auto md:mx-0 snap-x">
                <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`snap-start shrink-0 px-6 py-3.5 md:py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'profile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    <i className="fas fa-user-shield"></i> بيانات الحساب والأمان
                </button>
                <button 
                    onClick={() => setActiveTab('import')} 
                    className={`snap-start shrink-0 px-6 py-3.5 md:py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'import' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    <i className="fas fa-file-excel"></i> رفع بيانات المنتجات
                </button>
                <button 
                    onClick={() => setActiveTab('backup')} 
                    className={`snap-start shrink-0 px-6 py-3.5 md:py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'backup' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    <i className="fas fa-database"></i> النسخ الاحتياطي وإدارة البيانات
                </button>
            </div>

            <div className="mt-4">
                {activeTab === 'profile' && (
                    <window.SettingsProfileForm 
                        formData={formData} 
                        onChange={handleChange} 
                        onSave={handleSave} 
                        isSaving={isSaving}
                        onGenerateKey={generateSecurityKey}
                        isKeyVisible={isKeyVisible}
                        setIsKeyVisible={setIsKeyVisible}
                    />
                )}

                {activeTab === 'import' && (
                    <window.SettingsExcelImport getDB={getDB} />
                )}

                {activeTab === 'backup' && (
                    <window.SettingsBackup 
                        onExport={handleExport} 
                        onTriggerImport={() => fileInputRef.current.click()} 
                        fileInputRef={fileInputRef} 
                        onFactoryReset={handleFactoryReset}
                        hasSecurityKey={!!formData.security_key}
                    />
                )}
            </div>
            
            <window.SettingsUpsell />
        </div>
    );
};