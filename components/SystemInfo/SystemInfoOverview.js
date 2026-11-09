window.SystemInfoOverview = function({ counts }) {
    const cards = [
        { title: 'سجل المنتجات', dbName: 'products', icon: 'fa-boxes-stacked', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', key: 'products' },
        { title: 'الفواتير المُصدرة', dbName: 'invoices', icon: 'fa-file-invoice-dollar', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600', key: 'invoices' },
        { title: 'دليل الحسابات', dbName: 'accounts', icon: 'fa-users-cog', color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600', key: 'accounts' },
        { title: 'القيود المحاسبية', dbName: 'journal', icon: 'fa-book-open', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600', key: 'journal' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <div key={card.key} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group animate-view" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 ${card.bg} ${card.text} rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-300`}>
                            <i className={`fas ${card.icon}`}></i>
                        </div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider">{card.dbName}</span>
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-500 mb-1">{card.title}</h4>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-800">{(counts[card.key] || 0).toLocaleString()}</span>
                            <span className="text-[9px] font-bold text-slate-400">سجل</span>
                        </div>
                    </div>
                    {/* شريط ديكور سفلي */}
                    <div className={`absolute bottom-0 left-0 h-1 w-0 bg-${card.color}-500 group-hover:w-full transition-all duration-500`}></div>
                </div>
            ))}
        </div>
    );
};