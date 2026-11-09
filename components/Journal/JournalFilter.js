// المسار: components/Journal/JournalFilter.js
window.JournalFilter = function({ filters, onFilterApply, onFilterReset, onAddClick }) {
    const { useState, useEffect } = React;
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => { setLocalFilters(filters); }, [filters]);

    return (
        <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-4 animate-view mb-6" style={{ animationDelay: '0.2s' }}>
            
            {/* فلتر التاريخ */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 w-full xl:w-auto flex-1">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 flex-1 md:flex-none">
                    <span className="text-[10px] font-black text-slate-400">من</span>
                    <input 
                        type="date" 
                        value={localFilters.startDate} 
                        onChange={e => setLocalFilters({...localFilters, startDate: e.target.value})}
                        className="bg-transparent border-none text-xs font-bold outline-none text-slate-700 w-full" 
                    />
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 flex-1 md:flex-none">
                    <span className="text-[10px] font-black text-slate-400">إلى</span>
                    <input 
                        type="date" 
                        value={localFilters.endDate} 
                        onChange={e => setLocalFilters({...localFilters, endDate: e.target.value})}
                        className="bg-transparent border-none text-xs font-bold outline-none text-slate-700 w-full" 
                    />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <button onClick={() => onFilterApply(localFilters)} className="flex-1 md:flex-none bg-slate-800 text-white px-5 py-2.5 rounded-lg text-xs font-black hover:bg-blue-600 active:scale-95 transition-all shadow-sm">تطبيق</button>
                    <button onClick={onFilterReset} className="flex-1 md:flex-none bg-white text-slate-500 border border-slate-200 px-5 py-2.5 rounded-lg text-xs font-black hover:bg-slate-100 active:scale-95 transition-all">الكل</button>
                </div>
            </div>

            {/* زر إضافة قيد */}
            <button onClick={onAddClick} className="w-full xl:w-auto bg-blue-600 text-white py-3.5 px-6 rounded-xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-2 shrink-0">
                <i className="fas fa-plus"></i> قيد محاسبي جديد
            </button>
        </div>
    );
};