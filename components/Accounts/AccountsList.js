// المسار: components/Accounts/AccountsList.js
window.AccountsList = function({ accounts, currentPage, totalPages, onPageChange, onEdit, onDelete }) {
    const formatMoney = (num) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const getTypeStyle = (type) => {
        const styles = {
            asset: { text: 'أصول', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
            liability: { text: 'خصوم', cls: 'bg-rose-50 text-rose-600 border-rose-100' },
            equity: { text: 'حقوق ملكية', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            income: { text: 'إيرادات', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
            expense: { text: 'مصروفات', cls: 'bg-slate-100 text-slate-600 border-slate-200' }
        };
        return styles[type] || { text: type, cls: 'bg-slate-50 text-slate-400 border-slate-200' };
    };

    if (accounts.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 animate-view flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-users-cog text-3xl text-slate-300"></i>
                </div>
                <h3 className="text-slate-800 font-black text-lg mb-1">لا توجد حسابات</h3>
                <p className="text-slate-500 font-bold text-sm">لم يتم العثور على حسابات تطابق بحثك في الدليل.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 animate-view overflow-hidden" style={{ animationDelay: '0.3s' }}>
            <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-right min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 font-black text-xs text-slate-500 uppercase tracking-widest w-24">الكود</th>
                            <th className="p-4 font-black text-xs text-slate-500">اسم الحساب</th>
                            <th className="p-4 font-black text-xs text-slate-500">التصنيف</th>
                            <th className="p-4 font-black text-xs text-slate-500 text-left">الرصيد الحالي</th>
                            <th className="p-4 font-black text-xs text-slate-500 text-center w-28">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {accounts.map(acc => {
                            const typeInfo = getTypeStyle(acc.type);
                            const isNegative = acc.currentBalance < 0;
                            const balanceColor = isNegative ? 'text-rose-600' : (acc.currentBalance > 0 ? 'text-emerald-600' : 'text-slate-800');
                            
                            return (
                                <tr key={acc.id} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4">
                                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 font-black text-[10px] font-mono tracking-widest">{acc.code}</span>
                                    </td>
                                    <td className="p-4 font-black text-sm text-slate-800">{acc.name_ar}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border ${typeInfo.cls}`}>
                                            {typeInfo.text}
                                        </span>
                                    </td>
                                    <td className={`p-4 text-left font-black text-sm md:text-base font-mono ${balanceColor}`} dir="ltr">
                                        {isNegative ? `(${formatMoney(Math.abs(acc.currentBalance))})` : formatMoney(acc.currentBalance)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1.5 justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onEdit(acc)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all active:scale-90 shadow-sm flex items-center justify-center" title="تعديل"><i className="fas fa-pen text-[10px]"></i></button>
                                            <button onClick={() => onDelete(acc.id)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-90 shadow-sm flex items-center justify-center" title="حذف"><i className="fas fa-trash text-[10px]"></i></button>
                                        </div>
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