
// المسار: components/PurchasesReport/PurchasesReportStats.js
window.PurchasesReportStats = function({ filteredPurchases }) {
    const total = filteredPurchases.reduce((s, i) => s + Number(i.total), 0);
    const paid = filteredPurchases.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0);
    const pending = total - paid;
    const paymentRate = total > 0 ? (paid / total) * 100 : 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-5 mb-5 animate-view" style={{ animationDelay: '0.1s' }}>
            <div className="col-span-2 md:col-span-1 bg-slate-900 p-6 rounded-[1.2rem] shadow-lg text-white relative overflow-hidden">
                <i className="fas fa-truck-loading absolute -left-2 -bottom-2 text-6xl text-white/5"></i>
                <p className="text-[11px] font-black text-slate-400 uppercase mb-2">إجمالي التكاليف (المشتريات)</p>
                <div className="text-3xl md:text-4xl font-black font-mono truncate">{total.toLocaleString()}</div>
                <p className="text-[10px] font-bold text-slate-400 mt-2"><i className="fas fa-receipt ml-1"></i> {filteredPurchases.length} فاتورة مسجلة</p>
            </div>
            
            <div className="col-span-1 bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm relative">
                <p className="text-[11px] font-black text-slate-400 uppercase mb-2">ما تم سداده للموردين</p>
                <p className="text-xl md:text-2xl font-black text-emerald-500 font-mono mb-3 truncate">{paid.toLocaleString()}</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${paymentRate}%` }}></div>
                </div>
            </div>
            
            <div className="col-span-1 bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm relative">
                <p className="text-[11px] font-black text-slate-400 uppercase mb-2">ديون مستحقة للموردين</p>
                <p className="text-xl md:text-2xl font-black text-rose-500 font-mono mb-1 truncate">{pending.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-rose-400"><i className="fas fa-clock ml-1"></i> قيد السداد</p>
            </div>
        </div>
    );
};