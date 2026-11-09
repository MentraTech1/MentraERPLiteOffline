// المسار: components/ProfitReport/Module_ProfitReport_Container.js
window.Module_ProfitReport_Container = function() {
    const { useState, useEffect } = React;
    const { ProfitReportHeader, ProfitReportKPIs, ProfitReportInsight, ProfitReportTransactions } = window;

    // الحصول على تواريخ افتراضية (اليوم حتى أول الشهر)
    const getInitialDates = () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        firstDay.setHours(12); // تعويض فرق التوقيت
        return {
            from: firstDay.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0]
        };
    };

    // States
    const [dateFilter, setDateFilter] = useState(getInitialDates());
    const [reportData, setReportData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // جلب وحساب البيانات المعقدة
    const fetchProfitData = async () => {
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({
                products: '++id, name_ar, sku, category, stock_qty, price, cost', 
                invoices: '++id, invoice_number, type, customer_vendor_id, date, total, status',
                invoice_items: '++id, invoice_id, product_id, price, qty, total_item',
                journal: '++id, date, ref_no, description, total'
            });

            const dateFrom = new Date(dateFilter.from); dateFrom.setHours(0, 0, 0, 0);
            const dateTo = new Date(dateFilter.to); dateTo.setHours(23, 59, 59, 999);
            
            let totalGrossRevenue = 0, totalReturns = 0, totalGrossCOGS = 0, totalReturnsCOGS = 0;
            let totalPurchases = 0, totalExpenses = 0; 
            let transactions = [];
            
            const [allInvoices, allInvoiceItems, allProducts, allJournals] = await Promise.all([
                db.invoices.toArray(),
                db.invoice_items.toArray(),
                db.products.toArray(),
                db.journal.toArray() 
            ]);

            const productMap = new Map();
            allProducts.forEach(p => productMap.set(p.id, p));
            
            // 1. الفواتير
            for (const inv of allInvoices) {
                if (!inv.date) continue;
                const invDate = new Date(inv.date);
                if (invDate < dateFrom || invDate > dateTo) continue; 
                if (inv.status === 'cancelled' || inv.status === 'draft') continue; 
                
                const amount = parseFloat(String(inv.total || '0').replace(/[^0-9.-]+/g, "")) || 0;
                if (amount === 0) continue;

                const typeStr = String(inv.type || '').toLowerCase().trim();
                const refNo = inv.invoice_number || `INV-${inv.id}`;
                
                if (typeStr.includes('sale') && !typeStr.includes('return') && !typeStr.includes('مرتجع')) {
                    totalGrossRevenue += amount;
                    let invoiceCOGS = 0;
                    allInvoiceItems.filter(item => item.invoice_id === inv.id).forEach(item => {
                        const product = productMap.get(item.product_id);
                        invoiceCOGS += ((product ? parseFloat(product.cost) || 0 : 0) * parseFloat(item.qty || 0));
                    });
                    totalGrossCOGS += invoiceCOGS;
                    transactions.push({ date: inv.date, ref: refNo, description: 'مبيعات للعملاء', out: 0, in: amount, impact: 'فاتورة مبيعات', type: 'sale' });
                } 
                else if (typeStr.includes('purchase') || typeStr.includes('مشتري')) {
                    totalPurchases += amount;
                    transactions.push({ date: inv.date, ref: refNo, description: 'شراء بضاعة للمخزن', out: amount, in: 0, impact: 'فاتورة مشتريات', type: 'purchase' });
                }
                else if (typeStr.includes('return') || typeStr.includes('مرتجع')) {
                    const absAmount = Math.abs(amount);
                    totalReturns += absAmount; 
                    let returnCOGS = 0;
                    allInvoiceItems.filter(item => item.invoice_id === inv.id).forEach(item => {
                        const product = productMap.get(item.product_id);
                        returnCOGS += ((product ? parseFloat(product.cost) || 0 : 0) * Math.abs(parseFloat(item.qty || 0)));
                    });
                    totalReturnsCOGS += returnCOGS;
                    transactions.push({ date: inv.date, ref: refNo, description: 'مرتجع مبيعات', out: absAmount, in: 0, impact: 'مرتجع مبيعات', type: 'return' });
                }
            }

            // 2. القيود (المصروفات)
            for (const jrn of allJournals) {
                if (!jrn.date) continue;
                const jrnDate = new Date(jrn.date);
                if (jrnDate < dateFrom || jrnDate > dateTo) continue;
                if (jrn.type === 'SALE' || jrn.type === 'PURCHASE' || jrn.type === 'RETURN_SALE') continue;

                const amount = parseFloat(String(jrn.total || '0').replace(/[^0-9.-]+/g, "")) || 0;
                if (amount === 0) continue;

                totalExpenses += amount;
                transactions.push({ date: jrn.date, ref: jrn.ref_no || `JRN-${jrn.id}`, description: jrn.description || 'مصروف عام / قيد يومي', out: amount, in: 0, impact: 'قيد مصروفات', type: 'expense' });
            }
            
            // الحسابات النهائية
            const netRevenue = totalGrossRevenue - totalReturns;
            const netCOGS = totalGrossCOGS - totalReturnsCOGS;
            const grossProfit = netRevenue - netCOGS; 
            const netIncome = grossProfit - totalExpenses; 
            const netCashFlow = totalGrossRevenue - totalPurchases - totalExpenses - totalReturns;
            
            // ترتيب الحركات
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            setReportData({
                totalGrossRevenue, totalReturns, netRevenue,
                totalGrossCOGS, totalReturnsCOGS, netCOGS,
                totalPurchases, totalExpenses,
                grossProfit, netIncome, netCashFlow,
                transactions
            });

        } catch (error) { console.error('Error calculating:', error); }
    };

    // التشغيل الأول وعند الضغط على زر البحث
    useEffect(() => { fetchProfitData(); }, []);

    // معالجات الأحداث
    const handleDateChange = (field, val) => {
        setDateFilter(prev => ({ ...prev, [field]: val }));
    };

    const handleQuickDate = (type) => {
        const today = new Date();
        const to = today.toISOString().split('T')[0];
        let from = to;
        if (type === 'month') {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            firstDay.setHours(12);
            from = firstDay.toISOString().split('T')[0];
        }
        setDateFilter({ from, to });
        // البحث التلقائي بعد التغيير السريع
        setTimeout(fetchProfitData, 0); 
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchProfitData();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        if(window.innerWidth < 768) {
            document.getElementById('transactions-count-badge')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div className="animate-fade-in space-y-4 md:space-y-6 pb-12 px-2 sm:px-4 md:px-0" dir="rtl" style={{ WebkitTapHighlightColor: 'transparent' }}>
            <ProfitReportHeader 
                dateFilter={dateFilter} 
                onDateChange={handleDateChange} 
                onQuickDate={handleQuickDate} 
                onSearch={handleSearch} 
            />
            
            <ProfitReportKPIs data={reportData} />
            
            <ProfitReportInsight data={reportData} />
            
            <ProfitReportTransactions 
                transactions={reportData ? reportData.transactions : []} 
                currentPage={currentPage} 
                totalPages={reportData ? Math.ceil(reportData.transactions.length / itemsPerPage) : 0}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange} 
            />
        </div>
    );
};