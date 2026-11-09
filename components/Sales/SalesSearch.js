// المسار: components/Sales/SalesSearch.js
window.SalesSearch = function({ searchInputRef, searchQuery, setSearchQuery, searchResults, addToCart, openScanner }) {
    return (
        <div 
            onClick={() => {
                if (searchInputRef && searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }}
            className="flex-shrink-0 bg-white rounded-[1.5rem] p-3 md:p-4 mb-3 border border-slate-100 shadow-sm cursor-text"
        >
            <div className="relative">
                <i className="fas fa-barcode absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 text-lg pointer-events-none"></i>
                <input 
                    ref={searchInputRef}
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم المنتج أو الباركود..." 
                    autoFocus
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl py-3 pr-12 pl-14 font-bold text-slate-700 outline-none transition-colors"
                />
                <button 
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        openScanner();
                    }} 
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-transform active:scale-95 shadow-sm"
                    title="مسح بالكاميرا"
                >
                    <i className="fas fa-camera"></i>
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto mt-2 pb-1 hide-scrollbar">
                {searchQuery.length === 0 ? (
                    <p className="text-[11px] text-slate-400 font-bold w-full text-center py-2">
                        <i className="fas fa-search ml-1"></i> اكتب للبحث أو استخدم القارئ
                    </p>
                ) : searchResults.length === 0 ? (
                    <p className="text-[11px] text-rose-400 font-bold w-full text-center py-2">لا يوجد منتج مطابق</p>
                ) : (
                    searchResults.map(p => {
                        const isOut = (parseFloat(p.stock_qty) || 0) <= 0;
                        return (
                            <div 
                                key={p.id} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(p);
                                }}
                                className={`bg-blue-50 p-2.5 rounded-xl border border-blue-100 cursor-pointer min-w-[120px] flex-shrink-0 transition-colors active:bg-blue-100 select-none ${isOut ? 'opacity-50' : ''}`}
                            >
                                <div className="font-black text-xs text-slate-800 truncate">{p.name_ar}</div>
                                <div className="font-black text-sm text-blue-600 mt-1">{Number(p.price).toFixed(2)} ج.م</div>
                                <div className={`text-[10px] font-bold mt-1 ${isOut ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {isOut ? 'نفد من المخزن' : `متوفر: ${p.stock_qty}`}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};