// المسار: components/Settings/SettingsProfileForm.js
window.SettingsProfileForm = function({ formData, onChange, onSave, isSaving, onGenerateKey, isKeyVisible, setIsKeyVisible }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-view" style={{ animationDelay: '0.1s' }}>
            
            {/* العمود الأول: إعدادات المدير والحماية */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 h-full flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 mb-5 pb-3 border-b border-slate-50 flex items-center gap-2">
                        <i className="fas fa-user-shield text-indigo-500"></i> بيانات الدخول والحماية
                    </h3>
                    <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase px-1">الاسم الكامل (للعرض)</label>
                            <input type="text" value={formData.full_name} onChange={e => onChange('full_name', e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-sm border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase px-1">اسم المستخدم (للتسجيل)</label>
                            <input type="text" value={formData.username} onChange={e => onChange('username', e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-sm border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all" dir="ltr" />
                        </div>
                        
                        {/* مفتاح الأمان (الجديد) */}
                        <div className="mt-4 bg-violet-50/50 p-4 rounded-2xl border border-violet-100">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[11px] font-black text-violet-800 uppercase flex items-center gap-1"><i className="fas fa-key"></i> مفتاح الأمان</label>
                                {!formData.security_key && (
                                    <button type="button" onClick={onGenerateKey} className="text-[10px] bg-violet-600 text-white px-2 py-1 rounded-lg font-bold hover:bg-violet-700">توليد مفتاح</button>
                                )}
                            </div>
                            {formData.security_key ? (
                                <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-violet-200">
                                    <span className="flex-1 text-center font-black tracking-widest text-violet-700 text-sm">
                                        {isKeyVisible ? formData.security_key : '••••-••••-••••'}
                                    </span>
                                    <button type="button" onClick={() => setIsKeyVisible(!isKeyVisible)} className="text-violet-400 hover:text-violet-600 p-1">
                                        <i className={`fas ${isKeyVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs font-bold text-violet-500 text-center">لم تقم بتوليد مفتاح حماية بعد!</p>
                            )}
                        </div>

                        {/* قسم تغيير كلمة المرور */}
                        <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
                            <h4 className="text-xs font-black text-slate-600 flex items-center gap-2"><i className="fas fa-lock"></i> تغيير كلمة المرور (اختياري)</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="password" value={formData.password} onChange={e => onChange('password', e.target.value)} placeholder="الجديدة" className="w-full bg-slate-50 p-3 rounded-xl font-bold text-sm border border-slate-200 focus:border-indigo-500 outline-none text-center" />
                                <input type="password" value={formData.confirmPassword} onChange={e => onChange('confirmPassword', e.target.value)} placeholder="تأكيد الجديدة" className="w-full bg-slate-50 p-3 rounded-xl font-bold text-sm border border-slate-200 focus:border-indigo-500 outline-none text-center" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* العمود الثاني: إعدادات النشاط التجاري */}
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 h-full flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 mb-5 pb-3 border-b border-slate-50 flex items-center gap-2">
                        <i className="fas fa-store text-emerald-500"></i> بيانات النشاط التجاري (للفواتير)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase px-1">اسم النشاط / المتجر</label>
                            <input type="text" value={formData.shop_name} onChange={e => onChange('shop_name', e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl font-black text-lg border border-slate-200 focus:border-emerald-500 focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase px-1">رقم هاتف التواصل</label>
                            <input type="tel" value={formData.phone} onChange={e => onChange('phone', e.target.value)} dir="ltr" className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-base border border-slate-200 focus:border-emerald-500 focus:bg-white outline-none transition-all text-right" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase px-1">البريد الإلكتروني</label>
                            <input type="email" value={formData.email} onChange={e => onChange('email', e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-sm border border-slate-200 focus:border-emerald-500 focus:bg-white outline-none transition-all" dir="ltr" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase px-1">العنوان</label>
                            <input type="text" value={formData.address} onChange={e => onChange('address', e.target.value)} placeholder="عنوان طباعة الفاتورة" className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-sm border border-slate-200 focus:border-emerald-500 focus:bg-white outline-none transition-all" />
                        </div>
                    </div>

                    <div className="mt-8">
                        <button type="button" onClick={onSave} disabled={isSaving} className="w-full bg-slate-900 text-white p-4 md:p-5 rounded-2xl font-black text-base hover:bg-emerald-600 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-75">
                            {isSaving ? (
                                <><i className="fas fa-spinner fa-spin ml-2"></i> جاري الحفظ...</>
                            ) : (
                                <><i className="fas fa-check-circle text-xl text-emerald-400 group-hover:text-white transition-colors"></i> حفظ إعدادات النظام بالكامل</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};