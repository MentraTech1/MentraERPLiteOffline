// المسار: pages/profit_report.js
window.Module_ProfitReport = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            try {
                const filesToLoad = [
                    'components/ProfitReport/ProfitReportHeader.js',
                    'components/ProfitReport/ProfitReportKPIs.js',
                    'components/ProfitReport/ProfitReportInsight.js',
                    'components/ProfitReport/ProfitReportTransactions.js',
                    'components/ProfitReport/Module_ProfitReport_Container.js'
                ];

                for (const file of filesToLoad) {
                    if (file.includes('ProfitReportHeader') && window.ProfitReportHeader) continue;
                    if (file.includes('ProfitReportKPIs') && window.ProfitReportKPIs) continue;
                    if (file.includes('ProfitReportInsight') && window.ProfitReportInsight) continue;
                    if (file.includes('ProfitReportTransactions') && window.ProfitReportTransactions) continue;
                    if (file.includes('Module_ProfitReport_Container') && window.Module_ProfitReport_Container) continue;

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
                console.error("Profit Report Module Load Error:", err);
                setError(err.message);
            }
        };

        loadComponents();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-rose-50 rounded-3xl border border-rose-200 animate-view text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-rose-500 mb-4 animate-bounce"></i>
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل تقرير الأرباح:</span>
                <span className="text-rose-500 mt-2 text-sm font-mono">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_ProfitReport_Container) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">جاري تحليل الأرباح والسيولة...</p>
            </div>
        );
    }

    return React.createElement(window.Module_ProfitReport_Container, props);
};