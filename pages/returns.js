// المسار: pages/returns.js
window.Module_Returns = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            try {
                // قائمة المكونات الفرعية للشاشة
                const filesToLoad = [
                    'components/Returns/ReturnsSearch.js',
                    'components/Returns/ReturnsCart.js',
                    'components/Returns/ReturnsSummary.js',
                    'components/Returns/ReturnsScanner.js',
                    'components/Returns/Module_Returns_Container.js'
                ];

                for (const file of filesToLoad) {
                    if (file.includes('ReturnsSearch') && window.ReturnsSearch) continue;
                    if (file.includes('ReturnsCart') && window.ReturnsCart) continue;
                    if (file.includes('ReturnsSummary') && window.ReturnsSummary) continue;
                    if (file.includes('ReturnsScanner') && window.ReturnsScanner) continue;
                    if (file.includes('Module_Returns_Container') && window.Module_Returns_Container) continue;

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
                console.error("Returns Module Load Error:", err);
                setError(err.message);
            }
        };

        loadComponents();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-rose-50 rounded-3xl border border-rose-200 animate-view text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-rose-500 mb-4 animate-bounce"></i>
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل شاشة المرتجعات:</span>
                <span className="text-rose-500 mt-2 text-sm font-mono">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_Returns_Container) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">جاري تجهيز محرك المرتجعات...</p>
            </div>
        );
    }

    return React.createElement(window.Module_Returns_Container, props);
};