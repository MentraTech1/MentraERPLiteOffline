// المسار: pages/inventory.js
window.Module_Inventory = function(props) {
    const { useState, useEffect } = React;
    const [componentsLoaded, setComponentsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadComponents = async () => {
            try {
                const filesToLoad = [
                    'components/Inventory/InventoryHeader.js',
                    'components/Inventory/InventoryStats.js',
                    'components/Inventory/InventoryFilterSearch.js',
                    'components/Inventory/InventoryList.js',
                    'components/Inventory/InventoryModal.js',
                    'components/Inventory/Module_Inventory_Container.js'
                ];

                for (const file of filesToLoad) {
                    if (file.includes('InventoryHeader') && window.InventoryHeader) continue;
                    if (file.includes('InventoryStats') && window.InventoryStats) continue;
                    if (file.includes('InventoryFilterSearch') && window.InventoryFilterSearch) continue;
                    if (file.includes('InventoryList') && window.InventoryList) continue;
                    if (file.includes('InventoryModal') && window.InventoryModal) continue;
                    if (file.includes('Module_Inventory_Container') && window.Module_Inventory_Container) continue;

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
                console.error("Inventory Module Load Error:", err);
                setError(err.message);
            }
        };

        loadComponents();
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-rose-50 rounded-3xl border border-rose-200 animate-view text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-rose-500 mb-4 animate-bounce"></i>
                <span className="text-rose-700 font-bold text-lg">خطأ في تحميل شاشة المخازن:</span>
                <span className="text-rose-500 mt-2 text-sm font-mono">{error}</span>
            </div>
        );
    }

    if (!componentsLoaded || !window.Module_Inventory_Container) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">جاري تجهيز بيانات المخزن...</p>
            </div>
        );
    }

    return React.createElement(window.Module_Inventory_Container, props);
};