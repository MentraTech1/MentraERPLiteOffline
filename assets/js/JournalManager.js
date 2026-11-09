// المسار: assets/js/JournalManager.js

/**
 * JournalManager
 * مدير القيود اليومية (تم حل مشكلة Transaction committed too early باستخدام Singleton DB Instance)
 */
window.JournalManager = (function () {

    // المتغير الذي سيحمل نسخة قاعدة البيانات لمرة واحدة فقط (Singleton)
    let dbInstance = null;

    const initDB = () => {
        if (dbInstance) return dbInstance; // إذا كانت موجودة مسبقاً، استخدمها فوراً
        
        const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
        dbInstance = new window.Dexie(dbName);
        dbInstance.version(4).stores({
            journal: '++id, date, ref_no, description, total, type',
            journal_items: '++id, journal_id, account_id, debit, credit',
            accounts: '++id, code, name_ar, type, balance'
        });
        
        return dbInstance;
    };

    return {
        // =========================================================
        // 1. العمليات الأساسية
        // =========================================================

        getOrCreateAccount: async function (nameAr, type, defaultCode) {
            const db = initDB();
            const existing = await db.accounts.filter(a => a.code === defaultCode || a.name_ar === nameAr).first();
            if (existing) return existing.id;
            return await db.accounts.add({ code: defaultCode, name_ar: nameAr, type: type, balance: 0 });
        },

        createEntry: async function (header, items) {
            const db = initDB();
            const totalDebit = items.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
            const totalCredit = items.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
            
            if (Math.abs(totalDebit - totalCredit) > 0.01) throw new Error("القيد غير متزن!");

            return await db.transaction('rw', [db.journal, db.journal_items, db.accounts], async () => {
                const journalId = await db.journal.add({
                    date: header.date || new Date().toISOString(),
                    ref_no: header.ref_no, description: header.description, type: header.type, total: totalDebit
                });

                for (let item of items) {
                    const debit = Number(item.debit) || 0;
                    const credit = Number(item.credit) || 0;
                    if (debit > 0 || credit > 0) {
                        await db.journal_items.add({ journal_id: journalId, account_id: item.account_id, debit, credit });
                        
                        const account = await db.accounts.get(item.account_id);
                        if (account) {
                            let change = ['asset', 'expense'].includes(account.type) ? (debit - credit) : (credit - debit);
                            await db.accounts.update(account.id, { balance: (Number(account.balance) || 0) + change });
                        }
                    }
                }
                return journalId;
            });
        },

        deleteEntryByRef: async function (refNo) {
            const db = initDB();
            return await db.transaction('rw', [db.journal, db.journal_items, db.accounts], async () => {
                const journalEntry = await db.journal.where('ref_no').equals(refNo).first();
                if (!journalEntry) return false; 

                const items = await db.journal_items.where('journal_id').equals(journalEntry.id).toArray();

                for (let item of items) {
                    const account = await db.accounts.get(item.account_id);
                    if (account) {
                        const debit = Number(item.debit) || 0;
                        const credit = Number(item.credit) || 0;
                        let originalChange = ['asset', 'expense'].includes(account.type) ? (debit - credit) : (credit - debit);
                        
                        await db.accounts.update(account.id, { 
                            balance: (Number(account.balance) || 0) - originalChange 
                        });
                    }
                }

                await db.journal_items.where('journal_id').equals(journalEntry.id).delete();
                await db.journal.delete(journalEntry.id);
                return true;
            });
        },

        // =========================================================
        // 2. دوال الإدخال
        // =========================================================

        recordSaleInvoice: async function(invoiceNo, totalAmount, totalCost, method, status, customerName, dateISO) {
            const cashId = await this.getOrCreateAccount('الصندوق', 'asset', '1001');
            const bankId = await this.getOrCreateAccount('البنك', 'asset', '1002');
            const arId = await this.getOrCreateAccount('عملاء مدينون', 'asset', '1003');
            const salesId = await this.getOrCreateAccount('إيرادات المبيعات', 'income', '4001');
            const cogsId = await this.getOrCreateAccount('تكلفة البضاعة المباعة', 'expense', '5001');
            const invId = await this.getOrCreateAccount('المخزون', 'asset', '6001');

            let debitId = status === 'pending' ? arId : (method === 'CASH' ? cashId : bankId);
            const desc = status === 'pending' ? `مبيعات آجلة (${customerName}) - فاتورة ${invoiceNo}` : `مبيعات - فاتورة ${invoiceNo}`;

            const items = [
                { account_id: debitId, debit: totalAmount, credit: 0 },
                { account_id: salesId, debit: 0, credit: totalAmount } 
            ];

            if (totalCost > 0) {
                items.push({ account_id: cogsId, debit: totalCost, credit: 0 }); 
                items.push({ account_id: invId, debit: 0, credit: totalCost }); 
            }

            return await this.createEntry({ type: 'SALE', description: desc, ref_no: invoiceNo, date: dateISO }, items);
        },

        recordPurchaseInvoice: async function(invoiceNo, totalAmount, method, status, vendorName, dateISO) {
            const cashId = await this.getOrCreateAccount('الصندوق', 'asset', '1001');
            const bankId = await this.getOrCreateAccount('البنك', 'asset', '1002');
            const apId = await this.getOrCreateAccount('موردين دائنون', 'liability', '2001');
            const invId = await this.getOrCreateAccount('المخزون', 'asset', '6001');

            let creditId = status === 'pending' ? apId : (method === 'CASH' ? cashId : bankId);
            const desc = vendorName ? `مشتريات من: ${vendorName} - ${invoiceNo}` : `مشتريات - فاتورة ${invoiceNo}`;

            return await this.createEntry(
                { type: 'PURCHASE', description: desc, ref_no: invoiceNo, date: dateISO },
                [
                    { account_id: invId, debit: totalAmount, credit: 0 }, 
                    { account_id: creditId, debit: 0, credit: totalAmount } 
                ]
            );
        },

        recordExpense: async function (amount, expenseAccountId, paymentAccountId, description, date, refNo) {
            const safeExpenseId = expenseAccountId || await this.getOrCreateAccount('مصروفات عامة', 'expense', '5002');
            const safePaymentId = paymentAccountId || await this.getOrCreateAccount('الصندوق', 'asset', '1001');

            return await this.createEntry(
                { type: 'EXPENSE', description: description, date: date, ref_no: refNo || `EXP-${Date.now().toString().slice(-4)}` },
                [
                    { account_id: safeExpenseId, debit: amount, credit: 0 },
                    { account_id: safePaymentId, debit: 0, credit: amount } 
                ]
            );
        },


        // =========================================================
        // 3. دوال التعديل (Update)
        // =========================================================

        updateSaleInvoice: async function(oldInvoiceNo, newTotalAmount, newTotalCost, newMethod, newStatus, newCustomerName, newDateISO) {
            const db = initDB();
            // بسبب أن db أصبحت Singleton، الـ nested transactions الآن آمنة 100%
            return await db.transaction('rw', [db.journal, db.journal_items, db.accounts], async () => {
                await this.deleteEntryByRef(oldInvoiceNo);
                return await this.recordSaleInvoice(oldInvoiceNo, newTotalAmount, newTotalCost, newMethod, newStatus, newCustomerName, newDateISO);
            });
        },

        updateExpense: async function(oldRefNo, newAmount, newExpenseAccountId, newPaymentAccountId, newDescription, newDate) {
            const db = initDB();
            return await db.transaction('rw', [db.journal, db.journal_items, db.accounts], async () => {
                await this.deleteEntryByRef(oldRefNo);
                return await this.recordExpense(newAmount, newExpenseAccountId, newPaymentAccountId, newDescription, newDate, oldRefNo);
            });
        }
    };
})();