import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { trackButtonClick, trackLogin } from '../lib/analytics';
import './AuthPage.css';

export function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    trackButtonClick('Login Button', 'AuthPage');
    
    setLoading(true);
    setError(null);
    
    try {
      // Get authorization URL from backend with prompt=login to force fresh login
      const authUrl = await authService.getLoginUrl(undefined, undefined, false, 'login');
      
      if (!authUrl || typeof authUrl !== 'string' || !authUrl.startsWith('http')) {
        throw new Error('Invalid authorization URL received');
      }
      
      trackLogin('MindX');
      
      // Set flag to prevent LoginRedirect from interfering
      sessionStorage.setItem('oauthRedirectInProgress', 'true');
      
      // Redirect immediately to OpenID provider
      window.location.href = authUrl;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi đăng nhập';
      setError(errorMsg);
      setLoading(false);
    }
  };

  useEffect(() => {
    const justLoggedOut = sessionStorage.getItem('justLoggedOut') === 'true';
    if (justLoggedOut) {
      sessionStorage.removeItem('justLoggedOut');
      localStorage.removeItem('authState');
    }
  }, []);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-header">
          <div className="auth-logo">
            <img 
              src="/anoano-logo.svg" 
              alt="Anoano Logo" 
              className="mindx-logo"
            />
          </div>
          <h1>Chào mừng quay trở lại</h1>
        </header>

        <button 
          className="auth-submit mindx-login-button" 
          type="button" 
          onClick={handleLogin} 
          disabled={loading}
        >
          <img src="/anoano-logo.svg" alt="" className="button-logo" />
          {loading ? 'Đang tải...' : 'Đăng nhập bằng MindX'}
        </button>

        {error && <div className="auth-feedback error">{error}</div>}
      </section>
    </main>
  );
}

export default AuthPage;
