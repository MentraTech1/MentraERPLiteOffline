// المسار: components/Returns/ReturnsCart.js
window.ReturnsCart = function({ cart, onUpdateQty, onRemove, onClear }) {
    return (
        <div className="flex-1 min-h-0 overflow-y-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-3 hide-scrollbar flex flex-col">
            <div className="flex justify-between items-center mb-3 px-2 shrink-0">
                <h3 className="font-black text-sm text-slate-700">الأصناف المستردة</h3>
                {cart.length > 0 && (
                    <button onClick={onClear} className="text-[11px] font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                        إلغاء المرتجع
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-40">
                        <i className="fas fa-undo text-5xl text-slate-300 mb-3"></i>
                        <span className="font-bold text-xs text-slate-500">لا توجد أصناف مستردة</span>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-3 mb-2 flex justify-between items-center gap-3 shadow-sm">
                            <div className="flex-1 min-w-0">
                                <div className="font-black text-[13px] text-slate-800 truncate">{item.name}</div>
                                <div className="text-[11px] text-slate-400 font-bold mt-0.5">{item.price.toFixed(2)} للوحدة (مسترد)</div>
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                                    <button onClick={() => onUpdateQty(item.id, -1)} className="w-8 h-8 bg-white border-none rounded-md flex items-center justify-center text-slate-600 shadow-sm active:scale-90"><i className="fas fa-minus text-[10px]"></i></button>
                                    <span className="font-black text-sm w-6 text-center">{item.qty}</span>
                                    <button onClick={() => onUpdateQty(item.id, 1)} className="w-8 h-8 bg-white border-none rounded-md flex items-center justify-center text-slate-600 shadow-sm active:scale-90"><i className="fas fa-plus text-[10px]"></i></button>
                                </div>
                                
                                <div className="flex flex-col items-end min-w-[64px]">
                                    <span className="font-black text-[15px] text-amber-600">{(item.price * item.qty).toFixed(2)}</span>
                                    <button onClick={() => onRemove(item.id)} className="text-[10px] font-bold text-rose-500 mt-1"><i className="fas fa-times"></i> إزالة</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};