
// المسار: components/Purchases/PurchasesCart.js
window.PurchasesCart = function({ cart, onRemove }) {
    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar bg-[#0b1120]">
            <div className="space-y-3">
                {cart.length === 0 ? (
                    <div className="text-center py-16 opacity-50 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <i className="fas fa-box-open text-3xl text-slate-500"></i>
                        </div>
                        <span className="text-slate-400 font-bold text-sm">الفاتورة فارغة حالياً</span>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.productId} className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-3.5 flex justify-between items-center gap-3 relative overflow-hidden animate-fade-in hover:border-emerald-500/30 transition-colors group">
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                            
                            <div className="flex-1 pr-2">
                                <h5 className="font-black text-sm text-slate-100 line-clamp-1">{item.name}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-slate-400 text-xs font-bold bg-slate-900 px-2 py-0.5 rounded">{item.qty} كرتونة/وحدة</span>
                                    <span className="text-slate-500 text-[10px]">×</span>
                                    <span className="text-emerald-400 text-xs font-bold font-mono">{item.cost.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="font-black font-mono text-white text-base">{item.total.toFixed(2)}</span>
                                <button onClick={() => onRemove(item.productId)} className="text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-md text-[10px] font-black active:scale-95 transition-all opacity-80 group-hover:opacity-100 border border-rose-500/20">
                                    <i className="fas fa-trash-alt ml-1"></i>حذف
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};