// المسار: components/Settings/SettingsHeader.js
window.SettingsHeader = function() {
    return (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden animate-view">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
            <div className="relative z-10 text-center md:text-right w-full md:w-auto">
                <h2 className="text-2xl md:text-3xl font-black mb-2">إعدادات النظام</h2>
                <p className="text-emerald-100 text-sm font-bold opacity-90"><i className="fas fa-shield-alt ml-1"></i> تحكم كامل في بياناتك وصلاحياتك محلياً</p>
            </div>
            <div className="bg-white/10 border border-white/20 px-6 py-4 rounded-3xl backdrop-blur-xl text-center shrink-0">
                <p className="text-[10px] uppercase font-black text-emerald-100 mb-1 tracking-widest">نوع النسخة</p>
                <p className="font-black text-lg text-white"><i className="fas fa-laptop-house ml-1"></i> Local Lite</p>
            </div>
        </div>
    );
};