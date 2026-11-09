// المسار: pages/returns_log.js
window.Module_ReturnsLog = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            try {
                const filesToLoad = [
                    'components/ReturnsLog/ReturnsLogHeader.js',
                    'components/ReturnsLog/ReturnsLogStats.js',
                    'components/ReturnsLog/ReturnsLogFilter.js',
                    'components/ReturnsLog/ReturnsLogList.js',
                    'components/ReturnsLog/ReturnsLogDetails.js', 
                    'components/ReturnsLog/Module_ReturnsLog_Container.js'
                ];

                for (const file of filesToLoad) {
                    if (file.includes('ReturnsLogHeader') && window.ReturnsLogHeader) continue;
                    if (file.includes('ReturnsLogStats') && window.ReturnsLogStats) continue;
                    if (file.includes('ReturnsLogFilter') && window.ReturnsLogFilter) continue;
                    if (file.includes('ReturnsLogList') && window.ReturnsLogList) continue;
                    if (file.includes('ReturnsLogDetails') && window.ReturnsLogDetails) continue;
                    if (file.includes('Container') && window.Module_ReturnsLog_Container) continue;

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
                console.error("Returns Log Module Load Error:", err);
                setError(err.message);
            }
        };

        loadComponents();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-rose-50 rounded-3xl border border-rose-200 animate-view text-center m-4">
                <i className="fas fa-exclamation-triangle text-4xl text-rose-500 mb-4 animate-bounce"></i>
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل سجل المرتجعات:</span>
                <span className="text-rose-500 mt-2 text-sm font-mono">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_ReturnsLog_Container) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">جاري تجهيز سجل المرتجعات...</p>
            </div>
        );
    }

    return React.createElement(window.Module_ReturnsLog_Container, props);
};