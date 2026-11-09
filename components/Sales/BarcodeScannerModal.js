// المسار: components/Sales/BarcodeScannerModal.js
window.SalesBarcodeScannerModal = function({ closeScanner, handleBarcode }) {
    const { useEffect, useRef } = React;
    const videoRef = useRef(null);
    const codeReaderRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const startScanner = async () => {
            if (typeof window.ZXing === 'undefined') {
                alert("مكتبة المسح غير متاحة حالياً");
                closeScanner();
                return;
            }

            codeReaderRef.current = new window.ZXing.BrowserMultiFormatReader();
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                codeReaderRef.current.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
                    if (result) {
                        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                        handleBarcode(result.text);
                    }
                });
            } catch (err) {
                console.error("Camera error:", err);
                alert("لا يمكن الوصول للكاميرا. تأكد من منح الصلاحيات.");
                closeScanner();
            }
        };

        startScanner();

        return () => {
            if (codeReaderRef.current) codeReaderRef.current.reset();
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
            if (videoRef.current) videoRef.current.srcObject = null;
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col direction-ltr">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 border-b border-slate-800">
                <span className="font-black text-lg">امسح الباركود</span>
                <button onClick={closeScanner} className="w-10 h-10 bg-slate-800 hover:bg-rose-500 rounded-lg flex items-center justify-center transition-colors">
                    <i className="fas fa-times text-xl"></i>
                </button>
            </div>
            <div className="flex-1 relative flex justify-center items-center overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover"></video>
                
                {/* إطار التوجيه للكاميرا */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border-4 border-blue-500/50 rounded-2xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                    <div className="absolute top-[-4px] right-[-4px] w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
                    <div className="absolute top-[-4px] left-[-4px] w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
                    <div className="absolute bottom-[-4px] right-[-4px] w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
                    <div className="absolute bottom-[-4px] left-[-4px] w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md text-white px-6 py-2.5 rounded-full font-bold text-sm">
                    ضع الباركود داخل الإطار الأزرق
                </div>
            </div>
        </div>
    );
};