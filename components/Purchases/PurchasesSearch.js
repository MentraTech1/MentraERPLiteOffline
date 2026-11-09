
window.PurchasesSearch = function({ searchTerm, onSearchChange, searchResults, onSelectProduct, hideResults }) {
    return (
        <div className="relative z-20 shrink-0">
            <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-barcode text-sm"></i>
                </div>
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="ابحث بالاسم أو امسح الباركود..." 
                    autoComplete="off"
                    className="w-full bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-[1.2rem] py-4 md:py-5 pr-14 pl-4 font-bold text-sm md:text-base text-slate-800 outline-none transition-all shadow-sm"
                />
            </div>
            
            {!hideResults && searchTerm && (
                <div className="absolute left-0 right-0 bg-white shadow-2xl rounded-2xl mt-2 max-h-64 overflow-y-auto border border-slate-100 divide-y divide-slate-50 z-50">
                    {searchResults.length === 0 ? (
                        <div className="p-6 text-center text-sm text-rose-400 font-bold flex flex-col items-center">
                            <i className="fas fa-box-open text-3xl mb-2 opacity-50"></i>
                            لا يوجد منتج بهذا الاسم أو الباركود
                        </div>
                    ) : (
                        searchResults.map(p => (
                            <div key={p.id} onClick={() => onSelectProduct(p)} className="p-4 hover:bg-emerald-50 cursor-pointer flex justify-between items-center transition-colors active:bg-emerald-100 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded flex items-center justify-center group-hover:bg-emerald-200 group-hover:text-emerald-700 transition-colors">
                                        <i className="fas fa-plus text-xs"></i>
                                    </div>
                                    <span className="font-black text-slate-800 text-sm">{p.name_ar}</span>
                                </div>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded font-mono font-bold group-hover:bg-white border border-slate-200">
                                    بالمخزن: {p.stock_qty || 0}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};