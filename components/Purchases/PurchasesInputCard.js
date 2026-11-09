
// المسار: components/Purchases/PurchasesInputCard.js
window.PurchasesInputCard = function({ product, onAdd, onCancel }) {
    const { useState, useEffect } = React;
    const [qty, setQty] = useState('');
    const [cost, setCost] = useState('');

    useEffect(() => {
        if (product) {
            setQty('1'); // كمية افتراضية 1 عند الاختيار
            setCost(product.cost || '');
        }
    }, [product]);

    if (!product) return null;

    const handleAdd = () => {
        onAdd(parseFloat(qty) || 0, parseFloat(cost) || 0);
    };

    return (
        <div className="bg-white rounded-[2rem] p-5 shadow-lg border border-slate-200 animate-slideInRight shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[4rem] -z-0"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                        <i className="fas fa-box-open"></i>
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-base md:text-lg">{product.name_ar}</h3>
                        <p className="text-[10px] font-bold text-slate-500">متاح في المخزن: <span className="font-mono text-emerald-600 bg-emerald-50 px-1 rounded">{product.stock_qty || 0}</span></p>
                    </div>
                </div>
                <button onClick={onCancel} className="bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-sm border border-slate-200">
                    <i className="fas fa-times"></i>
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 focus-within:border-emerald-500 transition-colors shadow-inner">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-center">الكمية المستلمة</label>
                    <input 
                        type="number" 
                        value={qty} 
                        onChange={e => setQty(e.target.value)} 
                        inputMode="decimal" 
                        min="1" 
                        className="w-full bg-transparent text-slate-900 text-2xl font-black font-mono text-center outline-none" 
                        autoFocus
                    />
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 focus-within:border-emerald-500 transition-colors shadow-inner">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-center">التكلفة (ج.م)</label>
                    <input 
                        type="number" 
                        value={cost} 
                        onChange={e => setCost(e.target.value)} 
                        inputMode="decimal" 
                        placeholder="0.00" 
                        className="w-full bg-transparent text-slate-900 text-2xl font-black font-mono text-center outline-none" 
                    />
                </div>
            </div>
            
            <button onClick={handleAdd} className="w-full mt-5 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 relative z-10">
                <i className="fas fa-plus"></i> إضافة للفاتورة
            </button>
        </div>
    );
};