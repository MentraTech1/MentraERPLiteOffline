// المسار: components/Inventory/InventoryList.js
window.InventoryList = function({ products, currentPage, totalPages, onPageChange, onEdit, onDelete, onQuickAdd }) {
    
    if (products.length === 0) {
        return (
            <div className="col-span-full bg-white rounded-3xl border border-slate-100 py-20 flex flex-col items-center justify-center animate-view shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-box-open text-4xl text-slate-300"></i>
                </div>
                <h3 className="text-slate-800 font-black text-lg mb-1">لا توجد أصناف</h3>
                <p className="text-slate-500 font-bold text-sm">لم يتم العثور على منتجات تطابق بحثك أو لم يتم إضافتها بعد.</p>
            </div>
        );
    }

    // Pagination logic (كما هو لم يتغير)
    const renderPagination = () => {
        if (totalPages <= 1) return null;
        let buttons = [];
        buttons.push(<button key="prev" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === 1 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 active:scale-95 shadow-sm'}`}><i className="fas fa-chevron-right text-sm"></i></button>);
        for (let i = 1; i <= totalPages; i++) {
            if (totalPages > 5) {
                if (i !== 1 && i !== totalPages && Math.abs(i - currentPage) > 1) {
                    if (i === 2 || i === totalPages - 1) buttons.push(<span key={`dots-${i}`} className="text-slate-400 px-2 font-bold">...</span>);
                    continue;
                }
            }
            buttons.push(<button key={i} onClick={() => onPageChange(i)} className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm transition-all ${currentPage === i ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 shadow-sm'}`}>{i}</button>);
        }
        buttons.push(<button key="next" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === totalPages ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 active:scale-95 shadow-sm'}`}><i className="fas fa-chevron-left text-sm"></i></button>);
        return buttons;
    };

    return (
        <div className="animate-view" style={{ animationDelay: '0.3s' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {products.map(p => {
                    const isOutOfStock = Number(p.stock_qty) <= 0;
                    const isLowStock = Number(p.stock_qty) > 0 && Number(p.stock_qty) <= 5;
                    
                    return (
                        <div key={p.id} className={`bg-white rounded-2xl shadow-sm border ${isOutOfStock ? 'border-rose-200 shadow-rose-100/50' : isLowStock ? 'border-amber-200' : 'border-slate-200'} flex flex-col relative transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden group`}>
                            
                            {/* شريط التنبيه العلوي (إن وجد) */}
                            {isOutOfStock && <div className="bg-rose-500 text-white text-[10px] font-black text-center py-1 tracking-widest">الصنف نفد من المخزن!</div>}
                            
                            <div className="p-5 flex-1">
                                {/* الهيدر داخل البطاقة: الإجراءات والباركود */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(p)} className="w-8 h-8 bg-slate-50 text-slate-500 hover:bg-blue-500 hover:text-white rounded-lg flex items-center justify-center transition-colors border border-slate-200 hover:border-blue-500 shadow-sm" title="تعديل"><i className="fas fa-pen text-xs"></i></button>
                                        <button onClick={() => onDelete(p.id)} className="w-8 h-8 bg-slate-50 text-slate-500 hover:bg-rose-500 hover:text-white rounded-lg flex items-center justify-center transition-colors border border-slate-200 hover:border-rose-500 shadow-sm" title="حذف"><i className="fas fa-trash text-xs"></i></button>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 text-left">
                                        <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded border border-slate-200 font-black font-mono">#{p.id}</span>
                                        {p.sku && <span className="text-[10px] font-bold text-slate-400 font-mono"><i className="fas fa-barcode mr-1"></i>{p.sku}</span>}
                                    </div>
                                </div>
                                
                                {/* اسم وتصنيف المنتج */}
                                <div>
                                    <h4 className="font-black text-slate-800 text-base md:text-lg leading-tight mb-2 line-clamp-2" title={p.name_ar}>{p.name_ar}</h4>
                                    <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">{p.category || 'تصنيف عام'}</span>
                                </div>
                            </div>
                            
                            {/* الفوتر داخل البطاقة: السعر والكمية وزر الإضافة السريعة */}
                            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black mb-1 uppercase tracking-wider">سعر البيع</p>
                                    <p className="text-lg font-black text-blue-600 font-mono leading-none">{Number(p.price).toLocaleString()} <span className="text-[10px] text-slate-500 font-bold">ج.م</span></p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="text-left">
                                        <p className="text-[10px] text-slate-500 font-black mb-1 uppercase tracking-wider text-left">المتاح</p>
                                        <p className={`text-xl font-black font-mono leading-none ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-500' : 'text-slate-800'}`}>
                                            {p.stock_qty}
                                        </p>
                                    </div>
                                    
                                    {/* زر الإضافة السريعة تم دمجه بشكل منطقي وجميل */}
                                    <button onClick={() => onQuickAdd(p)} className="w-10 h-10 bg-slate-800 text-white rounded-xl shadow-md hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center" title="إضافة رصيد سريع">
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                            
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                {renderPagination()}
            </div>
        </div>
    );
};