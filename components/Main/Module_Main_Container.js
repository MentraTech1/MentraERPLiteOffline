// المسار: components/Main/Module_Main_Container.js
window.Module_Main_Container = function({ setActiveModule }) {
    const { useState, useEffect } = React;
    const { MainHeaderFilter, MainFinancialStats, MainInventoryActions, MainProBanner } = window;

    // تهيئة التواريخ
    const safeDate = (d) => { try { return String(d).split('T')[0]; } catch (e) { return ''; } };
    const todayStr = safeDate(new Date().toISOString());
    const [dateFilter, setDateFilter] = useState({ from: todayStr, to: todayStr });

    // حالة الإحصائيات (مأخوذة من حساباتك الأصلية)
    const [stats, setStats] = useState({
        netSales: 0, salesCount: 0,
        totalReturns: 0, returnsCount: 0,
        netCOGS: 0, totalExpenses: 0, expCount: 0,
        netProfit: 0, profitMargin: 0,
        totalStockValue: 0, productsCount: 0, lowStockCount: 0
    });

    const [isLoading, setIsLoading] = useState(true);

    const navigateToModule = (moduleId) => {
        if (setActiveModule) setActiveModule(moduleId);
    };

    const fetchAndUpdateStats = async () => {
        setIsLoading(true);
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({
                products: '++id, name_ar, sku, category, stock_qty, price, cost',
                invoices: '++id, invoice_number, type, customer_vendor_id, date, total, status',
                invoice_items: '++id, invoice_id, product_id, price, qty, total_item',
                journal: '++id, date, ref_no, description, total'
            });

            if (!db.isOpen()) await db.open();

            const dateFrom = new Date(dateFilter.from);
            dateFrom.setHours(0, 0, 0, 0);
            
            const dateTo = new Date(dateFilter.to);
            dateTo.setHours(23, 59, 59, 999);

            const [allInvoices, allInvoiceItems, products, allJournals] = await Promise.all([
                db.invoices.toArray(),
                db.invoice_items.toArray(),
                db.products.toArray(),
                db.journal.toArray()
            ]);

            const productMap = new Map();
            products.forEach(p => productMap.set(p.id, p));

            let totalGrossSales = 0, salesCount = 0;
            let totalReturns = 0, returnsCount = 0;
            let totalGrossCOGS = 0, totalReturnsCOGS = 0;
            let totalExpenses = 0, expCount = 0;

            // حساب الفواتير والمبيعات والمرتجعات
            allInvoices.forEach(inv => {
                if (inv.status === 'cancelled' || inv.status === 'draft' || !inv.date) return;

                const invDate = new Date(inv.date);
                if (invDate >= dateFrom && invDate <= dateTo) {
                    const amount = parseFloat(String(inv.total || '0').replace(/[^0-9.-]+/g, "")) || 0;
                    const typeStr = String(inv.type || '').toLowerCase().trim();

                    if (typeStr.includes('sale') && !typeStr.includes('return') && !typeStr.includes('مرتجع')) {
                        totalGrossSales += amount;
                        salesCount++;
                        allInvoiceItems.filter(item => item.invoice_id === inv.id).forEach(item => {
                            const p = productMap.get(item.product_id);
                            totalGrossCOGS += ((p ? parseFloat(p.cost) : 0) * parseFloat(item.qty || 0));
                        });
                    } else if (typeStr.includes('return') || typeStr.includes('مرتجع')) {
                        totalReturns += Math.abs(amount);
                        returnsCount++;
                        allInvoiceItems.filter(item => item.invoice_id === inv.id).forEach(item => {
                            const p = productMap.get(item.product_id);
                            totalReturnsCOGS += ((p ? parseFloat(p.cost) : 0) * Math.abs(parseFloat(item.qty || 0)));
                        });
                    }
                }
            });

            // حساب المصروفات من القيود
            allJournals.forEach(jrn => {
                if (!jrn.date || jrn.type === 'SALE' || jrn.type === 'PURCHASE' || jrn.type === 'RETURN_SALE') return;
                const jDate = new Date(jrn.date);
                if (jDate >= dateFrom && jDate <= dateTo) {
                    totalExpenses += parseFloat(String(jrn.total || '0').replace(/[^0-9.-]+/g, "")) || 0;
                    expCount++;
                }
            });

            // الحسابات النهائية
            const netSales = totalGrossSales - totalReturns;
            const netCOGS = totalGrossCOGS - totalReturnsCOGS;
            const grossProfit = netSales - netCOGS;
            const netProfit = grossProfit - totalExpenses;
            const profitMargin = netSales > 0 ? (netProfit / netSales) * 100 : 0;
            
            const totalStockValue = products.reduce((sum, p) => sum + ((Number(p.stock_qty) || 0) * (Number(p.cost) || 0)), 0);
            const lowStockCount = products.filter(p => (Number(p.stock_qty) || 0) <= (p.min_stock || 5)).length;

            setStats({
                netSales, salesCount,
                totalReturns, returnsCount,
                netCOGS, totalExpenses, expCount,
                netProfit, profitMargin,
                totalStockValue, productsCount: products.length, lowStockCount
            });

        } catch (error) {
            console.error("Dashboard calculation error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAndUpdateStats();
    }, [dateFilter]);

    return (
        <div className="animate-fade-in space-y-4 md:space-y-6 pb-16 px-2 sm:px-4 md:px-0" style={{ direction: 'rtl', WebkitTapHighlightColor: 'transparent' }}>
            <MainHeaderFilter 
                dateFilter={dateFilter} 
                setDateFilter={setDateFilter} 
            />
            
            {isLoading ? (
                <div className="text-center p-10"><i className="fas fa-circle-notch fa-spin text-3xl text-blue-500"></i></div>
            ) : (
                <>
                    <MainFinancialStats stats={stats} />
                    <MainInventoryActions stats={stats} navigateToModule={navigateToModule} />
                </>
            )}
            
            <MainProBanner />
        </div>
    );
};