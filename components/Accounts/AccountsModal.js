// المسار: components/Accounts/AccountsModal.js
window.AccountsModal = function({ onClose, onSave, editingAccount }) {
    const { useState, useEffect } = React;

    const [formData, setFormData] = useState({
        code: '', name_ar: '', type: 'asset', balance: 0
    });

    useEffect(() => {
        if (editingAccount) {
            setFormData({
                code: editingAccount.code || '',
                name_ar: editingAccount.name_ar || '',
                type: editingAccount.type || 'asset',
                balance: editingAccount.balance || 0
            });
        } else {
            setFormData({ code: '', name_ar: '', type: 'asset', balance: 0 });
        }
    }, [editingAccount]);

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
                            {editingAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد لدليل الحسابات'}
                        </h2>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1">
                            تأكد من اختيار التصنيف الصحيح ليؤثر في القوائم المالية
                        </p>
                    </div>
                </div>
            </div>

            {/* الفورم */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
                
                {/* البيانات الأساسية */}
                <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 space-y-5">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-black pr-2 mb-2 block text-slate-600">كود الحساب <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <i className="fas fa-hashtag absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                                <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="مثال: 1001" className="w-full bg-slate-50 py-3.5 md:py-4 pr-11 pl-4 rounded-xl font-mono font-bold outline-none border border-slate-200 focus:border-blue-500 focus:bg-white text-[16px] transition-all shadow-sm" required />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-black pr-2 mb-2 block text-slate-600">تصنيف الحساب (طبيعة الحساب) <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <i className="fas fa-layer-group absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-slate-50 py-3.5 md:py-4 pr-11 pl-4 rounded-xl font-bold outline-none border border-slate-200 focus:border-blue-500 focus:bg-white text-[16px] transition-all shadow-sm cursor-pointer appearance-none">
                                    <option value="asset">أصول (صناديق، بنوك، عملاء، مخزون)</option>
                                    <option value="liability">خصوم (موردين، قروض، دائنون)</option>
                                    <option value="equity">حقوق ملكية (رأس مال، جاري شركاء)</option>
                                    <option value="income">إيرادات (مبيعات، خدمات)</option>
                                    <option value="expense">مصروفات (رواتب، إيجار، مشتريات)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black pr-2 mb-2 block text-slate-600">اسم الحساب <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <i className="fas fa-file-signature absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                            <input type="text" name="name_ar" value={formData.name_ar} onChange={handleChange} placeholder="مثال: البنك الأهلي المصري" className="w-full bg-slate-50 py-3.5 md:py-4 pr-11 pl-4 rounded-xl font-bold outline-none border border-slate-200 focus:border-blue-500 focus:bg-white text-[16px] transition-all shadow-sm" required />
                        </div>
                    </div>
                </div>

                {/* الرصيد الافتتاحي والحفظ */}
                <div className="bg-slate-900 p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
                    <i className="fas fa-scale-balanced absolute -left-6 -bottom-6 text-8xl text-white/5 pointer-events-none"></i>
                    
                    <div className="relative z-10">
                        <label className="text-[11px] font-black block mb-3 text-blue-400 uppercase tracking-widest">الرصيد الافتتاحي (أول المدة)</label>
                        <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 focus-within:border-blue-500 transition-colors">
                            <input 
                                type="number" 
                                name="balance" 
                                value={formData.balance} 
                                onChange={handleChange} 
                                inputMode="decimal" 
                                step="0.01"
                                placeholder="0.00" 
                                className="w-full bg-transparent py-4 px-4 font-black text-white text-3xl outline-none font-mono text-center" 
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-3 font-bold text-center">قم بإدخال الرصيد الأولي لهذا الحساب قبل بدء العمل على النظام.</p>
                    </div>

                    <div className="pt-8 relative z-10 mt-6">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black shadow-lg shadow-blue-600/30 active:scale-95 transition-all text-sm md:text-base flex justify-center items-center gap-2">
                            <i className="fas fa-save"></i> حفظ في الدليل
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};