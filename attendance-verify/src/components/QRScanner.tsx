import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { QrCode, Camera, CheckCircle, XCircle, AlertTriangle, LogOut } from 'lucide-react';
import { auth } from '../utils/auth';
import { attendanceAPI } from '../utils/api';

interface QRScannerProps {
  onLogout: () => void;
}

interface ScanResult {
  type: 'success' | 'error' | 'warning';
  message: string;
  user?: any;
}

const QRScanner: React.FC<QRScannerProps> = ({ onLogout }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const currentUser = auth.getCurrentUser();

  const qrCodeConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    showTorchButtonIfSupported: true,
    showZoomSliderIfSupported: true,
    defaultZoomValueIfSupported: 2,
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (processing) return;
    
    setProcessing(true);
    setScanResult(null);

    try {
      // The QR code should contain the user ID
      const userId = decodedText.trim();
      
      if (!userId || isNaN(Number(userId))) {
        setScanResult({
          type: 'error',
          message: 'Invalid QR code format. Please scan a valid event QR code.'
        });
        setProcessing(false);
        return;
      }

      // Call the attendance API
      const response = await attendanceAPI.updateAttendance(userId);
      
      setScanResult({
        type: 'success',
        message: `Attendance marked successfully for ${response.user.first_name} ${response.user.last_name}`,
        user: response.user
      });

    } catch (error: any) {
      console.error('Attendance update error:', error);
      
      if (error.response?.status === 404) {
        setScanResult({
          type: 'error',
          message: 'User not found. Please check the QR code.'
        });
      } else if (error.response?.status === 400) {
        setScanResult({
          type: 'warning',
          message: 'Attendance already marked for this user.'
        });
      } else {
        setScanResult({
          type: 'error',
          message: error.response?.data?.error || 'Failed to update attendance. Please try again.'
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleScanError = (errorMessage: string) => {
    // Only log errors, don't show them to user as they're usually just scanning failures
    console.log('QR Scan error:', errorMessage);
  };

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner('qr-scanner', qrCodeConfig, false);
    scannerRef.current = scanner;
    scanner.render(handleScanSuccess, handleScanError);
    setIsScanning(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const clearResult = () => {
    setScanResult(null);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const getScanResultIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getScanResultBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-700/50';
      case 'error':
        return 'bg-red-900/20 border-red-700/50';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-700/50';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-800 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Attendance Scanner</h1>
                <p className="text-gray-400">Welcome, {currentUser?.name}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 text-gray-300 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Scanner Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">QR Code Scanner</h2>
              <p className="text-gray-400">Scan attendee QR codes to mark attendance</p>
            </div>

            {/* Scanner Controls */}
            <div className="flex justify-center mb-6">
              {!isScanning ? (
                <button
                  onClick={startScanner}
                  disabled={processing}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors duration-200"
                >
                  <Camera className="w-5 h-5" />
                  <span>Start Scanning</span>
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-white transition-colors duration-200"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Stop Scanning</span>
                </button>
              )}
            </div>

            {/* Scanner Container */}
            <div className="relative">
              {isScanning && (
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div id="qr-scanner" className="w-full"></div>
                </div>
              )}

              {!isScanning && (
                <div className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
                  <QrCode className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Click "Start Scanning" to begin</p>
                </div>
              )}
            </div>

            {/* Processing Indicator */}
            {processing && (
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-400 font-medium">Processing attendance...</span>
                </div>
              </div>
            )}

            {/* Scan Result */}
            {scanResult && (
              <div className={`mt-6 p-4 rounded-lg border ${getScanResultBg(scanResult.type)}`}>
                <div className="flex items-start space-x-3">
                  {getScanResultIcon(scanResult.type)}
                  <div className="flex-1">
                    <p className="text-white font-medium">{scanResult.message}</p>
                    {scanResult.user && (
                      <div className="mt-2 text-sm text-gray-300">
                        <p>📧 {scanResult.user.email}</p>
                        <p>📞 {scanResult.user.phone}</p>
                        <p>🎓 {scanResult.user.year} - {scanResult.user.branch}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={clearResult}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
              <h3 className="text-white font-medium mb-2">📋 Instructions:</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Point the camera at the attendee's QR code</li>
                <li>• Ensure good lighting for better scanning</li>
                <li>• The QR code should be clearly visible and not damaged</li>
                <li>• Each QR code can only be scanned once per attendee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
