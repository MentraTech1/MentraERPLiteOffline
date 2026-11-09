// المسار: components/Inventory/InventoryStats.js
window.InventoryStats = function({ stats }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-view" style={{ animationDelay: '0.1s' }}>
            {/* إجمالي قيمة المخزن */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-emerald-200 transition-colors">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fas fa-coins"></i>
                </div>
                <div>
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">قيمة المخزن</p>
                    <p className="text-base md:text-xl font-black text-slate-800 font-mono truncate">{stats.totalValue.toLocaleString()} <span className="text-[10px] text-slate-500">ج.م</span></p>
                </div>
            </div>

            {/* إجمالي الأصناف */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fas fa-box-open"></i>
                </div>
                <div>
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الأصناف</p>
                    <p className="text-base md:text-xl font-black text-slate-800 font-mono">{stats.totalItems} <span className="text-[10px] text-slate-500">صنف</span></p>
                </div>
            </div>

            {/* نواقص */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-amber-200 transition-colors">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div>
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">نواقص (للجرد)</p>
                    <p className="text-base md:text-xl font-black text-amber-600 font-mono">{stats.lowCount} <span className="text-[10px] text-amber-500/70">صنف</span></p>
                </div>
            </div>

            {/* نفدت */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-rose-200 transition-colors">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fas fa-ban"></i>
                </div>
                <div>
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">أصناف نفدت</p>
                    <p className="text-base md:text-xl font-black text-rose-600 font-mono">{stats.outCount} <span className="text-[10px] text-rose-500/70">صنف</span></p>
                </div>
            </div>
        </div>
    );
};