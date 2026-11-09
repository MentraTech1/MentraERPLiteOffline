// المسار: components/Settings/SettingsExcelImport.js
window.SettingsExcelImport = function({ getDB }) {
    const { useState, useRef } = React;
    const fileRef = useRef(null);
    
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');

    // دالة لتحميل قالب فارغ منسق مسبقاً
    const handleDownloadTemplate = () => {
        if (!window.XLSX) return window.Swal.fire('خطأ', 'مكتبة الإكسيل غير محملة', 'error');
        
        const templateData = [
            {
                "اسم الصنف": "مثال: مكرونة حواء 400 جم",
                "الباركود": "123456789",
                "التصنيف": "بقوليات",
                "التكلفة": 10,
                "سعر البيع": 12,
                "الكمية الافتتاحية": 100
            }
        ];
        
        const ws = window.XLSX.utils.json_to_sheet(templateData);
        if(!ws['!views']) ws['!views'] = [];
        ws['!views'].push({ rightToLeft: true }); // لضبط الاتجاه من اليمين لليسار في الإكسيل
        
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "المنتجات");
        window.XLSX.writeFile(wb, "قالب_رفع_المنتجات_Mentra.xlsx");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'xlsx' && ext !== 'xls') {
            window.Swal.fire({ 
                icon: 'error', 
                title: 'صيغة غير مدعومة', 
                text: 'يرجى رفع ملف بصيغة إكسيل (xlsx أو xls فقط)', 
                customClass: { popup: 'rounded-3xl' } 
            });
            fileRef.current.value = '';
            return;
        }

        processExcelFile(file);
    };

    const processExcelFile = (file) => {
        setIsUploading(true);
        setProgress(5);
        setStatusText('جاري قراءة الملف...');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = window.XLSX.read(data, { type: 'array' });
                
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                if (jsonData.length === 0) {
                    throw new Error("الملف فارغ، لا توجد بيانات للرفع.");
                }

                setStatusText('جاري تجهيز وتنسيق البيانات...');
                setProgress(15);

                const productsToProcess = [];
                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    
                    const nameAr = row['اسم الصنف'] || row['اسم المنتج'] || row['الاسم'] || row['Name'] || '';
                    if (!nameAr || String(nameAr).trim() === '') continue; // تجاهل الصفوف الفارغة

                    productsToProcess.push({
                        name_ar: String(nameAr).trim(),
                        sku: String(row['الباركود'] || row['الكود'] || row['Barcode'] || '').trim(),
                        category: String(row['التصنيف'] || row['القسم'] || row['Category'] || 'عام').trim(),
                        cost: Number(row['التكلفة'] || row['تكلفة'] || row['Cost']) || 0,
                        price: Number(row['سعر البيع'] || row['السعر'] || row['Price']) || 0,
                        stock_qty: Number(row['الكمية الافتتاحية'] || row['الكمية'] || row['Stock'] || row['Qty']) || 0
                    });
                }

                if (productsToProcess.length === 0) {
                    throw new Error("لم يتم العثور على عمود باسم 'اسم الصنف'، يرجى استخدام القالب المرفق.");
                }

                // تنفيذ الرفع والتحديث الذكي
                saveToDatabaseSmartly(productsToProcess);

            } catch (err) {
                console.error(err);
                setIsUploading(false);
                setProgress(0);
                if (fileRef.current) fileRef.current.value = '';
                window.Swal.fire({ icon: 'error', title: 'فشل قراءة الملف', text: err.message, customClass: { popup: 'rounded-3xl' } });
            }
        };

        reader.readAsArrayBuffer(file);
    };

    // معالجة البيانات بنظام الدفعات (Lazy Chunks) مع التحديث والإضافة
    const saveToDatabaseSmartly = async (productsArray) => {
        const db = getDB();
        const totalItems = productsArray.length;
        const chunkSize = 400; // معالجة 400 صنف في كل دفعة
        let processedCount = 0;
        let addedCount = 0;
        let updatedCount = 0;

        try {
            setStatusText('جاري فحص الأصناف المسجلة مسبقاً بالمخزن...');
            
            // جلب خريطة المنتجات الحالية للمقارنة السريعة
            const existingProducts = await db.products.toArray();
            const skuMap = new Map();
            const nameMap = new Map();

            existingProducts.forEach(p => {
                if (p.sku && String(p.sku).trim()) {
                    skuMap.set(String(p.sku).trim().toLowerCase(), p.id);
                }
                if (p.name_ar && String(p.name_ar).trim()) {
                    nameMap.set(String(p.name_ar).trim().toLowerCase(), p.id);
                }
            });

            for (let i = 0; i < totalItems; i += chunkSize) {
                const chunk = productsArray.slice(i, i + chunkSize);
                const toAdd = [];
                const toUpdate = [];

                for (const item of chunk) {
                    const cleanSku = item.sku ? item.sku.toLowerCase() : '';
                    const cleanName = item.name_ar.toLowerCase();

                    // مطابقة الصنف إما بالباركود أولاً أو بالاسم
                    let existingId = null;
                    if (cleanSku && skuMap.has(cleanSku)) {
                        existingId = skuMap.get(cleanSku);
                    } else if (nameMap.has(cleanName)) {
                        existingId = nameMap.get(cleanName);
                    }

                    if (existingId) {
                        // تحديث الصنف الحالي
                        toUpdate.push({ ...item, id: existingId });
                        updatedCount++;
                    } else {
                        // صنف جديد كلياً
                        toAdd.push(item);
                        addedCount++;
                    }
                }

                // تنفيذ العمليات للدفعة الحالية داخل Transaction آمن
                await db.transaction('rw', db.products, async () => {
                    if (toUpdate.length > 0) {
                        await db.products.bulkPut(toUpdate);
                    }
                    if (toAdd.length > 0) {
                        const newIds = await db.products.bulkAdd(toAdd, { allKeys: true });
                        // تحديث الخريطة الحالية لتفادي التكرار داخل نفس شيت الإكسيل
                        toAdd.forEach((item, idx) => {
                            const newId = newIds[idx];
                            if (item.sku) skuMap.set(item.sku.toLowerCase(), newId);
                            if (item.name_ar) nameMap.set(item.name_ar.toLowerCase(), newId);
                        });
                    }
                });

                processedCount += chunk.length;
                const percent = Math.floor(20 + ((processedCount / totalItems) * 80));
                setProgress(percent);
                setStatusText('تمت معالجة ' + processedCount + ' من أصل ' + totalItems + ' صنف...');

                // استراحة خفيفة جداً لكي لا يتجمد المتصفح ويسمح للـ Progress Bar بالحركة
                await new Promise(resolve => setTimeout(resolve, 40));
            }

            setIsUploading(false);
            if (fileRef.current) fileRef.current.value = '';

            window.Swal.fire({
                icon: 'success',
                title: 'اكتملت العملية بنجاح!',
                html: `
                    <div class="text-right text-sm space-y-2 mt-2">
                        <p class="text-slate-600 font-bold">تمت معالجة <b class="text-slate-800">${totalItems}</b> صنف بالكامل:</p>
                        <div class="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 font-bold flex justify-between items-center">
                            <span>أصناف جديدة تمت إضافتها:</span>
                            <span class="font-mono text-base font-black">${addedCount}</span>
                        </div>
                        <div class="bg-blue-50 text-blue-700 p-3 rounded-xl border border-blue-100 font-bold flex justify-between items-center">
                            <span>أصناف سابقة تم تحديث بياناتها:</span>
                            <span class="font-mono text-base font-black">${updatedCount}</span>
                        </div>
                    </div>
                `,
                confirmButtonColor: '#10b981',
                confirmButtonText: 'حسناً',
                customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold px-6 py-2.5' }
            });

        } catch (dbErr) {
            console.error("Bulk Upsert Error:", dbErr);
            setIsUploading(false);
            if (fileRef.current) fileRef.current.value = '';
            window.Swal.fire({ icon: 'error', title: 'خطأ أثناء الحفظ', text: 'حدث خطأ في قاعدة البيانات أثناء حفظ البيانات.', customClass: { popup: 'rounded-3xl' } });
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-view">
            
            {/* الهيدر الخاص بالشاشة */}
            <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                        <i className="fas fa-file-excel text-emerald-500"></i> استيراد وتحديث المنتجات
                    </h2>
                    <p className="text-xs font-bold text-slate-500 mt-2">
                        ارفع آلاف المنتجات بضغطة زر واحدة مع ميزة التحديث التلقائي للأصناف المسجلة مسبقاً.
                    </p>
                </div>
                <button onClick={handleDownloadTemplate} className="w-full md:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shrink-0 border border-slate-200 active:scale-95">
                    <i className="fas fa-download"></i> تحميل قالب الإكسيل
                </button>
            </div>

            {/* منطقة التعليمات ورفع الملف */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* التعليمات */}
                <div className="bg-blue-50/50 p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-blue-100 relative overflow-hidden h-full">
                    <i className="fas fa-info-circle absolute -left-8 -top-8 text-9xl text-blue-500/5"></i>
                    <h3 className="font-black text-blue-800 mb-5 flex items-center gap-2 relative z-10">
                        <i className="fas fa-list-check"></i> تعليمات هامة قبل الرفع:
                    </h3>
                    <ul className="space-y-4 text-sm font-bold text-slate-700 relative z-10">
                        <li className="flex items-start gap-3">
                            <i className="fas fa-check-circle text-blue-500 mt-0.5 text-base"></i>
                            <span>استخدم <b>القالب المرفق</b> لتفادي أي أخطاء، أو تأكد من مطابقة أسماء الأعمدة في ملفك الخاص.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <i className="fas fa-arrows-rotate text-blue-500 mt-0.5 text-base"></i>
                            <span><b>تحديث تلقائي:</b> إذا كان الباركود أو اسم الصنف موجوداً مسبقاً، سيتم تحديث أسعاره ومخزونه تلقائياً دون تكرار.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <i className="fas fa-check-circle text-blue-500 mt-0.5 text-base"></i>
                            <span>العمود الإجباري الوحيد هو <span className="bg-white px-2 py-0.5 rounded text-blue-700 border border-blue-100 mx-1">اسم الصنف</span>، وباقي الأعمدة افتراضياً تكون (صفر).</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <i className="fas fa-check-circle text-blue-500 mt-0.5 text-base"></i>
                            <span>يرجى تجنب ترك صفوف فارغة بين الأصناف داخل ملف الإكسيل.</span>
                        </li>
                    </ul>
                </div>

                {/* منطقة الرفع */}
                <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center relative">
                    
                    {!isUploading ? (
                        <div>
                            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner mx-auto">
                                <i className="fas fa-cloud-upload-alt"></i>
                            </div>
                            <h3 className="text-lg font-black text-slate-800 mb-2">ارفع ملف الإكسيل هنا</h3>
                            <p className="text-xs font-bold text-slate-400 mb-8 max-w-[260px] mx-auto">
                                يدعم الصيغ (XLSX, XLS). يمكنك رفع ملف يحتوي على أكثر من 10,000 صنف دفعة واحدة.
                            </p>
                            
                            <input 
                                type="file" 
                                ref={fileRef}
                                accept=".xlsx, .xls" 
                                onChange={handleFileChange}
                                className="hidden" 
                                id="excel-upload-input"
                            />
                            <label 
                                htmlFor="excel-upload-input" 
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-sm shadow-lg shadow-emerald-500/30 cursor-pointer active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-file-import"></i> اختيار ملف الإكسيل
                            </label>
                        </div>
                    ) : (
                        /* شريط تقدم الرفع بدون مشاكل Escape */
                        <div className="w-full px-4 py-8 animate-view">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                                <i className="fas fa-sync-alt fa-spin"></i>
                            </div>
                            <h3 className="text-lg font-black text-slate-800 mb-2">{statusText}</h3>
                            <p className="text-xs font-bold text-slate-400 mb-6">يرجى الانتظار حتى اكتمال المعالجة</p>
                            
                            <div className="w-full bg-slate-100 rounded-full h-3 md:h-4 overflow-hidden shadow-inner">
                                <div 
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out flex items-center justify-center text-[9px] text-white font-black"
                                    style={{ width: progress + '%' }}
                                >
                                    {progress > 10 ? progress + '%' : ''}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
};