// المسار: components/Journal/JournalModal.js
window.JournalModal = function({ onClose, onSave, accounts }) {
    const { useState, useEffect, useRef } = React;

    const [header, setHeader] = useState({ date: '', ref: '', desc: '' });
    // أضفنا خصائص جديدة للبحث: searchText, isDropdownOpen
    const [rows, setRows] = useState([]);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setHeader({ date: today, ref: '', desc: '' });
        setRows([
            { id: Date.now(), accountId: '', debit: '', credit: '', searchText: '', isDropdownOpen: false },
            { id: Date.now() + 1, accountId: '', debit: '', credit: '', searchText: '', isDropdownOpen: false }
        ]);
    }, []);

    const totalDebit = rows.reduce((sum, r) => sum + (parseFloat(r.debit) || 0), 0);
    const totalCredit = rows.reduce((sum, r) => sum + (parseFloat(r.credit) || 0), 0);
    const isBalanced = (totalDebit === totalCredit && totalDebit > 0);
    const diff = Math.abs(totalDebit - totalCredit);

    const handleAddRow = () => {
        setRows([...rows, { id: Date.now(), accountId: '', debit: '', credit: '', searchText: '', isDropdownOpen: false }]);
    };

    const handleRowChange = (id, field, value) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleRemoveRow = (id) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const handleSubmit = () => {
        if (!isBalanced) {
            window.Swal.fire({ icon: 'error', title: 'خطأ', text: 'القيد غير متزن!', customClass: {popup: 'rounded-3xl'} });
            return;
        }
        
        const validRows = rows.filter(r => (parseFloat(r.debit) > 0 || parseFloat(r.credit) > 0));
        const missingAccount = validRows.find(r => !r.accountId);
        
        if (missingAccount) {
            window.Swal.fire({ icon: 'error', title: 'بيانات ناقصة', text: 'يرجى اختيار حساب لكل طرف مالي تم إدخال قيمة له!', customClass: {popup: 'rounded-3xl'} });
            return;
        }

        onSave(header, validRows, totalDebit);
    };

    // ==========================================
    // مكون البحث الحي (Live Search Component)
    // ==========================================
    const LiveSearchAccount = ({ row }) => {
        // فلترة الحسابات بناءً على ما يكتبه المستخدم
        const filteredAccounts = accounts.filter(a => 
            a.name_ar.toLowerCase().includes(row.searchText.toLowerCase()) || 
            a.code.toLowerCase().includes(row.searchText.toLowerCase())
        );

        const handleSelect = (account) => {
            // عند الاختيار: نحدث الآي دي، ونضع اسم الحساب في مربع النص، ونغلق القائمة
            setRows(rows.map(r => r.id === row.id ? { 
                ...r, 
                accountId: account.id, 
                searchText: `${account.code} - ${account.name_ar}`, 
                isDropdownOpen: false 
            } : r));
        };

        const handleFocus = () => {
            setRows(rows.map(r => r.id === row.id ? { ...r, isDropdownOpen: true } : r));
        };

        // تأخير الإغلاق حتى لا يمنع النقر على القائمة
        const handleBlur = () => {
            setTimeout(() => {
                setRows(rows => rows.map(r => r.id === row.id ? { ...r, isDropdownOpen: false } : r));
            }, 200);
        };

        return (
            <div className="relative flex-1">
                <label className="md:hidden text-[10px] font-black text-slate-500 mb-1 block">ابحث عن الحساب</label>
                <div className="relative">
                    <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input 
                        type="text" 
                        value={row.searchText}
                        onChange={(e) => {
                            // عند الكتابة: نمسح الآي دي (لأنه يكتب من جديد) ونحدث النص
                            handleRowChange(row.id, 'searchText', e.target.value);
                            handleRowChange(row.id, 'accountId', '');
                            handleRowChange(row.id, 'isDropdownOpen', true);
                        }}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="اكتب اسم أو كود الحساب..."
                        className={`w-full bg-white border ${row.accountId ? 'border-emerald-200 bg-emerald-50/30 text-emerald-700' : 'border-slate-200'} rounded-xl py-3.5 pr-8 pl-3 text-xs md:text-sm font-bold outline-none focus:border-blue-500 shadow-sm transition-colors`}
                    />
                    {row.accountId && <i className="fas fa-check-circle absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs"></i>}
                </div>

                {row.isDropdownOpen && (
                    <div className="absolute top-full right-0 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto hide-scrollbar">
                        {filteredAccounts.length > 0 ? (
                            filteredAccounts.map(acc => (
                                <div 
                                    key={acc.id} 
                                    onMouseDown={() => handleSelect(acc)} // نستخدم onMouseDown لتسبق الـ onBlur
                                    className="px-4 py-3 border-b border-slate-50 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                                >
                                    <span className="font-black text-xs text-slate-700">{acc.name_ar}</span>
                                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-mono">{acc.code}</span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-center text-xs font-bold text-slate-400">لا يوجد حساب بهذا الاسم</div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-5 md:gap-6 pb-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 md:gap-4">
                    <button type="button" onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all border border-slate-200 active:scale-90 shadow-sm">
                        <i className="fas fa-arrow-right"></i>
                    </button>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            تسجيل قيد محاسبي مزدوج
                        </h2>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1">
                            تأكد من توازن الجانب المدين والدائن قبل الحفظ
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-black text-slate-500 mb-2 block">تاريخ القيد</label>
                        <input type="date" value={header.date} onChange={e => setHeader({...header, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 mb-2 block">رقم المرجع / المستند (اختياري)</label>
                        <input type="text" value={header.ref} onChange={e => setHeader({...header, ref: e.target.value})} placeholder="مثال: فاتورة-102" className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 mb-2 block">وصف العملية (البيان)</label>
                        <input type="text" value={header.desc} onChange={e => setHeader({...header, desc: e.target.value})} placeholder="شرح القيد المحاسبي..." className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 min-h-[300px]">
                <h3 className="font-black text-slate-800 mb-4 text-sm flex items-center gap-2">
                    <i className="fas fa-list text-blue-500"></i> أطراف القيد (حسابات)
                </h3>
                
                <div className="space-y-3">
                    <div className="hidden md:flex gap-3 px-2 mb-2">
                        <div className="flex-1 text-xs font-black text-slate-400 uppercase">الحساب (شجرة الحسابات)</div>
                        <div className="w-32 text-xs font-black text-emerald-500 uppercase text-center">مدين (من حساب)</div>
                        <div className="w-32 text-xs font-black text-rose-500 uppercase text-center">دائن (إلى حساب)</div>
                        <div className="w-10"></div>
                    </div>

                    {rows.map((row, index) => (
                        <div key={row.id} className="flex flex-col md:flex-row gap-3 bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-xl border border-slate-200 md:border-none animate-view overflow-visible">
                            
                            {/* استخدام حقل البحث الحي المخصص بدلاً من Select */}
                            <LiveSearchAccount row={row} />
                            
                            <div className="flex gap-3 mt-2 md:mt-0">
                                <div>
                                    <label className="md:hidden text-[10px] font-black text-emerald-500 mb-1 block">مدين</label>
                                    <input type="number" inputMode="decimal" value={row.debit} onChange={e => handleRowChange(row.id, 'debit', e.target.value)} placeholder="0.00" className="w-full md:w-32 bg-emerald-50/50 text-emerald-700 p-3.5 rounded-xl border border-emerald-200 font-black text-sm text-center outline-none focus:border-emerald-500 focus:bg-white shadow-sm transition-all" />
                                </div>
                                <div>
                                    <label className="md:hidden text-[10px] font-black text-rose-500 mb-1 block">دائن</label>
                                    <input type="number" inputMode="decimal" value={row.credit} onChange={e => handleRowChange(row.id, 'credit', e.target.value)} placeholder="0.00" className="w-full md:w-32 bg-rose-50/50 text-rose-700 p-3.5 rounded-xl border border-rose-200 font-black text-sm text-center outline-none focus:border-rose-500 focus:bg-white shadow-sm transition-all" />
                                </div>
                                <div className="flex items-end md:items-center">
                                    <button onClick={() => handleRemoveRow(row.id)} className="w-11 h-11 md:w-10 md:h-10 bg-white border border-slate-200 text-slate-400 hover:text-white hover:bg-rose-500 hover:border-rose-500 rounded-xl transition-all shadow-sm flex items-center justify-center active:scale-90">
                                        <i className="fas fa-trash-alt text-sm"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button onClick={handleAddRow} className="mt-6 bg-slate-100 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl text-xs font-black transition-colors border border-slate-200 hover:border-blue-200 flex items-center gap-2 active:scale-95">
                    <i className="fas fa-plus"></i> إضافة طرف جديد للقيد
                </button>
            </div>

            {/* الفوتر: الميزان والحفظ */}
            <div className="bg-slate-900 p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 mt-4">
                <div className="flex w-full md:w-auto justify-between md:justify-start gap-8 z-10">
                    <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">إجمالي المدين (الأصول/المصروفات)</p>
                        <p className="text-2xl font-black font-mono">{totalDebit.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
                    </div>
                    <div className="w-px bg-slate-700"></div>
                    <div>
                        <p className="text-[10px] font-black text-rose-400 uppercase mb-1">إجمالي الدائن (الخصوم/الإيرادات)</p>
                        <p className="text-2xl font-black font-mono">{totalCredit.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3 z-10">
                    {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
                        <p className="text-rose-400 text-xs font-bold bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
                            الفرق (عدم الاتزان): {diff.toLocaleString(undefined, {minimumFractionDigits:2})} ج.م
                        </p>
                    )}
                    <button 
                        onClick={handleSubmit} 
                        disabled={!isBalanced}
                        className={`w-full md:w-auto px-10 py-4 rounded-xl font-black transition-all text-sm md:text-base flex items-center justify-center gap-2 ${isBalanced ? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-600/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                    >
                        <i className="fas fa-save"></i> اعتماد وترحيل القيد
                    </button>
                </div>
            </div>

        </div>
    );
};