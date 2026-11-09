// المسار: components/Accounts/AccountsStats.js
window.AccountsStats = function({ stats, profits }) {
    const formatMoney = (num) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-view mb-6" style={{ animationDelay: '0.1s' }}>
            
            {/* بطاقة الأرباح (تأخذ مساحة أكبر وتصميم مميز) */}
            <div className="md:col-span-2 xl:col-span-2 bg-gradient-to-l from-slate-900 to-slate-800 p-5 md:p-6 rounded-2xl md:rounded-[2rem] text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                <i className="fas fa-chart-line absolute -left-4 -bottom-4 text-8xl text-white/5 pointer-events-none"></i>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <p className="text-[10px] md:text-xs font-black text-blue-400 uppercase tracking-widest mb-1">ملخص الدخل والأرباح</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl md:text-4xl font-black font-mono">{formatMoney(profits.netIncome)}</h3>
                            <span className="text-xs text-slate-400 font-bold">ج.م</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                        <i className="fas fa-wallet text-xl text-blue-300"></i>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <div>
                        <p className="text-[9px] text-slate-400 mb-1">الإيرادات</p>
                        <p className="font-mono font-black text-emerald-400 text-sm">{formatMoney(profits.totalRevenue)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 mb-1">تكلفة البضاعة</p>
                        <p className="font-mono font-black text-rose-400 text-sm">{formatMoney(profits.totalCOGS)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 mb-1">إجمالي الربح</p>
                        <p className="font-mono font-black text-amber-400 text-sm">{formatMoney(profits.grossProfit)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 mb-1">هامش الربح</p>
                        <p className="font-mono font-black text-blue-300 text-sm">{profits.profitMargin.toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            {/* بطاقة الأصول */}
            <div className="bg-white p-5 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                    <i className="fas fa-building-columns"></i>
                </div>
                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الأصول</p>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 font-mono">{formatMoney(stats.assets)}</h2>
            </div>
            
            {/* بطاقة الخصوم حقوق الملكية */}
            <div className="flex flex-col gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-colors flex-1">
                    <div>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الخصوم والالتزامات</p>
                        <h2 className="text-base md:text-lg font-black text-rose-600 font-mono">{formatMoney(stats.liabilities)}</h2>
                    </div>
                    <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="fas fa-hand-holding-dollar"></i>
                    </div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-colors flex-1">
                    <div>
                        <p className="text-[9px] md:text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">صافي حقوق الملكية</p>
                        <h2 className="text-base md:text-lg font-black text-emerald-700 font-mono">{formatMoney(stats.equity)}</h2>
                    </div>
                    <div className="w-10 h-10 bg-white text-emerald-500 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <i className="fas fa-scale-balanced"></i>
                    </div>
                </div>
            </div>

        </div>
    );
};