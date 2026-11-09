// المسار: components/Inventory/InventoryModal.js
window.InventoryModal = function({ onClose, onSave, editingProduct }) {
    const { useState, useEffect } = React;

    const [formData, setFormData] = useState({
        name_ar: '', sku: '', category: '', cost: '', price: '', stock_qty: ''
    });

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                name_ar: editingProduct.name_ar || '',
                sku: editingProduct.sku || '',
                category: editingProduct.category || '',
                cost: editingProduct.cost || '',
                price: editingProduct.price || '',
                stock_qty: editingProduct.stock_qty || ''
            });
        } else {
            setFormData({ name_ar: '', sku: '', category: '', cost: '', price: '', stock_qty: '' });
        }
    }, [editingProduct]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="flex flex-col gap-5 md:gap-6 pb-6">
            
            {/* الهيدر */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 md:gap-4">
                    <button type="button" onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all border border-slate-200 active:scale-90 shadow-sm">
                        <i className="fas fa-arrow-right"></i>
                    </button>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            {editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}
                        </h2>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1">
                            قم بإدخال بيانات المنتج والمخزون بدقة
                        </p>
                    </div>
                </div>
            </div>

            {/* الفورم */}
            <form id="reactProductForm" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
                
                {/* البيانات الأساسية */}
                <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 space-y-5">
                    <div>
                        <label className="text-xs font-black pr-2 mb-2 block text-slate-600">اسم المنتج <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <i className="fas fa-tag absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                            <input type="text" name="name_ar" value={formData.name_ar} onChange={handleChange} placeholder="مثلاً: زيت زيتون 1 لتر" className="w-full bg-slate-50 py-3.5 md:py-4 pr-11 pl-4 rounded-2xl font-bold outline-none border border-slate-200 focus:border-blue-500 focus:bg-white text-[16px] transition-all shadow-sm" required />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-black pr-2 mb-2 block text-slate-600">الباركود (SKU)</label>
                            <div className="relative">
                                <i className="fas fa-barcode absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                                <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="00000" className="w-full bg-slate-50 py-3.5 md:py-4 pr-11 pl-4 rounded-2xl font-bold outline-none border border-slate-200 focus:border-blue-500 focus:bg-white text-[16px] transition-all shadow-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-black pr-2 mb-2 block text-slate-600">التصنيف</label>
                            <div className="relative">
                                <i className="fas fa-layer-group absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                                <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="عام" className="w-full bg-slate-50 py-3.5 md:py-4 pr-11 pl-4 rounded-2xl font-bold outline-none border border-slate-200 focus:border-blue-500 focus:bg-white text-[16px] transition-all shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* الأسعار والحفظ */}
                <div className="bg-slate-900 p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
                    <i className="fas fa-box-open absolute -left-6 -bottom-6 text-8xl text-white/5"></i>
                    
                    <div className="space-y-5 relative z-10">
                        <div>
                            <label className="text-[11px] font-black block mb-2 text-emerald-400">سعر التكلفة (للشراء)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">ج.م</span>
                                <input type="number" name="cost" value={formData.cost} onChange={handleChange} step="0.01" inputMode="decimal" placeholder="0.00" className="w-full bg-slate-800 py-3.5 px-4 rounded-xl font-black text-emerald-400 text-right outline-none border border-slate-700 focus:border-emerald-500 text-[16px] transition-all" required />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-black block mb-2 text-blue-400">سعر البيع (للجمهور)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">ج.م</span>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" inputMode="decimal" placeholder="0.00" className="w-full bg-slate-800 py-3.5 px-4 rounded-xl font-black text-blue-400 text-right outline-none border border-slate-700 focus:border-blue-500 text-[16px] transition-all" required />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-black block mb-2 text-slate-300">الكمية المتاحة (رصيد أول المدة)</label>
                            <input type="number" name="stock_qty" value={formData.stock_qty} onChange={handleChange} inputMode="numeric" placeholder="0" className="w-full bg-slate-800 py-3.5 px-4 rounded-xl font-black text-white text-right outline-none border border-slate-700 focus:border-slate-500 text-[16px] transition-all" required />
                        </div>
                    </div>

                    <div className="pt-8 relative z-10 mt-6">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm md:text-base flex justify-center items-center gap-2">
                            <i className="fas fa-save"></i> حفظ البيانات
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};