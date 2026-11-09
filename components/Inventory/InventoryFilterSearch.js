// المسار: components/Inventory/InventoryFilterSearch.js
window.InventoryFilterSearch = function({ filter, onFilterChange, searchTerm, onSearchChange }) {
    
    // تصميم عصري لأزرار الفلتر
    const getBtnClass = (type) => {
        const base = "px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 whitespace-nowrap active:scale-95";
        if (filter === type) {
            if (type === 'all') return `${base} bg-slate-800 text-white shadow-md`;
            if (type === 'low') return `${base} bg-amber-500 text-white shadow-md shadow-amber-500/30`;
            if (type === 'out') return `${base} bg-rose-500 text-white shadow-md shadow-rose-500/30`;
        }
        
        // غير مفعل
        if (type === 'low') return `${base} bg-white text-amber-600 border border-slate-200 hover:border-amber-200 hover:bg-amber-50`;
        if (type === 'out') return `${base} bg-white text-rose-600 border border-slate-200 hover:border-rose-200 hover:bg-rose-50`;
        return `${base} bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50`;
    };

    return (
        <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 mb-6 animate-view flex flex-col xl:flex-row gap-4 items-center" style={{ animationDelay: '0.2s' }}>
            
            {/* شريط البحث */}
            <div className="relative w-full xl:flex-1">
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <i className="fas fa-search text-slate-400"></i>
                </div>
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="ابحث باسم المنتج، الباركود، أو التصنيف..." 
                    className="w-full bg-slate-50 py-3.5 pr-12 pl-4 rounded-xl outline-none font-bold text-sm text-slate-700 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" 
                />
            </div>

            {/* أزرار الفلترة */}
            <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-1 scrollbar-hide shrink-0">
                <button onClick={() => onFilterChange('all')} className={getBtnClass('all')}>
                    <i className="fas fa-layer-group"></i> كل الأصناف
                </button>
                <div className="w-px h-8 bg-slate-200 self-center mx-1 shrink-0"></div>
                <button onClick={() => onFilterChange('low')} className={getBtnClass('low')}>
                    <i className="fas fa-exclamation-circle"></i> قاربت على النفاذ
                </button>
                <button onClick={() => onFilterChange('out')} className={getBtnClass('out')}>
                    <i className="fas fa-times-circle"></i> نفدت تماماً
                </button>
            </div>
            
        </div>
    );
};