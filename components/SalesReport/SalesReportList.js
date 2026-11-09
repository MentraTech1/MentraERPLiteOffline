
// المسار: components/SalesReport/SalesReportList.js
window.SalesReportList = function({ filteredSales, currentPage, setCurrentPage, itemsPerPage, openDetails }) {
    const lastPage = Math.max(0, Math.ceil(filteredSales.length / itemsPerPage) - 1);
    const safeCurrentPage = Math.min(currentPage, lastPage);
    
    const start = safeCurrentPage * itemsPerPage;
    const paged = filteredSales.slice(start, start + itemsPerPage);

    const changePage = (dir) => {
        const newPage = safeCurrentPage + dir;
        if (newPage >= 0 && newPage <= lastPage) {
            setCurrentPage(newPage);
            if (window.innerWidth < 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="animate-view" style={{ animationDelay: '0.1s' }}>
            
            <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full text-right whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 font-black text-xs md:text-sm text-slate-500 rounded-tr-2xl">رقم الفاتورة</th>
                                <th className="p-4 font-black text-xs md:text-sm text-slate-500">التاريخ</th>
                                <th className="p-4 font-black text-xs md:text-sm text-slate-500">اسم العميل</th>
                                <th className="p-4 font-black text-xs md:text-sm text-slate-500">حالة السداد</th>
                                <th className="p-4 font-black text-xs md:text-sm text-slate-500">الإجمالي</th>
                                <th className="p-4 font-black text-xs md:text-sm text-slate-500 text-center rounded-tl-2xl">إجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paged.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-16 text-slate-400">
                                        <i className="fas fa-file-invoice text-4xl mb-3 opacity-30 block"></i>
                                        <p className="font-bold text-sm">لا توجد مبيعات في هذا القسم</p>
                                    </td>
                                </tr>
                            ) : (
                                paged.map(inv => {
                                    const isPaid = inv.status === 'paid';
                                    const statusBg = isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100';
                                    
                                    return (
                                        <tr key={inv.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer" onClick={() => openDetails(inv.id)}>
                                            <td className="p-4">
                                                <span className="font-black text-slate-800 text-sm font-mono tracking-tighter">#{inv.invoice_number}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-slate-500 text-xs">{String(inv.date).substring(0, 16).replace('T', ' ')}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                        <i className="fas fa-user text-[10px]"></i>
                                                    </div>
                                                    <span className="font-black text-slate-700 text-xs md:text-sm">{inv.customer_vendor_name || 'عميل نقدي عام'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] md:text-xs font-black border ${statusBg} inline-flex items-center gap-1.5`}>
                                                    {isPaid ? <><i className="fas fa-check"></i> مدفوع</> : <><i className="fas fa-clock"></i> آجل</>}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm md:text-base font-black text-slate-900 font-mono">
                                                    {Number(inv.total).toLocaleString(undefined, {minimumFractionDigits: 2})} ج.م
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button className="w-8 h-8 bg-white border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all mx-auto">
                                                    <i className="fas fa-eye text-xs"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredSales.length > 0 && (
                <div className="flex justify-center items-center mt-6 md:mt-8">
                    <div className="bg-white p-1.5 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 flex items-center gap-1">
                        <button onClick={() => changePage(-1)} disabled={safeCurrentPage === 0} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-50 rounded-lg md:rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all active:scale-90"><i className="fas fa-chevron-right text-sm"></i></button>
                        <div className="px-4 py-2 flex items-center justify-center min-w-[70px]">
                            <span className="font-black text-sm md:text-base text-blue-600">{safeCurrentPage + 1}</span>
                        </div>
                        <button onClick={() => changePage(1)} disabled={safeCurrentPage >= lastPage} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-50 rounded-lg md:rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all active:scale-90"><i className="fas fa-chevron-left text-sm"></i></button>
                    </div>
                </div>
            )}
        </div>
    );
};