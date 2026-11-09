// المسار: components/Journal/Module_Journal_Container.js
window.Module_Journal_Container = function() {
    const { useState, useEffect, useMemo, useRef } = React;
    const { JournalStats, JournalFilter, JournalList, JournalModal, ExpenseList, ExpenseModal } = window;

    const containerRef = useRef(null);

    const getInitialDates = () => {
        const d = new Date();
        const pad = n => n < 10 ? '0'+n : n;
        return {
            startDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`,
            endDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())}`
        };
    };

    // States
    const [activeTab, setActiveTab] = useState('journal'); // 'journal' | 'expenses'
    const [allEntries, setAllEntries] = useState([]);
    const [allJournalItems, setAllJournalItems] = useState([]); 
    const [accounts, setAccounts] = useState([]);
    
    const [filters, setFilters] = useState(getInitialDates());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    
    const [isChecking, setIsChecking] = useState(true);
    const [activeView, setActiveView] = useState('list'); // 'list' | 'form'

    useEffect(() => {
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur(); 
        }
        if (containerRef.current) containerRef.current.focus();
    }, [activeView, activeTab]);

    const vibrate = (type = 'click') => {
        if (navigator.vibrate) {
            if (type === 'success') navigator.vibrate([100, 50, 100]);
            else if (type === 'error' || type === 'delete') navigator.vibrate([50, 50]);
            else navigator.vibrate(20);
        }
    };

    const fetchData = async () => {
        setIsChecking(true);
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({
                journal: '++id, date, ref_no, description, total, type', // تأكد من وجود type
                journal_items: '++id, journal_id, account_id, debit, credit',
                accounts: '++id, code, name_ar, type, balance'
            });

            const [entries, items, accs] = await Promise.all([
                db.journal.reverse().toArray(),
                db.journal_items.toArray(),
                db.accounts.toArray()
            ]);

            setAllEntries(entries);
            setAllJournalItems(items);
            setAccounts(accs);
        } catch (e) { console.error("Database Fetch Error:", e); }
        setIsChecking(false);
    };

    useEffect(() => { fetchData(); }, []);

    // فصل القيود بناءً على التبويب النشط
    const tabEntries = useMemo(() => {
        if (activeTab === 'journal') {
            return allEntries; // في المحاسبة نعرض كل القيود
        } else {
            return allEntries.filter(e => e.type === 'EXPENSE'); // في المصروفات نعرض المصروفات فقط
        }
    }, [allEntries, activeTab]);

    const filteredEntries = useMemo(() => {
        if (!filters.startDate || !filters.endDate) return tabEntries;
        return tabEntries.filter(e => {
            const entryDate = String(e.date).substring(0, 10);
            return entryDate >= filters.startDate && entryDate <= filters.endDate;
        });
    }, [tabEntries, filters]);

    const stats = useMemo(() => {
        const totalVolume = filteredEntries.reduce((s, e) => s + (Number(e.total) || 0), 0);
        const dSum = allJournalItems.reduce((s, i) => s + (Number(i.debit) || 0), 0);
        const cSum = allJournalItems.reduce((s, i) => s + (Number(i.credit) || 0), 0);
        const isBalanced = Math.abs(dSum - cSum) < 0.01;
        return { count: filteredEntries.length, totalVolume, isBalanced, isChecking };
    }, [filteredEntries, allJournalItems, isChecking]);

    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
    const paginatedEntries = filteredEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleApplyFilter = (newFilters) => { setFilters(newFilters); setCurrentPage(1); };
    const handleResetFilter = () => { setFilters({ startDate: '', endDate: '' }); setCurrentPage(1); };

    const handleDeleteEntry = async (id) => {
        const res = await window.Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "سيتم حذف القيد وتأثيره المالي بالكامل.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonText: 'إلغاء',
            confirmButtonText: 'نعم، احذف',
            customClass: {popup: 'rounded-3xl'}
        });

        if (res.isConfirmed) {
            try {
                const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
                const db = new window.Dexie(dbName);
                db.version(4).stores({ journal: '++id, date, ref_no, description, total', journal_items: '++id, journal_id, account_id, debit, credit' });
                await db.transaction('rw', [db.journal, db.journal_items], async () => {
                    await db.journal.delete(id);
                    await db.journal_items.where('journal_id').equals(id).delete();
                });
                vibrate('delete');
                window.Swal.fire({ icon: 'success', title: 'تم الحذف', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                fetchData();
            } catch (e) {
                window.Swal.fire({ icon: 'error', title: 'خطأ', text: e.message, customClass: {popup: 'rounded-3xl'} });
            }
        }
    };

    // حفظ قيد محاسبي معقد (القديم)
    const handleSaveJournal = async (header, validRows, totalDebit) => {
        const isoDate = header.date ? new Date(header.date).toISOString() : new Date().toISOString();
        const refNo = header.ref || 'JV-' + Date.now().toString().slice(-4);
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({ journal: '++id, date, ref_no, description, total', journal_items: '++id, journal_id, account_id, debit, credit' });
            await db.transaction('rw', [db.journal, db.journal_items], async () => {
                const jId = await db.journal.add({
                    date: isoDate, ref_no: refNo, description: header.desc || 'قيد يدوي', total: totalDebit, type: 'MANUAL'
                });
                for (let r of validRows) {
                    await db.journal_items.add({ journal_id: jId, account_id: Number(r.accountId), debit: parseFloat(r.debit) || 0, credit: parseFloat(r.credit) || 0 });
                }
            });
            vibrate('success');
            setActiveView('list');
            fetchData();
        } catch (err) {
            console.error(err);
            window.Swal.fire({ icon: 'error', title: 'خطأ', text: 'فشل الحفظ', customClass: {popup: 'rounded-3xl'} });
        }
    };

    // حفظ مصروف (أوتوماتيك قيد مزدوج)
    const handleSaveExpense = async (expenseData) => {
        const isoDate = expenseData.date ? new Date(expenseData.date).toISOString() : new Date().toISOString();
        const refNo = 'EXP-' + Date.now().toString().slice(-4);
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({ journal: '++id, date, ref_no, description, total', journal_items: '++id, journal_id, account_id, debit, credit' });
            await db.transaction('rw', [db.journal, db.journal_items], async () => {
                // 1. إنشاء رأس القيد
                const jId = await db.journal.add({
                    date: isoDate, ref_no: refNo, description: expenseData.desc || 'مصروفات تشغيلية', total: expenseData.amount, type: 'EXPENSE'
                });
                // 2. المدين (حساب المصروف)
                await db.journal_items.add({ journal_id: jId, account_id: Number(expenseData.expenseAccountId), debit: expenseData.amount, credit: 0 });
                // 3. الدائن (حساب النقدية/البنك)
                await db.journal_items.add({ journal_id: jId, account_id: Number(expenseData.paymentAccountId), debit: 0, credit: expenseData.amount });
            });
            vibrate('success');
            window.Swal.fire({ icon: 'success', title: 'تم تسجيل المصروف', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
            setActiveView('list');
            fetchData();
        } catch (err) {
            console.error(err);
            window.Swal.fire({ icon: 'error', title: 'خطأ', text: 'فشل الحفظ', customClass: {popup: 'rounded-3xl'} });
        }
    };

    return (
        <div ref={containerRef} tabIndex="-1" className="pb-24 outline-none w-full" dir="rtl" style={{ WebkitTapHighlightColor: 'transparent' }}>
            
            {/* التبويبات Tabs */}
            {activeView === 'list' && (
                <div className="flex bg-slate-200/50 p-1.5 rounded-2xl md:w-fit mb-6 shadow-inner animate-view">
                    <button 
                        onClick={() => { setActiveTab('journal'); setCurrentPage(1); }} 
                        className={`flex-1 md:w-48 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'journal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-book mr-2"></i> القيود المحاسبية
                    </button>
                    <button 
                        onClick={() => { setActiveTab('expenses'); setCurrentPage(1); }} 
                        className={`flex-1 md:w-48 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'expenses' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-wallet mr-2"></i> المصروفات التشغيلية
                    </button>
                </div>
            )}

            {activeView === 'list' ? (
                <div className="animate-view">
                    {activeTab === 'journal' && <JournalStats stats={stats} />}
                    
                    <JournalFilter 
                        filters={filters} 
                        onFilterApply={handleApplyFilter} 
                        onFilterReset={handleResetFilter}
                        onAddClick={() => setActiveView('form')} 
                    />
                    
                    {activeTab === 'journal' ? (
                        <JournalList 
                            entries={paginatedEntries} 
                            allJournalItems={allJournalItems}
                            accounts={accounts}
                            currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} onDelete={handleDeleteEntry}
                        />
                    ) : (
                        <ExpenseList 
                            entries={paginatedEntries} 
                            allJournalItems={allJournalItems}
                            accounts={accounts}
                            currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} onDelete={handleDeleteEntry}
                        />
                    )}
                </div>
            ) : (
                <div className="animate-slideInRight">
                    {activeTab === 'journal' ? (
                        <JournalModal onClose={() => setActiveView('list')} onSave={handleSaveJournal} accounts={accounts} />
                    ) : (
                        <ExpenseModal onClose={() => setActiveView('list')} onSave={handleSaveExpense} accounts={accounts} />
                    )}
                </div>
            )}
        </div>
    );
};