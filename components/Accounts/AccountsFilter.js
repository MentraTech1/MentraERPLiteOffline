// المسار: components/Accounts/AccountsFilter.js
window.AccountsFilter = function({ searchTerm, onSearchChange, onAddClick }) {
    return (
        <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 animate-view mb-6" style={{ animationDelay: '0.2s' }}>
            
            <div className="relative w-full md:flex-1">
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <i className="fas fa-search text-slate-400"></i>
                </div>
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="ابحث باسم الحساب، الكود، أو التصنيف..." 
                    className="w-full bg-slate-50 py-3.5 pr-12 pl-4 rounded-xl outline-none font-bold text-sm text-slate-700 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
            </div>
            
            <button onClick={onAddClick} className="w-full md:w-auto bg-blue-600 text-white py-3.5 px-6 rounded-xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-2 shrink-0">
                <i className="fas fa-plus"></i> إضافة حساب جديد
            </button>
            
        </div>
    );
};