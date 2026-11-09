// المسار: components/Journal/JournalList.js
window.JournalList = function({ entries, allJournalItems, accounts, currentPage, totalPages, onPageChange, onDelete }) {
    const formatMoney = (num) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const getAccountName = (id) => {
        const acc = accounts.find(a => a.id === id);
        return acc ? acc.name_ar : 'حساب محذوف';
    };

    if (entries.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 animate-view flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-book-journal-whills text-3xl text-slate-300"></i>
                </div>
                <h3 className="text-slate-800 font-black text-lg mb-1">لا توجد قيود مسجلة</h3>
                <p className="text-slate-500 font-bold text-sm">لم يتم العثور على قيود محاسبية في الفترة المحددة.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 animate-view overflow-hidden" style={{ animationDelay: '0.3s' }}>
            <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-right min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-widest w-24">المرجع</th>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-widest w-32">التاريخ</th>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-widest">البيان (الوصف)</th>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-widest">أطراف القيد (التأثير المالي)</th>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-widest text-center w-32">الإجمالي</th>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-widest text-center w-16">إجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {entries.map(e => {
                            const cleanDate = String(e.date).substring(0, 16).replace('T', ' ');
                            
                            // جلب أطراف القيد لهذا المستند
                            const items = allJournalItems.filter(i => i.journal_id === e.id);
                            const debits = items.filter(i => Number(i.debit) > 0);
                            const credits = items.filter(i => Number(i.credit) > 0);

                            return (
                                <tr key={e.id} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4 align-top">
                                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 font-black text-[10px] font-mono tracking-widest">{e.ref_no}</span>
                                    </td>
                                    <td className="p-4 align-top font-bold text-xs text-slate-600" dir="ltr">{cleanDate}</td>
                                    <td className="p-4 align-top font-black text-sm text-slate-800">{e.description || 'بدون وصف'}</td>
                                    
                                    {/* عمود الأطراف (المدين والدائن) */}
                                    <td className="p-4 align-top">
                                        <div className="flex flex-col gap-2">
                                            {/* المدين (الأخضر/زيادة) */}
                                            {debits.map(d => (
                                                <div key={d.id} className="flex items-center gap-2 text-xs">
                                                    <span className="w-10 bg-emerald-100 text-emerald-700 text-center rounded py-0.5 font-black text-[9px]">مدين</span>
                                                    <span className="font-bold text-slate-700 flex-1">{getAccountName(d.account_id)}</span>
                                                    <span className="font-mono font-black text-emerald-600" dir="ltr">+{formatMoney(d.debit)}</span>
                                                </div>
                                            ))}
                                            {/* الدائن (الأحمر/نقص) */}
                                            {credits.map(c => (
                                                <div key={c.id} className="flex items-center gap-2 text-xs">
                                                    <span className="w-10 bg-rose-100 text-rose-700 text-center rounded py-0.5 font-black text-[9px]">دائن</span>
                                                    <span className="font-bold text-slate-700 flex-1">{getAccountName(c.account_id)}</span>
                                                    <span className="font-mono font-black text-rose-600" dir="ltr">-{formatMoney(c.credit)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="p-4 align-top text-center font-black text-slate-800 text-sm md:text-base font-mono">
                                        {formatMoney(Number(e.total))}
                                    </td>
                                    <td className="p-4 align-top text-center">
                                        <button onClick={() => onDelete(e.id)} className="w-8 h-8 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-90 shadow-sm flex items-center justify-center mx-auto" title="حذف القيد">
                                            <i className="fas fa-trash text-[10px]"></i>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500">صفحة <span className="text-blue-600">{currentPage}</span> من {totalPages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-all active:scale-90 shadow-sm"><i className="fas fa-chevron-right text-xs"></i></button>
                        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-all active:scale-90 shadow-sm"><i className="fas fa-chevron-left text-xs"></i></button>
                    </div>
                </div>
            )}
        </div>
    );
};