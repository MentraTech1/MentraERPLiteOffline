window.SystemInfoHeader = function() {
    return (
        <div className="relative overflow-hidden bg-[#0b1120] rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-800">
            {/* تأثيرات إضاءة خلفية */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                            <i className="fas fa-database text-blue-400 text-lg"></i>
                        </div>
                        <span className="text-blue-400 text-xs font-black uppercase tracking-widest">مركز حماية البيانات</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">النظام والنسخ الاحتياطي</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="bg-slate-800/50 text-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-black border border-slate-700 backdrop-blur-sm"><i className="fas fa-lock text-emerald-400 mr-1"></i> تشفير AES-256</span>
                        <span className="bg-slate-800/50 text-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-black border border-slate-700 backdrop-blur-sm"><i className="fas fa-compress-arrows-alt text-blue-400 mr-1"></i> ضغط آلي</span>
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-black border border-emerald-500/20 backdrop-blur-sm animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> النظام يعمل بشكل سليم
                        </span>
                    </div>
                </div>
                
                <i className="fas fa-server text-[8rem] text-white/5 rotate-12 md:-mr-10"></i>
            </div>
        </div>
    );
};