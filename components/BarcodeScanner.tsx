import React, { useEffect, useRef } from 'react';

// Inform TypeScript about the global Html5Qrcode class from the CDN script
declare const Html5Qrcode: any;

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("reader");
    let scannerIsRunning = true;

    const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
        if (scannerIsRunning) {
            console.log(`Scan result: ${decodedText}`, decodedResult);
            scannerIsRunning = false;
            onScanSuccess(decodedText);
        }
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    scannerRef.current.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
      .catch((err: any) => {
        console.error("Unable to start scanning.", err);
        alert("Error starting camera. Please grant camera permission and refresh the page.");
        onClose();
      });

    return () => {
      if (scannerRef.current && scannerIsRunning) {
        scannerRef.current.stop()
          .then(() => console.log("QR Code scanning stopped."))
          .catch((err: any) => console.error("Failed to stop QR Code scanning.", err));
      }
    };
  }, [onScanSuccess, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg m-4 text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary">Scan Barcode</h2>
        <p className="text-gray-600 mb-4">Point your camera at a product barcode.</p>
        <div id="reader" className="w-full rounded-lg overflow-hidden border-2 border-gray-300"></div>
        <button
          onClick={onClose}
          className="mt-6 bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BarcodeScanner;
