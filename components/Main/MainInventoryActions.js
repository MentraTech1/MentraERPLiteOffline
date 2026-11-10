// المسار: components/Main/MainInventoryActions.js
window.MainInventoryActions = function({ stats, navigateToModule }) {
    const formatMoney = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 animate-view" style={{ animationDelay: '0.2s' }}>
            {/* تقييم المخزن */}
            <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-6 shadow-xl text-white lg:col-span-1 relative overflow-hidden">
                <div className="absolute -left-6 -bottom-6 text-7xl md:text-8xl text-white/5"><i className="fas fa-warehouse"></i></div>
                <h3 className="relative z-10 text-base md:text-lg font-black mb-4 md:mb-6 flex items-center gap-2"><i className="fas fa-warehouse text-blue-400"></i> حالة المخزون (الآن)</h3>
                <div className="relative z-10 space-y-3 md:space-y-4">
                    <div className="bg-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-sm">
                        <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase">إجمالي قيمة البضاعة</p>
                        <div className="text-xl md:text-2xl font-black text-white mt-1 font-mono tracking-tighter truncate">{formatMoney(stats.totalStockValue)} <span className="text-xs md:text-sm font-normal font-sans text-slate-400">ج.م</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <div className="bg-white/5 p-2 md:p-3 rounded-xl md:rounded-2xl text-center backdrop-blur-sm">
                            <div className="text-lg md:text-xl font-black text-blue-300 font-mono">{stats.productsCount}</div>
                            <div className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-1">منتج مسجل</div>
                        </div>
                        <div onClick={() => navigateToModule('Inventory')} className={`border p-2 md:p-3 rounded-xl md:rounded-2xl text-center cursor-pointer hover:scale-105 transition-all duration-300 shadow-md backdrop-blur-sm ${stats.lowStockCount > 0 ? 'bg-rose-500/20 border-rose-500/30 hover:bg-rose-500/40 animate-pulse' : 'bg-emerald-500/20 border-emerald-500/30'}`}>
                            <div className={`text-lg md:text-xl font-black font-mono ${stats.lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{stats.lowStockCount}</div>
                            <div className={`text-[9px] md:text-[10px] font-bold mt-1 ${stats.lowStockCount > 0 ? 'text-rose-300' : 'text-emerald-300'}`}><i className="fas fa-external-link-alt ml-1"></i> نواقص (للجرد)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* الإجراءات السريعة */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-slate-100 lg:col-span-2">
                <h3 className="text-base md:text-lg font-black text-slate-800 mb-4 md:mb-5 flex items-center gap-2"><i className="fas fa-bolt text-amber-500"></i> إجراءات سريعة</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                    <button onClick={() => navigateToModule('sales')} className="group bg-slate-50 hover:bg-blue-600 p-4 md:p-5 rounded-2xl md:rounded-3xl text-center transition-all border border-slate-100 active:scale-95 shadow-sm">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                            <i className="fas fa-shopping-cart text-lg md:text-xl text-blue-600"></i>
                        </div>
                        <div className="text-[11px] md:text-[13px] font-black text-slate-700 group-hover:text-white">نقطة البيع</div>
                    </button>
                    
                    <button onClick={() => navigateToModule('returns')} className="group bg-slate-50 hover:bg-amber-600 p-4 md:p-5 rounded-2xl md:rounded-3xl text-center transition-all border border-slate-100 active:scale-95 shadow-sm">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                            <i className="fas fa-undo-alt text-lg md:text-xl text-amber-600"></i>
                        </div>
                        <div className="text-[11px] md:text-[13px] font-black text-slate-700 group-hover:text-white">عمل مرتجع</div>
                    </button>

                    <button onClick={() => navigateToModule('purchases')} className="group bg-slate-50 hover:bg-indigo-600 p-4 md:p-5 rounded-2xl md:rounded-3xl text-center transition-all border border-slate-100 active:scale-95 shadow-sm">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                            <i className="fas fa-truck-loading text-lg md:text-xl text-indigo-600"></i>
                        </div>
                        <div className="text-[11px] md:text-[13px] font-black text-slate-700 group-hover:text-white">شراء بضاعة</div>
                    </button>

                    <button onClick={() => navigateToModule('settings')} className="group bg-slate-50 hover:bg-emerald-600 p-4 md:p-5 rounded-2xl md:rounded-3xl text-center transition-all border border-slate-100 active:scale-95 shadow-sm">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                            <i className="fas fa-cog text-lg md:text-xl text-emerald-600"></i>
                        </div>
                        <div className="text-[11px] md:text-[13px] font-black text-slate-700 group-hover:text-white">إعدادات النظام</div>
                    </button>
                </div>
            </div>
        </div>
    );
};