// المسار: components/Journal/ExpenseModal.js
window.ExpenseModal = function({ onClose, onSave, accounts }) {
    const { useState, useEffect } = React;

    const [expenseData, setExpenseData] = useState({
        date: '',
        amount: '',
        paymentAccountId: '',
        desc: ''
    });

    // حالة خاصة بحقل البحث الحي (Live Search) لبند المصروف
    const [expenseSearch, setExpenseSearch] = useState({
        text: '',
        id: '',
        isOpen: false
    });

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setExpenseData(prev => ({ ...prev, date: today }));
    }, []);

    // فلترة الحسابات للعرض
    const expenseAccounts = accounts.filter(a => a.type === 'expense' || a.name_ar.includes('مصروف') || a.name_ar.includes('إيجار') || a.name_ar.includes('أجور'));
    const paymentAccounts = accounts.filter(a => a.type === 'asset' || a.name_ar.includes('نقدية') || a.name_ar.includes('بنك') || a.name_ar.includes('خزينة') || a.name_ar.includes('صندوق'));

    const expList = expenseAccounts.length > 0 ? expenseAccounts : accounts;
    const payList = paymentAccounts.length > 0 ? paymentAccounts : accounts;

    // تصفية بنود المصروفات بناءً على ما يكتبه المستخدم في مربع البحث
    const filteredExpenses = expList.filter(a => a.name_ar.toLowerCase().includes(expenseSearch.text.toLowerCase()));

    // دالة لإنشاء حساب "مصروفات عامة" افتراضي إذا لم يكن موجوداً
    const getOrCreateDefaultExpenseAccount = async () => {
        // 1. البحث في الحسابات الحالية عن حساب مصروفات عامة
        let defaultAcc = accounts.find(a => a.name_ar === 'مصروفات عامة' && a.type === 'expense');
        
        if (defaultAcc) return defaultAcc.id;

        // 2. إذا لم يكن موجوداً، نقوم بإنشائه في قاعدة البيانات فوراً
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({ accounts: '++id, code, name_ar, type, balance' });
            
            const newId = await db.accounts.add({
                code: '5000', // كود افتراضي للمصروفات
                name_ar: 'مصروفات عامة',
                type: 'expense',
                balance: 0
            });
            
            return newId;
        } catch (error) {
            console.error("فشل إنشاء حساب المصروفات الافتراضي:", error);
            // كحل أخير جداً، نستخدم أي حساب متاح لتجنب تعطل النظام
            return accounts[0]?.id; 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!expenseData.amount || Number(expenseData.amount) <= 0) {
            window.Swal.fire({ icon: 'warning', text: 'يرجى إدخال مبلغ المصروف بشكل صحيح', customClass: {popup: 'rounded-3xl'} });
            return;
        }
        
        if (!expenseSearch.text.trim()) {
            window.Swal.fire({ icon: 'warning', text: 'يرجى تحديد أو كتابة بند المصروف', customClass: {popup: 'rounded-3xl'} });
            return;
        }

        if (!expenseData.paymentAccountId) {
            window.Swal.fire({ icon: 'warning', text: 'يرجى اختيار طريقة الدفع (الخزينة/البنك)', customClass: {popup: 'rounded-3xl'} });
            return;
        }

        // ==========================================
        // اللمسة الذكية للتعامل مع البنود المكتوبة يدوياً:
        // ==========================================
        let finalAccountId = expenseSearch.id;
        let finalDesc = expenseData.desc;

        // إذا كتب المستخدم بنداً غير موجود في القائمة (لم يتم اختيار ID)
        if (!finalAccountId && expenseSearch.text.trim() !== '') {
            
            // استخدام الدالة لضمان وجود حساب "مصروفات عامة"
            finalAccountId = await getOrCreateDefaultExpenseAccount();
            
            // ندمج البند الجديد الذي كتبه المستخدم مع وصف الفاتورة لكي يظهر بوضوح في التقارير
            finalDesc = `[${expenseSearch.text.trim()}] ${expenseData.desc}`;
        }

        // إرسال البيانات للحفظ
        onSave({
            date: expenseData.date,
            amount: expenseData.amount,
            expenseAccountId: finalAccountId,
            paymentAccountId: expenseData.paymentAccountId,
            desc: finalDesc
        });
    };

    return (
        <div className="flex flex-col gap-6 pb-6 max-w-4xl mx-auto">
            
            <div className="flex items-center gap-4 bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
                <button type="button" onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-600 hover:bg-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-all border border-slate-200 active:scale-90 shadow-sm shrink-0">
                    <i className="fas fa-arrow-right"></i>
                </button>
                <div>
                    <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">تسجيل مصروف جديد</h2>
                    <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1">سيتم إنشاء قيد محاسبي أوتوماتيكي بناءً على إدخالك</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div>
                        <label className="text-xs font-black text-slate-500 mb-2 block">المبلغ (ج.م)</label>
                        <div className="relative">
                            <i className="fas fa-money-bill-wave absolute right-4 top-1/2 -translate-y-1/2 text-rose-400"></i>
                            <input 
                                type="number" 
                                inputMode="decimal"
                                value={expenseData.amount} 
                                onChange={e => setExpenseData({...expenseData, amount: e.target.value})} 
                                className="w-full bg-slate-50 border border-slate-200 py-3.5 pr-12 pl-4 rounded-xl font-black text-rose-600 text-lg outline-none focus:border-rose-500 focus:bg-white transition-colors" 
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-500 mb-2 block">تاريخ الدفع</label>
                        <input 
                            type="date" 
                            value={expenseData.date} 
                            onChange={e => setExpenseData({...expenseData, date: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-slate-700 outline-none focus:border-rose-500 focus:bg-white transition-colors h-[54px]" 
                            required
                        />
                    </div>

                    {/* حقل البحث الحي (Live Search) لبند المصروف */}
                    <div className="relative">
                        <label className="text-xs font-black text-slate-500 mb-2 block">بند المصروف (بحث أو إدخال يدوي)</label>
                        <div className="relative">
                            <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                            <input 
                                type="text"
                                value={expenseSearch.text}
                                onChange={(e) => setExpenseSearch({ text: e.target.value, id: '', isOpen: true })}
                                onFocus={() => setExpenseSearch(prev => ({ ...prev, isOpen: true }))}
                                onBlur={() => setTimeout(() => setExpenseSearch(prev => ({ ...prev, isOpen: false })), 200)}
                                placeholder="ابحث عن البند أو اكتب بند جديد..."
                                className={`w-full bg-slate-50 border ${expenseSearch.id ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'} py-3.5 pr-11 pl-4 rounded-xl font-bold text-slate-700 text-sm outline-none focus:border-rose-500 focus:bg-white transition-colors h-[54px]`}
                                required
                            />
                            {expenseSearch.id && <i className="fas fa-check-circle absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"></i>}
                        </div>

                        {/* القائمة المنسدلة لنتائج البحث */}
                        {expenseSearch.isOpen && (
                            <div className="absolute top-full right-0 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto hide-scrollbar">
                                {filteredExpenses.length > 0 ? (
                                    filteredExpenses.map(acc => (
                                        <div 
                                            key={acc.id} 
                                            onMouseDown={() => setExpenseSearch({ text: acc.name_ar, id: acc.id, isOpen: false })}
                                            className="px-4 py-3 border-b border-slate-50 hover:bg-rose-50 cursor-pointer flex justify-between items-center transition-colors"
                                        >
                                            <span className="font-black text-xs text-slate-700">{acc.name_ar}</span>
                                            {acc.code && <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-mono">{acc.code}</span>}
                                        </div>
                                    ))
                                ) : (
                                    expenseSearch.text && (
                                        <div className="px-4 py-3 bg-emerald-50 flex items-center gap-2 cursor-pointer" onMouseDown={() => setExpenseSearch(prev => ({...prev, isOpen: false}))}>
                                            <i className="fas fa-plus-circle text-emerald-600"></i>
                                            <span className="text-xs font-bold text-emerald-700">سيتم تسجيل "{expenseSearch.text}" كبند يدوي</span>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-500 mb-2 block">مدفوع من (الخزينة/البنك)</label>
                        <select 
                            value={expenseData.paymentAccountId} 
                            onChange={e => setExpenseData({...expenseData, paymentAccountId: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-slate-700 outline-none focus:border-rose-500 focus:bg-white transition-colors h-[54px]"
                            required
                        >
                            <option value="">-- اختر طريقة الدفع --</option>
                            {payList.map(a => <option key={a.id} value={a.id}>{a.name_ar}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-xs font-black text-slate-500 mb-2 block">البيان (تفاصيل إضافية للمصروف)</label>
                        <input 
                            type="text" 
                            value={expenseData.desc} 
                            onChange={e => setExpenseData({...expenseData, desc: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-slate-700 outline-none focus:border-rose-500 focus:bg-white transition-colors" 
                            placeholder="مثال: فاتورة رقم 123 لشهر مارس..."
                            required
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button type="submit" className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-xl font-black text-sm md:text-base transition-all shadow-lg shadow-rose-600/30 active:scale-95 flex items-center justify-center gap-2">
                        <i className="fas fa-check"></i> اعتماد وحفظ المصروف
                    </button>
                </div>
            </form>

        </div>
    );
};