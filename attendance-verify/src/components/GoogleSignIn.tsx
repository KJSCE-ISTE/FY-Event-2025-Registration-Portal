import React, { useEffect, useCallback } from 'react';
import { LogIn, Shield, Users } from 'lucide-react';

interface GoogleSignInProps {
  onSignIn: (credential: string) => void;
  loading?: boolean;
  error?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({ onSignIn, loading, error }) => {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback((response: any) => {
    onSignIn(response.credential);
  }, [onSignIn]);

  const initializeGoogleSignIn = useCallback(() => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'filled_black',
          size: 'large',
          width: 280,
          text: 'signin_with',
          shape: 'rectangular',
        }
      );
    }
  }, [GOOGLE_CLIENT_ID, handleCredentialResponse]);

  useEffect(() => {
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = initializeGoogleSignIn;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [initializeGoogleSignIn]);

  // Development/testing sign-in button
  const handleMockSignIn = () => {
    onSignIn('mock-jwt-token-for-testing');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-800">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">ISTE Team Login</h1>
            <p className="text-gray-400">Attendance Verification System</p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center text-gray-300">
              <Users className="w-5 h-5 mr-3 text-primary-400" />
              <span className="text-sm">Team Member Access Only</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Shield className="w-5 h-5 mr-3 text-primary-400" />
              <span className="text-sm">Secure Authentication</span>
            </div>
            <div className="flex items-center text-gray-300">
              <LogIn className="w-5 h-5 mr-3 text-primary-400" />
              <span className="text-sm">QR Code Scanner Access</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Google Sign-In Button Container */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div 
                id="google-signin-button" 
                className={loading ? 'pointer-events-none opacity-50' : ''}
              />
            </div>

            {/* Development/Testing Button */}
            {import.meta.env.DEV && (
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={handleMockSignIn}
                  disabled={loading}
                  className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Dev Login (Mock)</span>
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Development mode only
                </p>
              </div>
            )}

            {loading && (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              Only authorized ISTE team members can access this system.
              <br />
              Contact admin if you need access.
            </p>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-primary-700/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignIn;
