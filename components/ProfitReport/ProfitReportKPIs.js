// المسار: components/ProfitReport/ProfitReportKPIs.js
window.ProfitReportKPIs = function({ data }) {
    const formatMoney = (n) => Number(n).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    if (!data) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 animate-view" style={{ animationDelay: '0.1s' }}>
            {/* 1. المحاسبة (الربح الفعلي) */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden group flex flex-col">
                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
                <div className="absolute -left-6 -top-6 w-24 h-24 md:w-32 md:h-32 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700 z-0 opacity-50"></div>
                
                <h2 className="relative z-10 text-base md:text-lg font-black text-slate-800 mb-4 md:mb-6 flex items-center gap-2">
                    <i className="fas fa-calculator text-emerald-500 text-lg md:text-xl"></i> الربح المحاسبي الفعلي
                </h2>
                
                <div className="relative z-10 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center bg-slate-50 p-2 md:p-2.5 rounded-lg md:rounded-xl">
                            <span className="text-[10px] md:text-xs font-black text-slate-500">إجمالي المبيعات</span>
                            <span className="text-xs md:text-sm font-black text-emerald-600 font-mono">{formatMoney(data.totalGrossRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-amber-50/50 p-2 md:p-2.5 rounded-lg md:rounded-xl border border-amber-100/50">
                            <span className="text-[10px] md:text-xs font-black text-amber-600">(-) مرتجعات مبيعات</span>
                            <span className="text-xs md:text-sm font-black text-amber-600 font-mono">{formatMoney(data.totalReturns)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-100 p-2 md:p-2.5 rounded-lg md:rounded-xl border border-slate-200">
                            <span className="text-[10px] md:text-xs font-black text-slate-700 uppercase">(=) صافي المبيعات</span>
                            <span className="text-xs md:text-sm font-black text-slate-800 font-mono">{formatMoney(data.netRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2 md:p-2.5 rounded-lg md:rounded-xl mt-2">
                            <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase">(-) صافي تكلفة المباع</span>
                            <span className="text-xs md:text-sm font-black text-rose-500 font-mono">{formatMoney(data.netCOGS)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2 md:p-2.5 rounded-lg md:rounded-xl">
                            <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase">(-) المصروفات</span>
                            <span className="text-xs md:text-sm font-black text-rose-500 font-mono">{formatMoney(data.totalExpenses)}</span>
                        </div>
                    </div>
                    <div className={`flex justify-between items-center ${data.netIncome >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'} p-3 md:p-4 rounded-xl md:rounded-2xl mt-3 md:mt-4 shadow-sm`}>
                        <span className={`text-xs md:text-sm font-black ${data.netIncome >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>صافي الربح الفعلي</span>
                        <span className={`text-xl md:text-2xl font-black ${data.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'} font-mono`}>{formatMoney(data.netIncome)}</span>
                    </div>
                </div>
            </div>

            {/* 2. السيولة (الفلوس في الجيب) */}
            <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-xl relative overflow-hidden text-white group flex flex-col">
                <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
                <div className="absolute -left-6 -bottom-6 text-7xl md:text-8xl text-white/5 group-hover:-rotate-12 transition-transform duration-700"><i className="fas fa-wallet"></i></div>
                
                <h2 className="relative z-10 text-base md:text-lg font-black mb-4 md:mb-6 flex items-center gap-2">
                    <i className="fas fa-coins text-blue-400 text-lg md:text-xl"></i> تحليل السيولة النقدية (الدرج)
                </h2>
                
                <div className="relative z-10 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white/5 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl">
                            <span className="text-[10px] md:text-xs font-black text-slate-300 uppercase">دخل (مبيعات)</span>
                            <span className="text-sm md:text-base font-black text-emerald-400 font-mono">{formatMoney(data.totalGrossRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl border border-white/5">
                            <span className="text-[10px] md:text-xs font-black text-slate-300 uppercase">خرج (مشتريات بضاعة)</span>
                            <span className="text-sm md:text-base font-black text-rose-400 font-mono">{formatMoney(data.totalPurchases)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl border border-white/5">
                            <span className="text-[10px] md:text-xs font-black text-slate-300 uppercase">خرج (مصروفات)</span>
                            <span className="text-sm md:text-base font-black text-rose-400 font-mono">{formatMoney(data.totalExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-amber-500/10 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl border border-amber-500/20">
                            <span className="text-[10px] md:text-xs font-black text-amber-200 uppercase">خرج (مرتجعات مبيعات)</span>
                            <span className="text-sm md:text-base font-black text-amber-400 font-mono">{formatMoney(data.totalReturns)}</span>
                        </div>
                    </div>
                    <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center ${data.netCashFlow >= 0 ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-rose-500/20 border border-rose-500/30'} p-3 md:p-4 rounded-xl md:rounded-2xl mt-3 md:mt-4 gap-2`}>
                        <span className="text-xs md:text-sm font-black text-white">السيولة (بالدرج)</span>
                        <span className={`text-xl md:text-2xl font-black ${data.netCashFlow >= 0 ? 'text-blue-300' : 'text-rose-400'} font-mono`}>{formatMoney(data.netCashFlow)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};