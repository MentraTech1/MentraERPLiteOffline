// المسار: components/ProfitReport/ProfitReportInsight.js
window.ProfitReportInsight = function({ data }) {
    const formatMoney = (n) => Number(n).toLocaleString('en-US', {minimumFractionDigits: 2});

    if (!data) return null;

    let insightText = '';
    if(data.totalReturns > data.totalGrossRevenue * 0.2) {
        insightText = <><span className="text-rose-600">تنبيه هام:</span> المرتجعات تمثل أكثر من 20% من مبيعاتك ({formatMoney(data.totalReturns)}). يُرجى مراجعة جودة البضاعة.</>;
    } else if (data.netIncome > 0 && data.netCashFlow < 0) {
        insightText = <>أنت تحقق ربحاً تشغيلياً <b>({formatMoney(data.netIncome)})</b>، ولكن درج النقدية بالسالب <b>({formatMoney(data.netCashFlow)})</b> بسبب شرائك بضاعة عالية القيمة. أموالك في أمان كبضاعة!</>;
    } else if (data.netIncome > 0 && data.netCashFlow >= 0) {
        insightText = <>أداء ممتاز! مبيعاتك تغطي التكاليف وتوفر سيولة وربحاً حقيقياً بقيمة <b>{formatMoney(data.netIncome)}</b>.</>;
    } else if (data.netIncome <= 0 && data.totalExpenses > 0) {
        insightText = <>تنبيه: التكاليف والمصروفات أعلى من هامش ربح المبيعات. يُرجى محاولة تقليل <b>المصروفات ({formatMoney(data.totalExpenses)})</b>.</>;
    } else {
        insightText = <>قم بتسجيل مبيعات ومصروفات للحصول على تحليل دقيق لعملك.</>;
    }

    return (
        <div className="bg-indigo-50 border border-indigo-100 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-5 shadow-inner animate-view" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white text-indigo-600 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-2xl md:text-3xl shrink-0 shadow-sm animate-bounce-slow">
                <i className="fas fa-lightbulb"></i>
            </div>
            <div className="text-center sm:text-right w-full">
                <h3 className="font-black text-indigo-900 mb-1 md:mb-2 text-base md:text-lg">فهم أرقامك بشكل صحيح</h3>
                <p className="text-xs md:text-sm font-bold text-indigo-700/80 leading-relaxed">{insightText}</p>
            </div>
            {/* ستايل مخصص للأنيميشن */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes bounce-slow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(5%); } }
                .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
            `}} />
        </div>
    );
};