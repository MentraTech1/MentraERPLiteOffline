// المسار: components/Sales/SalesCart.js
window.SalesCart = function({ cart, updateQty, removeItem, clearCart }) {
    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-black text-sm text-slate-700 flex items-center gap-2">
                    <i className="fas fa-shopping-basket text-blue-500"></i> الفاتورة الحالية
                </h3>
                {cart.length > 0 && (
                    <button onClick={clearCart} className="text-[11px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors">
                        إفراغ الكل
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2">
                {cart.length === 0 ? (
                    <div className="text-center py-20 opacity-40">
                        <i className="fas fa-cart-arrow-down text-5xl text-slate-300 mb-3 block"></i>
                        <span className="text-xs font-bold text-slate-500">الفاتورة فارغة، قم بإضافة منتجات</span>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="font-black text-sm text-slate-800 truncate">{item.name}</div>
                                <div className="text-[10px] text-slate-400 font-bold mt-0.5">{item.price.toFixed(2)} للوحدة</div>
                            </div>
                            
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                                    <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 active:scale-90 transition-transform"><i className="fas fa-minus text-[10px]"></i></button>
                                    <span className="font-black text-sm text-slate-800 w-8 text-center">{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 active:scale-90 transition-transform"><i className="fas fa-plus text-[10px]"></i></button>
                                </div>
                                
                                <div className="flex flex-col items-end min-w-[70px]">
                                    <span className="font-black text-blue-600 text-base">{(item.price * item.qty).toFixed(2)}</span>
                                    <button onClick={() => removeItem(item.id)} className="text-[10px] font-bold text-rose-500 mt-1 hover:text-rose-700 flex items-center gap-1">
                                        <i className="fas fa-trash-alt"></i> حذف
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};