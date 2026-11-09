// المسار: components/Inventory/Module_Inventory_Container.js
window.Module_Inventory_Container = function() {
    const { useState, useEffect, useMemo, useRef } = React;
    const { InventoryHeader, InventoryStats, InventoryFilterSearch, InventoryList, InventoryModal } = window;

    const containerRef = useRef(null);

    // States
    const [allProducts, setAllProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, low, out
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3; // تم زيادة العدد ليتناسب مع الشاشة 
    
    // View States بدلاً من Modal
    const [activeView, setActiveView] = useState('list'); // 'list' or 'form'
    const [editingProduct, setEditingProduct] = useState(null);

    // حل مشكلة تجميد الكيبورد
    useEffect(() => {
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur(); 
        }
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, [activeView]);

    const fetchData = async () => {
        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({ products: '++id, name_ar, sku, category, stock_qty, price, cost', stock_movements: '++id, product_id, type, qty, date, ref_id' });
            
            const products = await db.products.reverse().toArray();
            setAllProducts(products);
        } catch (e) { console.error("Fetch Error:", e); }
    };

    useEffect(() => { fetchData(); }, []);

    // Filter & Search Logic
    const filteredProducts = useMemo(() => {
        let result = [...allProducts];
        
        if (filter === 'low') result = result.filter(p => Number(p.stock_qty) > 0 && Number(p.stock_qty) <= 5);
        if (filter === 'out') result = result.filter(p => Number(p.stock_qty) <= 0);

        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            result = result.filter(p => 
                p.name_ar.toLowerCase().includes(query) || 
                (p.sku && p.sku.toLowerCase().includes(query)) ||
                (p.category && p.category.toLowerCase().includes(query))
            );
        }
        return result;
    }, [allProducts, filter, searchTerm]);

    // Reset page on filter/search change
    useEffect(() => { setCurrentPage(1); }, [filter, searchTerm]);

    // حل مشكلة حساب الإحصائيات للأرقام الكبيرة
    const stats = useMemo(() => {
        let totalValue = 0;
        let lowCount = 0;
        let outCount = 0;

        allProducts.forEach(p => {
            const qty = Number(p.stock_qty) || 0;
            const cost = Number(p.cost) || 0;
            
            totalValue += (qty * cost);

            if (qty <= 0) {
                outCount++;
            } else if (qty <= 5) {
                lowCount++;
            }
        });

        return {
            totalValue: totalValue,
            totalItems: allProducts.length,
            lowCount: lowCount,
            outCount: outCount
        };
    }, [allProducts]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Handlers
    const handleSaveProduct = async (formData) => {
        const newName = formData.name_ar.trim();
        
        const isDuplicate = allProducts.find(p => 
            p.name_ar.trim().toLowerCase() === newName.toLowerCase() && 
            p.id !== (editingProduct ? editingProduct.id : null)
        );

        if (isDuplicate) {
            window.Swal.fire({
                icon: 'error', title: 'الصنف مسجل مسبقاً!', text: 'يوجد صنف بهذا الاسم في المخزن، يرجى تغييره.',
                confirmButtonText: 'حسناً', confirmButtonColor: '#ef4444', customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold' }
            });
            return;
        }

        // إجبار تحويل القيم إلى أرقام لمنع أي أخطاء حسابية مستقبلاً
        const dataToSave = {
            name_ar: newName,
            sku: formData.sku,
            category: formData.category,
            stock_qty: Number(formData.stock_qty) || 0,
            price: Number(formData.price) || 0,
            cost: Number(formData.cost) || 0,
        };

        try {
            const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
            const db = new window.Dexie(dbName);
            db.version(4).stores({ products: '++id, name_ar, sku, category, stock_qty, price, cost' });

            if (editingProduct) {
                await db.products.update(editingProduct.id, dataToSave);
                window.Swal.fire({ icon: 'success', title: 'تم التعديل', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
            } else {
                await db.products.add(dataToSave);
                window.Swal.fire({ icon: 'success', title: 'تمت الإضافة', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
            }
            
            setActiveView('list');
            fetchData();
        } catch (e) { console.error(e); }
    };

    const handleDeleteProduct = async (id) => {
        const res = await window.Swal.fire({
            title: 'هل أنت متأكد؟', text: "لن تتمكن من التراجع عن الحذف!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
            confirmButtonText: 'نعم، احذف', cancelButtonText: 'إلغاء',
            customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' }
        });

        if (res.isConfirmed) {
            try {
                const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
                const db = new window.Dexie(dbName);
                db.version(4).stores({ products: '++id, name_ar, sku, category, stock_qty, price, cost' });
                
                await db.products.delete(id);
                fetchData();
                window.Swal.fire({ icon: 'success', title: 'تم الحذف', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
            } catch (e) { console.error(e); }
        }
    };

    const handleQuickAdd = async (product) => {
        const { value: qty } = await window.Swal.fire({
            title: 'إضافة رصيد للمخزن', text: product.name_ar, input: 'number',
            inputAttributes: { min: 1, step: 1 }, showCancelButton: true,
            confirmButtonText: 'إضافة', cancelButtonText: 'إلغاء', confirmButtonColor: '#3b82f6',
            customClass: { popup: 'rounded-3xl', input: 'rounded-xl text-center font-bold text-xl outline-none focus:border-blue-500', confirmButton: 'rounded-xl font-bold', cancelButton: 'rounded-xl font-bold' }
        });

        if (qty && !isNaN(qty) && qty > 0) {
            try {
                const dbName = localStorage.getItem('mentra_current_db') || 'MentraLocalCache';
                const db = new window.Dexie(dbName);
                db.version(4).stores({ products: '++id, name_ar, sku, category, stock_qty, price, cost', stock_movements: '++id, product_id, type, qty, date, ref_id' });
                
                const currentP = await db.products.get(product.id);
                await db.products.update(product.id, { stock_qty: (Number(currentP.stock_qty) || 0) + Number(qty) });
                await db.stock_movements.add({ product_id: product.id, type: 'in', qty: Number(qty), date: new Date().toISOString(), ref_id: 'إضافة سريعة' });
                
                fetchData();
                window.Swal.fire({ icon: 'success', title: 'تم تحديث الرصيد', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
            } catch (e) { console.error(e); }
        }
    };

    const exportExcel = () => {
        if(allProducts.length === 0 || !window.XLSX) return window.Swal.fire('تنبيه', 'لا يوجد بيانات لتصديرها', 'info');
        const data = allProducts.map(p => ({
            'الرقم التسلسلي': p.id, 'اسم الصنف': p.name_ar, 'الباركود': p.sku || 'بدون', 'التصنيف': p.category || 'عام',
            'سعر التكلفة (ج.م)': p.cost, 'سعر البيع (ج.م)': p.price, 'الكمية المتاحة': p.stock_qty, 'إجمالي التكلفة': (Number(p.cost) * Number(p.stock_qty)).toFixed(2)
        }));
        const ws = window.XLSX.utils.json_to_sheet(data);
        const wb = window.XLSX.utils.book_new();
        if(!ws['!views']) ws['!views'] = [];
        ws['!views'].push({ rightToLeft: true });
        window.XLSX.utils.book_append_sheet(wb, ws, "جرد المخزن");
        window.XLSX.writeFile(wb, `Inventory_Report_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`);
    };

    const printPDF = () => {
        if(allProducts.length === 0) return window.Swal.fire('تنبيه', 'لا يوجد بيانات لطباعتها', 'info');
        const date = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        let printWin = window.open('', '_blank');
        let html = `
            <!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>تقرير جرد المخزن</title><style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
            body { font-family: 'Cairo', sans-serif; padding: 20px; color: #1e293b; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: right; }
            th { background-color: #f1f5f9; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .summary { margin-top: 30px; display: flex; justify-content: space-between; background: #f1f5f9; padding: 15px; border-radius: 8px; font-weight: bold; }
            </style></head><body>
            <div class="header"><h1>تقرير جرد المخزن - Mentra ERP</h1><p>تاريخ التقرير: ${date}</p></div>
            <table><thead><tr><th width="5%">#</th><th width="30%">اسم الصنف</th><th width="15%">الباركود</th><th width="15%">التصنيف</th><th width="10%">التكلفة</th><th width="10%">البيع</th><th width="15%">الكمية</th></tr></thead>
            <tbody>${allProducts.map((p, i) => `<tr><td>${i + 1}</td><td><strong>${p.name_ar}</strong></td><td>${p.sku || '-'}</td><td>${p.category || '-'}</td><td>${p.cost}</td><td>${p.price}</td><td><span style="${Number(p.stock_qty) <= 5 ? 'color: red;' : ''}">${p.stock_qty}</span></td></tr>`).join('')}</tbody></table>
            <div class="summary"><span>إجمالي الأصناف: ${allProducts.length} صنف</span><span>إجمالي القيمة: ${stats.totalValue.toLocaleString()} ج.م</span></div>
            <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); }</script></body></html>
        `;
        printWin.document.write(html);
        printWin.document.close();
    };

    return (
        <div ref={containerRef} tabIndex="-1" className="pb-24 px-2 md:px-0 text-right font-sans outline-none" dir="rtl" style={{ WebkitTapHighlightColor: 'transparent' }}>
            
            {activeView === 'list' ? (
                <div className="animate-view">
                    <InventoryHeader 
                        onExportExcel={exportExcel} 
                        onExportPDF={printPDF} 
                        onAddProduct={() => { setEditingProduct(null); setActiveView('form'); }} 
                    />
                    
                    <InventoryStats stats={stats} />
                    
                    <InventoryFilterSearch 
                        filter={filter} onFilterChange={setFilter} 
                        searchTerm={searchTerm} onSearchChange={setSearchTerm} 
                    />
                    
                    <InventoryList 
                        products={paginatedProducts} 
                        currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}
                        onEdit={(p) => { setEditingProduct(p); setActiveView('form'); }}
                        onDelete={handleDeleteProduct}
                        onQuickAdd={handleQuickAdd}
                    />
                </div>
            ) : (
                <div className="animate-slideInRight">
                    <InventoryModal 
                        onClose={() => setActiveView('list')} 
                        onSave={handleSaveProduct} 
                        editingProduct={editingProduct} 
                    />
                </div>
            )}
            
        </div>
    );
};