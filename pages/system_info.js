// المسار: pages/system_info.js
window.Module_SystemInfo = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            try {
                const filesToLoad = [
                    'components/SystemInfo/SystemInfoHeader.js',
                    'components/SystemInfo/SystemInfoProgress.js',
                    'components/SystemInfo/SystemInfoOverview.js',
                    'components/SystemInfo/SystemInfoAdvancedOps.js',
                    'components/SystemInfo/SystemInfoHistory.js',
                    'components/SystemInfo/SystemInfoLegacyOps.js',
                    'components/SystemInfo/SystemInfoUpsell.js',
                    'components/SystemInfo/Module_SystemInfo_Container.js'
                ];

                for (const file of filesToLoad) {
                    if (file.includes('SystemInfoHeader') && window.SystemInfoHeader) continue;
                    if (file.includes('SystemInfoProgress') && window.SystemInfoProgress) continue;
                    if (file.includes('SystemInfoOverview') && window.SystemInfoOverview) continue;
                    if (file.includes('SystemInfoAdvancedOps') && window.SystemInfoAdvancedOps) continue;
                    if (file.includes('SystemInfoHistory') && window.SystemInfoHistory) continue;
                    if (file.includes('SystemInfoLegacyOps') && window.SystemInfoLegacyOps) continue;
                    if (file.includes('SystemInfoUpsell') && window.SystemInfoUpsell) continue;
                    if (file.includes('Module_SystemInfo_Container') && window.Module_SystemInfo_Container) continue;

                    const res = await fetch(`${file}?v=${Date.now()}`);
                    if (!res.ok) throw new Error(`تعذر تحميل الملف: ${file}`);
                    
                    const rawScript = await res.text();
                    const compiled = window.Babel ? window.Babel.transform(rawScript, { presets: ['react'] }).code : rawScript;
                    
                    const scriptEl = document.createElement('script');
                    scriptEl.text = compiled;
                    document.body.appendChild(scriptEl);
                }
                setComponentsLoaded(true);
            } catch (err) {
                console.error("System Info Module Load Error:", err);
                setError(err.message);
            }
        };

        loadComponents();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-rose-50 rounded-3xl border border-rose-200 animate-view text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-rose-500 mb-4 animate-bounce"></i>
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل بيانات النظام:</span>
                <span className="text-rose-500 mt-2 text-sm font-mono">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_SystemInfo_Container) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">جاري تجهيز مركز الأمان...</p>
            </div>
        );
    }

    return React.createElement(window.Module_SystemInfo_Container, props);
};