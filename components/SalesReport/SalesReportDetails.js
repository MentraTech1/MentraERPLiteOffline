
// المسار: components/SalesReport/SalesReportDetails.js
window.SalesReportDetails = function({ invoice, items, profit, onClose, adjustQty, saveSmartEdit, deleteInvoice, printSingleInvoice }) {
    const { useState, useEffect } = React;
    const [editStatus, setEditStatus] = useState('paid');
    
    useEffect(() => {
        if(invoice) setEditStatus(invoice.status);
    }, [invoice]);

    if (!invoice) return null;

    const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
    const isProfitNegative = profit < 0;

    return (
        <div className="flex flex-col gap-5 md:gap-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 md:gap-4">
                    <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all border border-slate-200 active:scale-90 shadow-sm">
                        <i className="fas fa-arrow-right"></i>
                    </button>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            تفاصيل الفاتورة 
                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg font-mono tracking-tighter">#{invoice.invoice_number}</span>
                        </h2>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1">تاريخ الإنشاء: {String(invoice.date).substring(0, 16).replace('T', ' ')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={printSingleInvoice} className="flex-1 sm:flex-none bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all border border-indigo-100 shadow-sm flex justify-center items-center gap-2">
                        <i className="fas fa-print"></i> طباعة الفاتورة
                    </button>
                    <button onClick={deleteInvoice} className="flex-1 sm:flex-none bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all border border-rose-100 shadow-sm flex justify-center items-center gap-2">
                        <i className="fas fa-trash-alt"></i> حذف
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
                
                <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 mb-4 md:mb-5 text-sm md:text-base flex items-center gap-2">
                        <i className="fas fa-boxes text-blue-500"></i> الأصناف المسجلة في الفاتورة
                    </h3>
                    
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-300 transition-all">
                                <div className="flex-1">
                                    <p className="font-black text-sm md:text-base text-slate-800">{item.product_name}</p>
                                    <p className="text-xs font-bold text-slate-500 mt-1">
                                        السعر الفردي: <span className="text-slate-700">{Number(item.price).toLocaleString()} ج.م</span>
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-4 w-full sm:w-auto bg-white p-2 rounded-xl border border-slate-100 shadow-sm justify-between sm:justify-end">
                                    <span className="text-xs font-black text-slate-400 uppercase hidden sm:block">الكمية</span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => adjustQty(idx, -1)} className="w-8 h-8 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center active:scale-90 transition-all"><i className="fas fa-minus text-xs"></i></button>
                                        <span className="w-8 text-center font-black text-lg text-slate-800 font-mono">{item.qty}</span>
                                        <button onClick={() => adjustQty(idx, 1)} className="w-8 h-8 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center active:scale-90 transition-all"><i className="fas fa-plus text-xs"></i></button>
                                    </div>
                                    <div className="text-left w-20 sm:hidden">
                                        <span className="font-black text-slate-800 font-mono">{(item.qty * item.price).toLocaleString()}</span>
                                    </div>
                                </div>
                                
                                <div className="hidden sm:block text-left w-24 shrink-0">
                                    <span className="text-[10px] font-black text-slate-400 block mb-1">الإجمالي</span>
                                    <span className="font-black text-slate-800 font-mono text-base">{(item.qty * item.price).toLocaleString()} ج.م</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-5 md:space-y-6">
                    <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
                        <h3 className="font-black text-slate-800 mb-4 text-sm flex items-center gap-2">
                            <i className="fas fa-cog text-blue-500"></i> إعدادات الفاتورة
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-500 mb-2 block">العميل</label>
                                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm text-slate-800">
                                    {invoice.customer_vendor_name || 'عميل نقدي عام (بدون اسم)'}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-slate-500 mb-2 block">حالة السداد</label>
                                <select 
                                    value={editStatus} 
                                    onChange={(e) => setEditStatus(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-blue-500 transition-colors shadow-sm cursor-pointer"
                                >
                                    <option value="paid">✅ مدفوعة بالكامل (كاش)</option>
                                    <option value="pending">⏳ غير مدفوعة (آجل/دين)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl relative overflow-hidden text-white">
                        <i className="fas fa-wallet absolute -left-4 -bottom-4 text-8xl text-white/5"></i>
                        
                        <div className={`mb-4 pb-4 border-b border-slate-700/50 flex justify-between items-center ${isProfitNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                            <span className="text-xs font-black uppercase tracking-wider">صافي الربح</span>
                            <span className="font-black font-mono text-lg">{profit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>

                        <div className="mb-6">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1">الإجمالي المطلوب للحفظ</span>
                            <h2 className="text-3xl md:text-4xl font-black text-blue-400 font-mono">{total.toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-sm text-slate-500">ج.م</span></h2>
                        </div>

                        <button onClick={() => saveSmartEdit(editStatus)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm md:text-base flex justify-center items-center gap-2 relative z-10">
                            <i className="fas fa-check-circle"></i> اعتماد وحفظ التعديلات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};