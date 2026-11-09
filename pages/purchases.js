
// المسار: pages/purchases.js
window.Module_Purchases = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            try {
                const filesToLoad = [
                    'components/Purchases/PurchasesHeader.js',
                    'components/Purchases/PurchasesSearch.js',
                    'components/Purchases/PurchasesInputCard.js',
                    'components/Purchases/PurchasesCart.js',
                    'components/Purchases/PurchasesBottomBar.js',
                    'components/Purchases/Module_Purchases_Container.js'
                ];

                for (const file of filesToLoad) {
                    if (file.includes('PurchasesHeader') && window.PurchasesHeader) continue;
                    if (file.includes('PurchasesSearch') && window.PurchasesSearch) continue;
                    if (file.includes('PurchasesInputCard') && window.PurchasesInputCard) continue;
                    if (file.includes('PurchasesCart') && window.PurchasesCart) continue;
                    if (file.includes('PurchasesBottomBar') && window.PurchasesBottomBar) continue;
                    if (file.includes('Module_Purchases_Container') && window.Module_Purchases_Container) continue;

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
                console.error("Purchases Module Load Error:", err);
                setError(err.message);
            }
        };

        loadComponents();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-rose-50 rounded-3xl border border-rose-200 animate-view text-center m-4">
                <i className="fas fa-exclamation-triangle text-4xl text-rose-500 mb-4 animate-bounce"></i>
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل شاشة المشتريات:</span>
                <span className="text-rose-500 mt-2 text-sm font-mono">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_Purchases_Container) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">جاري تجهيز محرك المشتريات...</p>
            </div>
        );
    }

    return React.createElement(window.Module_Purchases_Container, props);
};