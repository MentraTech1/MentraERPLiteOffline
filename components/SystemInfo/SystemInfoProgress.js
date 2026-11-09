window.SystemInfoProgress = function({ isVisible, status, percent, details }) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-[90%] max-w-md rounded-[2rem] p-8 shadow-2xl animate-slideUp border border-slate-100">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className={`fas text-3xl ${percent === 100 ? 'fa-check-circle text-emerald-500' : 'fa-sync fa-spin'}`}></i>
                    </div>
                    <h3 className="text-lg font-black text-slate-800">{status || 'جاري المعالجة...'}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">{details}</p>
                </div>
                
                <div className="relative">
                    <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">التقدم</span>
                        <span className="text-xs font-black text-blue-600">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-300 ease-out" style={{ width: `${percent}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};