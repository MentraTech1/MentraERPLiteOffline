// إنشاء ملف جديد: components/Journal/ExpenseList.js
window.ExpenseList = function({ entries, allJournalItems, accounts, currentPage, totalPages, onPageChange, onDelete }) {
    const formatMoney = (num) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const getAccountName = (id) => {
        const acc = accounts.find(a => a.id === id);
        return acc ? acc.name_ar : 'غير محدد';
    };

    if (entries.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 animate-view flex flex-col items-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-wallet text-3xl text-rose-300"></i>
                </div>
                <h3 className="text-slate-800 font-black text-lg mb-1">لا توجد مصروفات مسجلة</h3>
                <p className="text-slate-500 font-bold text-sm">لم يتم العثور على مصروفات في الفترة المحددة.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 animate-view overflow-hidden" style={{ animationDelay: '0.3s' }}>
            <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-right min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase w-32">التاريخ</th>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase">البيان (الوصف)</th>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase">بند المصروف</th>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase">مدفوع من</th>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase text-center w-32">المبلغ</th>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase text-center w-16">إجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {entries.map(e => {
                            const cleanDate = String(e.date).substring(0, 16).replace('T', ' ');
                            
                            // استخراج حساب المصروف (المدين) وحساب الدفع (الدائن)
                            const items = allJournalItems.filter(i => i.journal_id === e.id);
                            const debitItem = items.find(i => Number(i.debit) > 0); // المصروف
                            const creditItem = items.find(i => Number(i.credit) > 0); // طريقة الدفع

                            return (
                                <tr key={e.id} className="group hover:bg-rose-50/30 transition-colors">
                                    <td className="p-4 align-middle font-bold text-xs text-slate-600" dir="ltr">{cleanDate}</td>
                                    <td className="p-4 align-middle font-black text-sm text-slate-800">{e.description}</td>
                                    
                                    <td className="p-4 align-middle">
                                        <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-lg text-xs font-bold">
                                            {debitItem ? getAccountName(debitItem.account_id) : '-'}
                                        </span>
                                    </td>
                                    
                                    <td className="p-4 align-middle">
                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">
                                            <i className="fas fa-money-bill-wave mr-1"></i> {creditItem ? getAccountName(creditItem.account_id) : '-'}
                                        </span>
                                    </td>

                                    <td className="p-4 align-middle text-center font-black text-rose-600 text-sm md:text-base font-mono">
                                        {formatMoney(Number(e.total))}
                                    </td>
                                    <td className="p-4 align-middle text-center">
                                        <button onClick={() => onDelete(e.id)} className="w-8 h-8 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-90 shadow-sm flex items-center justify-center mx-auto">
                                            <i className="fas fa-trash text-[10px]"></i>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500">صفحة <span className="text-rose-600">{currentPage}</span> من {totalPages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm"><i className="fas fa-chevron-right text-xs"></i></button>
                        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm"><i className="fas fa-chevron-left text-xs"></i></button>
                    </div>
                </div>
            )}
        </div>
    );
};