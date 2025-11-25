import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../models/authService';
import { FRONTEND_REDIRECT_URI } from '../../config/apiUrls';
import { trackLogin, trackEvent } from '../../lib/analytics';
import './AuthPage.css';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Đang xử lý đăng nhập...');
  const isProcessingRef = useRef(false); // Flag to prevent double processing

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double processing (React StrictMode in dev)
      if (isProcessingRef.current) {
        return;
      }
      isProcessingRef.current = true;
      
      try {
        // Get code and state from URL params (OpenID provider redirects here)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Check for OAuth errors FIRST
        if (error) {
          setStatus('error');
          let errorMsg = errorDescription || error || 'Đăng nhập không thành công';
          
          // Handle specific OAuth errors
          if (error === 'CONSENT_ERROR' || error === 'consent_required' || error === 'consent_error') {
            errorMsg = 'Lỗi xử lý xác nhận quyền truy cập. Đây là lỗi từ hệ thống xác thực. Vui lòng thử lại sau vài giây.';
          } else if (error === 'access_denied') {
            errorMsg = 'Truy cập bị từ chối. Bạn đã hủy quá trình đăng nhập.';
          } else if (error === 'invalid_request') {
            errorMsg = 'Yêu cầu không hợp lệ. Vui lòng thử lại.';
          } else if (error === 'server_error') {
            errorMsg = 'Lỗi máy chủ. Vui lòng thử lại sau.';
          }
          
          setMessage(errorMsg);
          
          // Clear URL params
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }

        // Check if we have authorization code
        // If no code and no error, this might be a logout callback from OpenID provider
        if (!code) {
          // Check if this is a logout callback (no code, no error, and we're coming from logout)
          const isLogoutCallback = sessionStorage.getItem('logoutInProgress') === 'true';
          
          if (isLogoutCallback) {
            // This is a logout callback from MindX IdP
            // Step 1: Clear the logout flag
            sessionStorage.removeItem('logoutInProgress');
            
            // Step 2: Clear frontend session (token, localStorage, cookies)
            const { clearToken } = await import('../../models/tokenService');
            clearToken();
            localStorage.clear();
            
            // Clear cookies manually
            document.cookie.split(";").forEach((c) => {
              const eqPos = c.indexOf("=");
              const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
            });
            
            // Step 3: Call backend to clear Spring Boot session
            try {
              await authService.logout();
            } catch (logoutErr) {
              // Continue anyway - user is already logged out from MindX IdP
              console.error('Error clearing backend session:', logoutErr);
            }
            
            // Step 4: Set flag to prevent auto-login check
            sessionStorage.setItem('justLoggedOut', 'true');
            
            // Step 5: Redirect to login page
            window.location.href = '/login';
            return;
          }
          
          // If no code and no logout flag, this is an error (no code for login)
          setStatus('error');
          setMessage('Không nhận được authorization code từ OpenID provider');
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }

        // Clear URL params after reading to prevent re-processing
        window.history.replaceState({}, '', window.location.pathname);

        // Exchange code for user info via backend
        const response = await authService.handleCallback(
          code,
          state || '',
          FRONTEND_REDIRECT_URI
        );

        if (response.success && (response.data || response.user)) {
          // Backend may not return token in callback response
          // Try to get token from /api/auth/check endpoint after successful callback
          try {
            await authService.checkAuth();
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (checkErr) {
            // Continue anyway - backend may use session-based auth
          }
          
          // Track successful login
          trackLogin('MindX');
          trackEvent({
            category: 'Authentication',
            action: 'Login Success',
            label: 'OAuth Callback',
          });
          
          // Clear the OAuth redirect flag
          sessionStorage.removeItem('oauthRedirectInProgress');
          
          // Redirect to student page
          window.location.href = '/student';
        } else {
          setStatus('error');
          setMessage(response.message || 'Không thể xác thực người dùng');
        }
      } catch (err) {
        setStatus('error');
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xử lý đăng nhập';
        setMessage(errorMessage);
        
        // If 401 error, provide more helpful message
        if (errorMessage.includes('401') || errorMessage.includes('Xác thực thất bại')) {
          setMessage(errorMessage + ' Vui lòng thử đăng nhập lại.');
        }
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-header">
          <h1>Đang xử lý đăng nhập</h1>
        </header>

        {status === 'loading' && (
          <div className="auth-feedback">
            <p>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="auth-feedback success">
            <p>{message}</p>
            <p>Đang chuyển hướng...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="auth-feedback error">
              <p><strong>Lỗi đăng nhập</strong></p>
              <p>{message}</p>
              {message.includes('CONSENT_ERROR') || message.includes('xử lý xác nhận') ? (
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                  <p><strong>Gợi ý:</strong></p>
                  <ul style={{ textAlign: 'left', margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                    <li>Đây là lỗi từ hệ thống xác thực, không phải từ ứng dụng</li>
                    <li>Vui lòng đợi vài giây rồi thử lại</li>
                    <li>Nếu vẫn lỗi, vui lòng liên hệ admin để kiểm tra cấu hình OAuth</li>
                  </ul>
                </div>
              ) : null}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button 
                className="auth-submit" 
                onClick={() => {
                  navigate('/login', { replace: true });
                }}
                style={{ flex: 1 }}
              >
                Quay lại trang đăng nhập
              </button>
              <button 
                className="auth-submit" 
                onClick={() => {
                  // Clear any cached state and retry
                  window.location.reload();
                }}
                style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                Thử lại
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
