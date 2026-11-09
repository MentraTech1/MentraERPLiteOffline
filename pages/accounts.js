// المسار: pages/accounts.js
window.Module_Accounts = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            try {
                const filesToLoad = [
                    'components/Accounts/AccountsStats.js',
                    'components/Accounts/AccountsFilter.js',
                    'components/Accounts/AccountsList.js',
                    'components/Accounts/AccountsModal.js',
                    'components/Accounts/Module_Accounts_Container.js'
                ];

                for (const file of filesToLoad) {
                    if (file.includes('AccountsStats') && window.AccountsStats) continue;
                    if (file.includes('AccountsFilter') && window.AccountsFilter) continue;
                    if (file.includes('AccountsList') && window.AccountsList) continue;
                    if (file.includes('AccountsModal') && window.AccountsModal) continue;
                    if (file.includes('Module_Accounts_Container') && window.Module_Accounts_Container) continue;

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
                console.error("Accounts Module Load Error:", err);
                setError(err.message);
            }
        };

        loadComponents();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-rose-50 rounded-3xl border border-rose-200 animate-view text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-rose-500 mb-4 animate-bounce"></i>
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل الدليل المحاسبي:</span>
                <span className="text-rose-500 mt-2 text-sm font-mono">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_Accounts_Container) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">جاري تجهيز شجرة الحسابات...</p>
            </div>
        );
    }

    return React.createElement(window.Module_Accounts_Container, props);
};