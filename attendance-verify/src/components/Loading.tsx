import React from 'react';
import { Shield } from 'lucide-react';

const Loading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 w-20 h-20 rounded-2xl border-4 border-primary-500/30 animate-pulse"></div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
        <p className="text-gray-400">Initializing ISTE Attendance System</p>
        <div className="mt-6 flex justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
