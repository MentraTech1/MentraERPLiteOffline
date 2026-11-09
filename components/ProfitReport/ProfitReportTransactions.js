// المسار: components/ProfitReport/ProfitReportTransactions.js
window.ProfitReportTransactions = function({ transactions, currentPage, totalPages, itemsPerPage, onPageChange }) {
    
    if (transactions.length === 0) {
        return (
            <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-view" style={{ animationDelay: '0.3s' }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                    <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                        <i className="fas fa-exchange-alt text-slate-400"></i> سجل العمليات بالفترة
                    </h2>
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-black border border-indigo-100 whitespace-nowrap self-end sm:self-auto">0 عملية</span>
                </div>
                <div className="text-center py-8 md:py-12 text-slate-400 font-bold">
                    <i className="fas fa-folder-open text-3xl md:text-4xl mb-3 block opacity-30"></i>
                    <span className="text-xs md:text-sm">لا توجد عمليات مسجلة</span>
                </div>
            </div>
        );
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayData = transactions.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-view" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                    <i className="fas fa-exchange-alt text-slate-400"></i> سجل العمليات بالفترة
                </h2>
                <span id="transactions-count-badge" className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-black border border-indigo-100 whitespace-nowrap self-end sm:self-auto">
                    <i className="fas fa-layer-group ml-1"></i> {transactions.length} عملية
                </span>
            </div>
            
            <div className="-mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto custom-scrollbar pb-4">
                <table className="w-full text-right min-w-[650px]">
                    <thead>
                        <tr className="text-slate-400 text-[10px] md:text-[11px] font-black border-b border-slate-50 uppercase tracking-widest whitespace-nowrap">
                            <th className="pb-3 md:pb-4 pr-2 md:pr-4">التاريخ</th>
                            <th className="pb-3 md:pb-4">رقم المرجع</th>
                            <th className="pb-3 md:pb-4">البيان / الوصف</th>
                            <th className="pb-3 md:pb-4 text-center">دفع (خارج)</th>
                            <th className="pb-3 md:pb-4 text-center">قبض (داخل)</th>
                            <th className="pb-3 md:pb-4 text-center">المصدر</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {displayData.map((t, idx) => {
                            let badgeClass = '';
                            if(t.type === 'sale') badgeClass = 'bg-blue-50 text-blue-600 border border-blue-100';
                            else if(t.type === 'purchase') badgeClass = 'bg-indigo-50 text-indigo-600 border border-indigo-100';
                            else if(t.type === 'return') badgeClass = 'bg-amber-50 text-amber-600 border border-amber-200';
                            else badgeClass = 'bg-rose-50 text-rose-600 border border-rose-100';
                            
                            return (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group whitespace-nowrap">
                                    <td className="py-3 md:py-4 pr-2 md:pr-4 font-black text-[9px] md:text-[10px] text-slate-400 font-mono tracking-tighter">{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                                    <td className="py-3 md:py-4 text-[11px] md:text-xs font-black text-slate-700">{t.ref}</td>
                                    <td className="py-3 md:py-4 font-bold text-[10px] md:text-xs text-slate-600 max-w-[150px] md:max-w-none overflow-hidden text-ellipsis">{t.description}</td>
                                    <td className="py-3 md:py-4 text-center">
                                        <span className={`font-black text-xs md:text-sm font-mono ${t.out > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                                            {t.out > 0 ? Number(t.out).toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}
                                        </span>
                                    </td>
                                    <td className="py-3 md:py-4 text-center">
                                        <span className={`font-black text-xs md:text-sm font-mono ${t.in > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                                            {t.in > 0 ? Number(t.in).toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}
                                        </span>
                                    </td>
                                    <td className="py-3 md:py-4 text-center">
                                        <span className={`px-2 md:px-3 py-1 rounded-md md:rounded-lg text-[8px] md:text-[9px] font-black ${badgeClass}`}>{t.impact}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            {totalPages > 1 && (
                <div className="mt-4 md:mt-6 flex flex-wrap justify-center items-center gap-2 md:gap-3">
                    <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold shadow-sm transition-all text-xs"><i className="fas fa-chevron-right"></i></button>
                    <span className="px-3 md:px-5 py-1.5 md:py-2 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-xl font-black text-[10px] md:text-sm border border-indigo-100 whitespace-nowrap">صفحة {currentPage} من {totalPages}</span>
                    <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold shadow-sm transition-all text-xs"><i className="fas fa-chevron-left"></i></button>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                @media(min-width:768px) { .custom-scrollbar::-webkit-scrollbar { height: 6px; } }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}} />
        </div>
    );
};