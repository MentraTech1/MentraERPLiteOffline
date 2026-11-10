/* ===================================================================
   Mentra ERP Lite - Service Worker (100% Offline-First)
   تم تطبيق هندسة Stale-While-Revalidate والتوافق مع الحقن الديناميكي
   =================================================================== */

// تحديد رقم الإصدار (قم بزيادته عند أي تحديث في الملفات)
const CACHE_NAME = 'mentra-erp-lite-v230.0.0';

// قائمة بالملفات والمكونات الديناميكية المطلوب تخزينها مسبقاً
const STATIC_ASSETS = [
    // 1. الصفحات الأساسية
    './',
    './index.html',
    './login.html',
    './dashboard.html',
    './subscriptions.html',
    './Tutorial.html',
    './manifest.json',

    // 2. ملفات التصميم والأنيميشن
    './assets/css/style.css',
    './assets/aos.css',

    // 3. المكتبات الأساسية
    './assets/Tailwind.js',
    './assets/react.production.min.js',
    './assets/react-dom.production.min.js',
    './assets/babel.min.js',
    './assets/dexie.min.js',
    './assets/sweetalert2@11.js',
    './assets/axios.min.js',
    './assets/xlsx.full.min.js',
    './assets/aos.js',
    './assets/index.min.js', // مكتبة الباركود الخاصة بالمبيعات

    // 4. ملفات النظام (Core Scripts)
    './assets/js/db-init.js',
    './assets/js/BackupManager.js',
    './assets/js/syncManager.js',
    './assets/js/backupFunctions.js',
    './assets/js/JournalManager.js',

    // 5. الشاشات الديناميكية (Pages Modules)
    './pages/main.js',
    './pages/sales.js',
    './pages/sales_report.js',
    './pages/Inventory.js',
    './pages/purchases.js',
    './pages/purchases_report.js',
    './pages/returns.js',
    './pages/returns_log.js',
    './pages/accounts.js',
    './pages/journal.js',
    './pages/settings.js',
    './pages/system_info.js',
    './pages/profit_report.js',

    // ==========================================
    // 6. المكونات الفرعية للشاشات (React Components)
    // ==========================================
    
    // الرئيسية (Main)
    './components/Main/MainHeaderFilter.js',
    './components/Main/MainFinancialStats.js',
    './components/Main/MainInventoryActions.js',
    './components/Main/MainProBanner.js',
    './components/Main/Module_Main_Container.js',

    // المبيعات (Sales)
    './components/Sales/BarcodeScannerModal.js',
    './components/Sales/SalesSearch.js',
    './components/Sales/SalesCart.js',
    './components/Sales/SalesSummary.js',
    './components/Sales/Module_Sales_Container.js',

    // سجل المبيعات (Sales Report)
    './components/SalesReport/SalesReportHeader.js',
    './components/SalesReport/SalesReportStats.js',
    './components/SalesReport/SalesReportFilter.js',
    './components/SalesReport/SalesReportList.js',
    './components/SalesReport/SalesReportDetails.js',
    './components/SalesReport/Module_SalesReport_Container.js',

    // المشتريات (Purchases)
    './components/Purchases/PurchasesHeader.js',
    './components/Purchases/PurchasesSearch.js',
    './components/Purchases/PurchasesInputCard.js',
    './components/Purchases/PurchasesCart.js',
    './components/Purchases/PurchasesBottomBar.js',
    './components/Purchases/Module_Purchases_Container.js',

    // سجل المشتريات (Purchases Report)
    './components/PurchasesReport/PurchasesReportHeader.js',
    './components/PurchasesReport/PurchasesReportStats.js',
    './components/PurchasesReport/PurchasesReportFilter.js',
    './components/PurchasesReport/PurchasesReportList.js',
    './components/PurchasesReport/PurchasesReportDetails.js',
    './components/PurchasesReport/Module_PurchasesReport_Container.js',

    // المرتجعات (Returns)
    './components/Returns/ReturnsSearch.js',
    './components/Returns/ReturnsCart.js',
    './components/Returns/ReturnsSummary.js',
    './components/Returns/ReturnsScanner.js',
    './components/Returns/Module_Returns_Container.js',

    // سجل المرتجعات (Returns Log)
    './components/ReturnsLog/ReturnsLogHeader.js',
    './components/ReturnsLog/ReturnsLogStats.js',
    './components/ReturnsLog/ReturnsLogFilter.js',
    './components/ReturnsLog/ReturnsLogList.js',
    './components/ReturnsLog/ReturnsLogDetails.js',
    './components/ReturnsLog/Module_ReturnsLog_Container.js',

    // المخازن (Inventory)
    './components/Inventory/InventoryHeader.js',
    './components/Inventory/InventoryStats.js',
    './components/Inventory/InventoryFilterSearch.js',
    './components/Inventory/InventoryList.js',
    './components/Inventory/InventoryModal.js',
    './components/Inventory/Module_Inventory_Container.js',

    // الحسابات (Accounts)
    './components/Accounts/AccountsStats.js',
    './components/Accounts/AccountsFilter.js',
    './components/Accounts/AccountsList.js',
    './components/Accounts/AccountsModal.js',
    './components/Accounts/Module_Accounts_Container.js',

    // القيود والمصروفات (Journal)
    './components/Journal/JournalStats.js',
    './components/Journal/JournalFilter.js',
    './components/Journal/JournalList.js',
    './components/Journal/JournalModal.js',
    './components/Journal/ExpenseList.js',
    './components/Journal/ExpenseModal.js',
    './components/Journal/Module_Journal_Container.js',

    // تقرير الأرباح (Profit Report)
    './components/ProfitReport/ProfitReportHeader.js',
    './components/ProfitReport/ProfitReportKPIs.js',
    './components/ProfitReport/ProfitReportInsight.js',
    './components/ProfitReport/ProfitReportTransactions.js',
    './components/ProfitReport/Module_ProfitReport_Container.js',

    // الإعدادات (Settings)
    './components/Settings/SettingsHeader.js',
    './components/Settings/SettingsProfileForm.js',
    './components/Settings/SettingsBackup.js',
    './components/Settings/SettingsUpsell.js',
    './components/Settings/SettingsExcelImport.js',
    './components/Settings/Module_Settings_Container.js',

    // معلومات ونظام الأمان (System Info)
    './components/SystemInfo/SystemInfoHeader.js',
    './components/SystemInfo/SystemInfoProgress.js',
    './components/SystemInfo/SystemInfoOverview.js',
    './components/SystemInfo/SystemInfoAdvancedOps.js',
    './components/SystemInfo/SystemInfoHistory.js',
    './components/SystemInfo/SystemInfoLegacyOps.js',
    './components/SystemInfo/SystemInfoUpsell.js',
    './components/SystemInfo/Module_SystemInfo_Container.js',

    // ==========================================
    // 7. الصور والأيقونات الأساسية
    // ==========================================
    './assets/img/icon.png',
    './assets/img/profile.png',
    './assets/img/smalicon.png',
    './assets/img/smalicon-512.png',
    './assets/img/Screenshot.png',
    './assets/img/Screenshot (46).png',
    './assets/img/Screenshot (47).png',
    './assets/img/Screenshot (48).png',
    './assets/img/Screenshot (49).png'
];

// 1. مرحلة التثبيت (Install)
self.addEventListener('install', (event) => {
    console.log('[SW] جاري تهيئة التخزين المؤقت للعمل أوفلاين...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // استخدام Promise.allSettled لضمان عدم توقف التثبيت إذا كان هناك ملف مفقود
            const cachePromises = STATIC_ASSETS.map(async (url) => {
                try {
                    // إضافة بارامتر وهمي لمنع الكاش القديم للمتصفح من التدخل أثناء التثبيت
                    const request = new Request(url, { cache: 'reload' });
                    const response = await fetch(request);
                    if (response.ok) {
                        return await cache.put(url, response);
                    }
                } catch (err) {
                    console.warn(`[SW] تخطي الملف لعدم توفره حالياً: ${url}`);
                }
            });

            await Promise.allSettled(cachePromises);
            console.log('[SW] تم تثبيت الملفات بنجاح، التطبيق جاهز للأوفلاين 100%.');
        })
    );
    self.skipWaiting();
});

// 2. مرحلة التنشيط (Activate) - تنظيف الكاش القديم
self.addEventListener('activate', (event) => {
    console.log('[SW] جاري التفعيل وتنظيف الكاش القديم...');
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log(`[SW] حذف كاش قديم: ${key}`);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim()) 
    );
});

// 3. مرحلة اعتراض الطلبات (Fetch) - الحل السحري للمكونات الديناميكية (Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // تجاهل الطلبات التي ليست GET أو لا تبدأ بـ http (مثل طلبات الإضافات)
    // وتجاهل ملفات الإكسيل من التخزين لتجنب المشاكل
    if (request.method !== 'GET' || !request.url.startsWith('http') || request.url.includes('.xlsx')) return;

    event.respondWith(
        // استخدام ignoreSearch: true مهم جداً لتجاهل الـ ?v=Date.now() في ملف dashboard.html وملفات الـ js
        caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
            
            // استراتيجية (Cache First مع تحديث في الخلفية): 
            if (cachedResponse) {
                // تحديث الكاش في الخلفية صامتاً لضمان حصول المستخدم على أحدث نسخة في الزيارة القادمة
                fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, networkResponse.clone());
                        });
                    }
                }).catch(() => { /* تجاهل الخطأ لأننا أوفلاين بالفعل */ });

                return cachedResponse; // إرجاع النسخة المخزنة فوراً لسرعة فائقة
            }

            // إذا لم يكن الملف في الكاش، حاول جلبه من الشبكة
            return fetch(request).then((networkResponse) => {
                // حفظ نسخة من الملف الجديد في الكاش للاستخدام المستقبلي
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch((error) => {
                console.error('[SW] فشل جلب الملف والجهاز أوفلاين:', request.url);
                throw error;
            });
        })
    );
});