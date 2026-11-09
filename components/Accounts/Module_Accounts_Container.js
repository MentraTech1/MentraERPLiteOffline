// المسار: components/Accounts/Module_Accounts_Container.js
window.Module_Accounts_Container = function() {
    const { useState, useEffect, useMemo, useRef } = React;
    const { AccountsStats, AccountsFilter, AccountsList, AccountsModal } = window;

    const containerRef = useRef(null);

    // States
    const [allAccounts, setAllAccounts] = useState([]);
    const [profits, setProfits] = useState({
        totalRevenue: 0, totalCOGS: 0, totalExpenses: 0, grossProfit: 0, netIncome: 0, profitMargin: 0, totalIncome: 0
    });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    
    // View States بدلاً من Modal لمنع تجميد الكيبورد
    const [activeView, setActiveView] = useState('list'); // 'list' or 'form'
    const [editingAccount, setEditingAccount] = useState(null);

    // حل مشكلة تجميد الكيبورد
    useEffect(() => {
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur(); 
        }
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, [activeView]);

    const vibrate = (type = 'click') => {
        if (navigator.vibrate) {
            if (type === 'success') navigator.vibrate([100, 50, 100]);
            else if (type === 'error' || type === 'delete') navigator.vibrate([50, 50]);
            else navigator.vibrate(20);
        }
    };

    const fetchData = async () => {
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({
                accounts: '++id, code, name_ar, type, balance',
                journal_items: '++id, journal_id, account_id, debit, credit'
            });

            const [accountsData, journalItems] = await Promise.all([
                db.accounts.toArray(),
                db.journal_items.toArray()
            ]);

            const movementsMap = {};
            let tRev = 0, tCogs = 0, tExp = 0, tInc = 0;

            for (const item of journalItems) {
                movementsMap[item.account_id] = (movementsMap[item.account_id] || 0) + (Number(item.debit) || 0) - (Number(item.credit) || 0);
                
                const acc = accountsData.find(a => a.id === item.account_id);
                if (!acc) continue;

                let balance = (Number(item.credit) || 0) - (Number(item.debit) || 0);
                
                if (acc.type === 'income') {
                    if (acc.code === '4001') tRev += Math.abs(balance);
                    tInc += Math.abs(balance);
                } else if (acc.type === 'expense') {
                    if (acc.code === '5001') tCogs += Math.abs(balance);
                    else tExp += Math.abs(balance);
                }
            }

            const mappedAccounts = accountsData.map(acc => ({
                ...acc,
                currentBalance: (Number(acc.balance) || 0) + (movementsMap[acc.id] || 0)
            }));

            setAllAccounts(mappedAccounts);

            const grossProfit = tRev - tCogs;
            const netIncome = grossProfit - tExp;
            const profitMargin = tRev > 0 ? (grossProfit / tRev) * 100 : 0;

            setProfits({
                totalRevenue: tRev, totalCOGS: tCogs, totalExpenses: tExp,
                grossProfit, netIncome, profitMargin, totalIncome: tInc
            });

        } catch (e) { console.error("Database Fetch Error:", e); }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredAccounts = useMemo(() => {
        if (!searchTerm) return allAccounts;
        const q = searchTerm.toLowerCase();
        return allAccounts.filter(a => 
            a.name_ar.toLowerCase().includes(q) || 
            a.code.toLowerCase().includes(q) || 
            a.type.toLowerCase().includes(q)
        );
    }, [allAccounts, searchTerm]);

    const stats = useMemo(() => {
        const result = filteredAccounts.reduce((acc, curr) => {
            if (curr.type === 'asset') acc.assets += curr.currentBalance;
            if (curr.type === 'liability') acc.liabilities += Math.abs(curr.currentBalance);
            return acc;
        }, { assets: 0, liabilities: 0 });
        
        result.equity = (result.assets - result.liabilities) + (profits.netIncome || 0);
        result.count = allAccounts.length;
        
        return result;
    }, [filteredAccounts, profits, allAccounts.length]);

    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const handleSaveAccount = async (formData) => {
        if (!formData.code || !formData.name_ar) {
            window.Swal.fire({icon: 'error', title: 'بيانات ناقصة', text: 'أدخل كود واسم الحساب', toast: true, position: 'top', timer: 2000, showConfirmButton: false});
            vibrate('error');
            return;
        }

        const exists = allAccounts.find(a => a.code === formData.code && a.id !== (editingAccount ? editingAccount.id : null));
        if (exists) {
            window.Swal.fire({icon: 'warning', title: 'الكود مكرر!', text: 'هذا الكود مستخدم لحساب آخر.', toast: true, position: 'top', timer: 2500, showConfirmButton: false});
            vibrate('error');
            return;
        }

        const dataToSave = {
            code: formData.code,
            name_ar: formData.name_ar,
            type: formData.type,
            balance: parseFloat(formData.balance) || 0
        };

        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({ accounts: '++id, code, name_ar, type, balance' });

            if (editingAccount) {
                await db.accounts.update(editingAccount.id, dataToSave);
                window.Swal.fire({icon: 'success', title: 'تم التعديل', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false});
            } else {
                await db.accounts.add(dataToSave);
                window.Swal.fire({icon: 'success', title: 'تمت الإضافة', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false});
            }
            
            vibrate('success');
            setActiveView('list');
            fetchData();
        } catch (e) { console.error(e); }
    };

    const handleDeleteAccount = async (id) => {
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({ accounts: '++id, code, name_ar, type, balance', journal_items: '++id, journal_id, account_id, debit, credit' });

            const hasJournals = await db.journal_items.where('account_id').equals(id).count();
            if (hasJournals > 0) {
                window.Swal.fire({
                    icon: 'error', title: 'مرفوض!', text: 'لا يمكن حذف حساب مرتبط بقيود مالية، احذف الحركات أولاً.',
                    customClass: { popup: 'rounded-3xl' }
                });
                vibrate('error');
                return;
            }

            const res = await window.Swal.fire({
                title: 'حذف الحساب؟', text: "لن تتمكن من التراجع!", icon: 'warning',
                showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
                confirmButtonText: 'نعم، احذف', cancelButtonText: 'إلغاء',
                customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' }
            });

            if (res.isConfirmed) {
                await db.accounts.delete(id);
                vibrate('delete');
                fetchData();
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div ref={containerRef} tabIndex="-1" className="pb-24 outline-none w-full" dir="rtl" style={{ WebkitTapHighlightColor: 'transparent' }}>
            {activeView === 'list' ? (
                <div className="animate-view">
                    <AccountsStats stats={stats} profits={profits} />
                    
                    <AccountsFilter 
                        searchTerm={searchTerm} 
                        onSearchChange={setSearchTerm} 
                        onAddClick={() => { setEditingAccount(null); setActiveView('form'); }} 
                    />
                    
                    <AccountsList 
                        accounts={paginatedAccounts} 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                        onEdit={(acc) => { setEditingAccount(acc); setActiveView('form'); }}
                        onDelete={handleDeleteAccount}
                    />
                </div>
            ) : (
                <div className="animate-slideInRight">
                    <AccountsModal 
                        onClose={() => setActiveView('list')} 
                        onSave={handleSaveAccount} 
                        editingAccount={editingAccount} 
                    />
                </div>
            )}
        </div>
    );
};