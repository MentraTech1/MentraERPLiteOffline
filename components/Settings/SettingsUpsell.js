// المسار: components/Settings/SettingsUpsell.js
window.SettingsUpsell = function() {
    return (
        <div className="bg-[#0f172a] rounded-[2rem] p-1.5 shadow-xl relative overflow-hidden group animate-view" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="bg-slate-900/80 backdrop-blur-md rounded-[1.7rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 border border-white/5">
                <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-right">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-blue-500/20 shrink-0 transform -rotate-6 group-hover:rotate-0 transition-transform">
                        <i className="fas fa-cloud"></i>
                    </div>
                    <div>
                        <h4 className="text-white font-black text-base md:text-lg mb-1 flex items-center justify-center md:justify-start gap-2">
                            النسخة السحابية الاحترافية <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Pro</span>
                        </h4>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed max-w-md">
                            انتقل إلى مستوى أعلى! إمكانية ربط أجهزة متعددة، تطبيق موبايل خاص، جرد بالباركود، وصلاحيات للموظفين.
                        </p>
                    </div>
                </div>
                <a href="https://wa.me/201211934816" target="_blank" className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 rounded-xl font-black text-sm transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
                    <i className="fab fa-whatsapp text-xl"></i> تواصل مع المبيعات
                </a>
            </div>
        </div>
    );
};