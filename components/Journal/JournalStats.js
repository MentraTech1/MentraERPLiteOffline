// المسار: components/Journal/JournalStats.js
window.JournalStats = function({ stats }) {
    const formatMoney = (num) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-view" style={{ animationDelay: '0.1s' }}>
            
            {/* بطاقة العمليات */}
            <div className="bg-white p-5 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fas fa-list-ol"></i>
                </div>
                <div>
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">العمليات المسجلة</p>
                    <p className="text-xl md:text-2xl font-black text-slate-800 font-mono">{stats.count} <span className="text-[10px] text-slate-500 font-sans">قيد</span></p>
                </div>
            </div>

            {/* بطاقة إجمالي التداولات */}
            <div className="bg-white p-5 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-indigo-200 transition-colors">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fas fa-money-bill-transfer"></i>
                </div>
                <div>
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي التداولات</p>
                    <p className="text-xl md:text-2xl font-black text-indigo-600 font-mono truncate">{formatMoney(stats.totalVolume)}</p>
                </div>
            </div>

            {/* بطاقة سلامة الدفاتر */}
            <div className={`p-5 rounded-2xl md:rounded-[2rem] shadow-sm flex items-center gap-4 relative overflow-hidden transition-all duration-500 ${stats.isBalanced ? 'bg-slate-900 border-slate-800' : 'bg-rose-500 border-rose-600 animate-pulse'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${stats.isBalanced ? 'bg-white/10 text-emerald-400' : 'bg-white/20 text-white'}`}>
                    <i className={stats.isChecking ? "fas fa-spinner fa-spin" : (stats.isBalanced ? "fas fa-scale-balanced" : "fas fa-triangle-exclamation")}></i>
                </div>
                <div>
                    <p className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 ${stats.isBalanced ? 'text-slate-400' : 'text-rose-100'}`}>سلامة الدفاتر</p>
                    <p className="text-xl md:text-2xl font-black text-white">
                        {stats.isChecking ? 'جاري الفحص...' : (stats.isBalanced ? 'الميزان متزن ✅' : 'يوجد خلل ⚠️')}
                    </p>
                </div>
            </div>

        </div>
    );
};