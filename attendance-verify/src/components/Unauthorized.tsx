import React from 'react';
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react';

interface UnauthorizedProps {
  onBack: () => void;
  message?: string;
}

const Unauthorized: React.FC<UnauthorizedProps> = ({ 
  onBack, 
  message = "You are not authorized to access this system." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-800 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-900/30 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-white mb-3">Access Denied</h1>
          <p className="text-gray-400 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Info Box */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-primary-400" />
              <span className="text-primary-400 font-medium">ISTE Team Access Only</span>
            </div>
            <p className="text-gray-400 text-sm">
              This system is restricted to authorized ISTE team members only. 
              Please contact your administrator if you believe this is an error.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Try Again</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              ISTE Event Management System
              <br />
              Unauthorized access is prohibited
            </p>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-red-700/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
