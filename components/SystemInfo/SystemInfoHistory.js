// المسار: components/SystemInfo/SystemInfoHistory.js
window.SystemInfoHistory = function({ onRefreshHistory }) {
    return (
        <div className="bg-white rounded-[3.5rem] p-10 shadow-xl border border-slate-50 animate-view" style={{ animationDelay: '0.3s' }}>
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-4">
                    <span className="w-2 h-8 bg-amber-500 rounded-full"></span> سجل النسخ الاحتياطية
                </h3>
                <button 
                    onClick={onRefreshHistory} 
                    className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-black text-sm hover:bg-amber-200 transition-colors active:scale-95 flex items-center gap-2"
                >
                    <i className="fas fa-sync"></i> تحديث
                </button>
            </div>
            
            {/* الحاوية الأساسية - محرك backupFunctions.js يحقن الكروت بداخل هذا الـ ID */}
            <div id="backup-history-container" className="space-y-4 max-h-96 overflow-y-auto hide-scrollbar">
                <div className="text-center py-8 text-slate-400 font-bold text-xs">
                    جاري تحميل سجل النسخ الاحتياطية...
                </div>
            </div>
        </div>
    );
};