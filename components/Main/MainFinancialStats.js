// المسار: components/Main/MainFinancialStats.js
window.MainFinancialStats = function({ stats }) {
    const formatMoney = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const isProfitPos = stats.netProfit >= 0;

    return (
        <div className="space-y-4 md:space-y-5 animate-view" style={{ animationDelay: '0.1s' }}>
            {/* الصف الأول */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
                {/* صافي المبيعات */}
                <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 md:w-20 md:h-20 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase">صافي المبيعات</p>
                                <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1 font-mono tracking-tighter truncate">{formatMoney(stats.netSales)}</div>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner text-lg md:text-xl shrink-0"><i className="fas fa-wallet"></i></div>
                        </div>
                        <p className="text-[10px] md:text-[11px] font-bold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-md md:rounded-lg"><i className="fas fa-file-invoice ml-1"></i> {stats.salesCount} فاتورة</p>
                    </div>
                </div>

                {/* المرتجعات */}
                <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase">إجمالي المرتجعات</p>
                                <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1 font-mono tracking-tighter truncate">{formatMoney(stats.totalReturns)}</div>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner text-lg md:text-xl shrink-0"><i className="fas fa-undo-alt"></i></div>
                        </div>
                        <p className="text-[10px] md:text-[11px] font-bold text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded-md md:rounded-lg"><i className="fas fa-box-open ml-1"></i> {stats.returnsCount} فاتورة</p>
                    </div>
                </div>

                {/* تكلفة البضاعة المباعة */}
                <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 md:w-20 md:h-20 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase">تكلفة المبيعات (COGS)</p>
                                <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1 font-mono tracking-tighter truncate">{formatMoney(stats.netCOGS)}</div>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner text-lg md:text-xl shrink-0"><i className="fas fa-dolly"></i></div>
                        </div>
                        <p className="text-[10px] md:text-[11px] font-bold text-indigo-600">تكلفة البضاعة التي تم بيعها</p>
                    </div>
                </div>
            </div>

            {/* الصف الثاني */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                {/* المصروفات */}
                <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 md:w-20 md:h-20 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase">المصروفات التشغيلية</p>
                                <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1 font-mono tracking-tighter truncate">{formatMoney(stats.totalExpenses)}</div>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner text-lg md:text-xl shrink-0"><i className="fas fa-arrow-down"></i></div>
                        </div>
                        <p className="text-[10px] md:text-[11px] font-bold text-rose-600 bg-rose-50 inline-block px-2 py-1 rounded-md md:rounded-lg"><i className="fas fa-clipboard-list ml-1"></i> {stats.expCount} قيد يومي</p>
                    </div>
                </div>

                {/* صافي الربح */}
                <div className={`bg-gradient-to-br ${isProfitPos ? 'from-emerald-500 to-teal-600' : 'from-rose-500 to-red-600'} rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-lg text-white relative overflow-hidden transition-colors`}>
                    <div className="absolute -right-4 -bottom-4 text-6xl md:text-7xl text-white/10"><i className="fas fa-chart-pie"></i></div>
                    <div className="relative z-10">
                        <p className="text-[10px] md:text-[11px] font-black text-white/80 uppercase">صافي الربح الفعلي</p>
                        <div className="text-2xl sm:text-3xl font-black mt-1 mb-3 md:mb-4 font-mono tracking-tighter truncate">{formatMoney(stats.netProfit)}</div>
                        
                        {/* هامش الربح */}
                        <div className="w-full bg-white/20 rounded-full h-1 md:h-1.5 mb-1.5 overflow-hidden">
                            <div className="bg-white h-1 md:h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(Math.max(stats.profitMargin, 0), 100)}%` }}></div>
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-white/90 flex justify-between items-center">
                            <span>هامش الربح التشغيلي:</span> 
                            <span className="font-black bg-white/20 px-1.5 md:px-2 py-0.5 rounded">{stats.profitMargin.toFixed(1)}%</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};