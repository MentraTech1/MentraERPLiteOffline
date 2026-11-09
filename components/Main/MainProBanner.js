// المسار: components/Main/MainProBanner.js
window.MainProBanner = function() {
    return (
        <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-blue-900 rounded-[1.5rem] md:rounded-[2rem] p-1.5 shadow-lg mt-2 animate-view" style={{ animationDelay: '0.3s' }}>
            <div className="bg-white/5 backdrop-blur-md rounded-[1.2rem] md:rounded-[1.7rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-5">
                <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 text-center sm:text-right">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl md:rounded-[1.2rem] flex items-center justify-center text-white text-2xl shadow-lg shrink-0">
                        <i className="fas fa-cloud"></i>
                    </div>
                    <div>
                        <h4 className="text-white font-black text-sm md:text-base mb-1">هل تبحث عن نظام يدعم تعدد الفروع والأجهزة؟</h4>
                        <p className="text-blue-200/80 text-[10px] md:text-xs font-bold leading-relaxed max-w-md">
                            قم بالترقية للنسخة السحابية <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] mx-1 uppercase tracking-wider">Pro</span> للحصول على مزامنة لحظية، جرد بالباركود، وصلاحيات.
                        </p>
                    </div>
                </div>
                <a href="https://wa.me/201211934816" target="_blank" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-5 md:px-6 py-3.5 rounded-xl font-black text-xs md:text-sm transition-all active:scale-95 shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 whitespace-nowrap">
                    <i className="fab fa-whatsapp text-lg md:text-xl"></i> تواصل مع المبيعات
                </a>
            </div>
        </div>
    );
};