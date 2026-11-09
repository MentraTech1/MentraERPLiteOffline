// المسار: components/SystemInfo/SystemInfoUpsell.js
window.SystemInfoUpsell = function() {
    return (
        <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-blue-900 rounded-[2rem] p-1 shadow-lg animate-view" style={{ animationDelay: '0.5s' }}>
            <div className="bg-white/5 backdrop-blur-md rounded-[1.8rem] p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4 text-center md:text-right">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-white text-xl md:text-2xl shadow-lg shrink-0">
                        <i className="fas fa-cloud"></i>
                    </div>
                    <div>
                        <h4 className="text-white font-black text-sm md:text-base mb-1">هل تمتلك أكثر من فرع؟</h4>
                        <p className="text-blue-200/80 text-[10px] md:text-[11px] font-bold leading-relaxed max-w-sm">
                            النسخة السحابية <span className="text-blue-400">Mentra Business</span> تدعم ربط الفروع، الموبايلات، والمزامنة السحابية اللحظية.
                        </p>
                    </div>
                </div>
                <a href="https://wa.me/201211934816" target="_blank" className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-5 py-3.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 group active:scale-95">
                    <i className="fab fa-whatsapp text-lg text-emerald-400 group-hover:scale-110 transition-transform"></i> تواصل للمبيعات
                </a>
            </div>
        </div>
    );
};