// المسار: components/Returns/ReturnsSearch.js
window.ReturnsSearch = function({ searchInputRef, searchQuery, onSearch, searchResults, onAddToCart, openScanner }) {
    return (
        <div 
            onClick={() => {
                if (searchInputRef && searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }}
            className="bg-amber-50 rounded-3xl p-3 mb-3 border border-amber-200 shadow-sm shrink-0 cursor-text"
        >
            <div className="relative mb-2">
                <i className="fas fa-barcode absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 text-lg pointer-events-none"></i>
                
                <input 
                    ref={searchInputRef}
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)} 
                    placeholder="ابحث باسم المنتج أو الباركود لإرجاعه..."
                    autoFocus
                    className="w-full bg-white border-2 border-transparent focus:border-amber-500 rounded-2xl py-2.5 pr-12 pl-14 font-bold text-slate-700 text-sm outline-none transition-all shadow-sm"
                />

                {/* زر مسح الكاميرا */}
                <button 
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        openScanner();
                    }}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-amber-500 hover:bg-amber-600 text-white rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-amber-500/30"
                    title="مسح الباركود بالكاميرا"
                >
                    <i className="fas fa-camera"></i>
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {searchResults === null ? (
                     <p className="text-xs text-slate-500 font-bold w-full text-center py-1">
                         <i className="fas fa-search ml-1"></i> اكتب اسم أو باركود الصنف المرتجع
                     </p>
                ) : searchResults.length === 0 ? (
                     <p className="text-xs text-rose-500 font-bold w-full text-center py-1">صنف غير موجود</p>
                ) : (
                    searchResults.map(p => (
                        <div 
                            key={p.id} 
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(p);
                            }}
                            className="bg-white px-3 py-2 border border-slate-200 rounded-xl cursor-pointer hover:border-amber-400 active:bg-amber-50 min-w-[110px] shrink-0 transition-all select-none"
                        >
                            <div className="font-black text-[11px] text-slate-800 truncate w-24">{p.name_ar}</div>
                            <div className="font-black text-[13px] text-amber-600 mt-0.5">{Number(p.price).toFixed(2)}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};