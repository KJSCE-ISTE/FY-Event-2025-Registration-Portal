import { useState, useEffect } from 'react';
import GoogleSignIn from './components/GoogleSignIn';
import QRScanner from './components/QRScanner';
import Loading from './components/Loading';
import Unauthorized from './components/Unauthorized';
import { auth } from './utils/auth';
import { authAPI } from './utils/api';
import './App.css';

type AppState = 'loading' | 'login' | 'scanner' | 'unauthorized';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [error, setError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      if (auth.isAuthenticated()) {
        setAppState('scanner');
      } else {
        setAppState('login');
      }
    };

    // Small delay to show loading screen
    const timer = setTimeout(checkAuth, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSignIn = async (credential: string) => {
    setLoginLoading(true);
    setError('');

    try {
      const response = await authAPI.login(credential);
      auth.setToken(response.token);
      setAppState('scanner');
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.status === 403) {
        setAppState('unauthorized');
      } else {
        setError(
          error.response?.data?.error || 
          'Login failed. Please try again.'
        );
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    auth.removeToken();
    setAppState('login');
    setError('');
  };

  const handleBackToLogin = () => {
    setAppState('login');
    setError('');
  };

  const renderCurrentState = () => {
    switch (appState) {
      case 'loading':
        return <Loading />;
      
      case 'login':
        return (
          <GoogleSignIn 
            onSignIn={handleSignIn}
            loading={loginLoading}
            error={error}
          />
        );
      
      case 'scanner':
        return <QRScanner onLogout={handleLogout} />;
      
      case 'unauthorized':
        return (
          <Unauthorized 
            onBack={handleBackToLogin}
            message="Access denied. You are not part of the ISTE team."
          />
        );
      
      default:
        return <Loading />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {renderCurrentState()}
    </div>
  );
}

export default App;
