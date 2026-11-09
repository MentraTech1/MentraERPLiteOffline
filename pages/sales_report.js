
// المسار: pages/sales_report.js
window.Module_SalesReport = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            try {
                const filesToLoad = [
                    'components/SalesReport/SalesReportHeader.js',
                    'components/SalesReport/SalesReportStats.js',
                    'components/SalesReport/SalesReportFilter.js',
                    'components/SalesReport/SalesReportList.js',
                    'components/SalesReport/SalesReportDetails.js',
                    'components/SalesReport/Module_SalesReport_Container.js'
                ];

                for (const file of filesToLoad) {
                    if (file.includes('SalesReportHeader') && window.SalesReportHeader) continue;
                    if (file.includes('SalesReportStats') && window.SalesReportStats) continue;
                    if (file.includes('SalesReportFilter') && window.SalesReportFilter) continue;
                    if (file.includes('SalesReportList') && window.SalesReportList) continue;
                    if (file.includes('SalesReportDetails') && window.SalesReportDetails) continue;
                    if (file.includes('Container') && window.Module_SalesReport_Container) continue;

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
                console.error("Sales Report Module Load Error:", err);
                setError(err.message);
            }
        };

        loadComponents();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-rose-50 rounded-3xl border border-rose-200 animate-view text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-rose-500 mb-4 animate-bounce"></i>
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل سجل المبيعات:</span>
                <span className="text-rose-500 mt-2 text-sm font-mono">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_SalesReport_Container) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">جاري تجهيز سجل المبيعات...</p>
            </div>
        );
    }

    return React.createElement(window.Module_SalesReport_Container, props);
};