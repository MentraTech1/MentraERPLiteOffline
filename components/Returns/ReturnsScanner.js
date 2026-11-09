// المسار: components/Returns/ReturnsScanner.js
window.ReturnsScanner = function({ isScanning, onClose, onResult }) {
    const { useEffect, useRef } = React;
    const videoRef = useRef(null);
    const codeReaderRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        if (isScanning && window.ZXing) {
            codeReaderRef.current = new window.ZXing.BrowserMultiFormatReader();
            
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => {
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                    codeReaderRef.current.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
                        if (result) {
                            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                            onResult(result.text);
                        }
                    });
                })
                .catch(err => {
                    console.error("Camera Error:", err);
                    window.Swal.fire({ icon: 'error', title: 'خطأ بالكاميرا', text: 'لا يمكن الوصول للكاميرا', toast: true, timer: 2000 });
                    onClose();
                });
        }

        return () => {
            if (codeReaderRef.current) codeReaderRef.current.reset();
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
    }, [isScanning]);

    if (!isScanning) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col" dir="ltr">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <span className="font-black">مسح الباركود للمرتجع</span>
                <button onClick={onClose} className="text-white text-xl"><i className="fas fa-times"></i></button>
            </div>
            <div className="flex-1 relative flex justify-center items-center">
                <video ref={videoRef} className="w-full h-full object-cover"></video>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border-4 border-amber-500 rounded-2xl pointer-events-none"></div>
                <div className="absolute bottom-10 bg-slate-900 text-white px-5 py-2 rounded-full font-bold text-sm">ضع الباركود داخل الإطار</div>
            </div>
        </div>
    );
};