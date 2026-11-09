// المسار: pages/journal.js
window.Module_Journal = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            try {
                const filesToLoad = [
                    'components/Journal/JournalStats.js',
                    'components/Journal/JournalFilter.js',
                    'components/Journal/JournalList.js',
                    'components/Journal/JournalModal.js',
                    'components/Journal/ExpenseList.js',     // ملف جديد
                    'components/Journal/ExpenseModal.js',    // ملف جديد
                    'components/Journal/Module_Journal_Container.js'
                ];

                for (const file of filesToLoad) {
                    if (file.includes('JournalStats') && window.JournalStats) continue;
                    if (file.includes('JournalFilter') && window.JournalFilter) continue;
                    if (file.includes('JournalList') && window.JournalList) continue;
                    if (file.includes('JournalModal') && window.JournalModal) continue;
                    if (file.includes('ExpenseList') && window.ExpenseList) continue;
                    if (file.includes('ExpenseModal') && window.ExpenseModal) continue;
                    if (file.includes('Module_Journal_Container') && window.Module_Journal_Container) continue;

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
                console.error("Journal Module Load Error:", err);
                setError(err.message);
            }
        };

        loadComponents();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-rose-50 rounded-3xl border border-rose-200 animate-view text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-rose-500 mb-4 animate-bounce"></i>
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل القيود المحاسبية:</span>
                <span className="text-rose-500 mt-2 text-sm font-mono">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_Journal_Container) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">جاري فحص القيود والدفاتر...</p>
            </div>
        );
    }

    return React.createElement(window.Module_Journal_Container, props);
};