import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isTokenExpired } from '../services/tokenService';
import { authService } from '../services/authService';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute - Prevents authenticated users from accessing public pages (like login)
 * Redirects to dashboard if user is already authenticated
 */
export default function PublicRoute({ children }: PublicRouteProps) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Skip check if just logged out
      if (sessionStorage.getItem('justLoggedOut') === 'true') {
        sessionStorage.removeItem('justLoggedOut');
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      // Skip check if OAuth redirect is in progress
      if (sessionStorage.getItem('oauthRedirectInProgress') === 'true') {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      // Skip check if we're already on OAuth provider domain
      if (window.location.href.includes('id-dev.mindx.edu.vn') || 
          window.location.href.includes('id.mindx.edu.vn')) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      try {
        // Always check with backend first (backend may use session-based auth)
        const response = await authService.checkAuth();
        
        if (response.success && (response.data || response.user)) {
          // User is authenticated, redirect to dashboard
          setIsAuthenticated(true);
          setIsChecking(false);
          return;
        }
        
        // Backend says not authenticated, also check token as fallback
        const { getToken } = await import('../services/tokenService');
        const tokenData = getToken();
        if (tokenData && !isTokenExpired()) {
          // Token exists and valid, user is authenticated (even if backend check failed)
          setIsAuthenticated(true);
        } else {
          // No token or token expired, not authenticated
          setIsAuthenticated(false);
        }
      } catch (err) {
        // Backend check failed, check token as fallback
        const { getToken } = await import('../services/tokenService');
        const tokenData = getToken();
        if (tokenData && !isTokenExpired()) {
          // Token exists and valid, assume authenticated (may be temporary backend issue)
          setIsAuthenticated(true);
        } else {
          // No token or token expired, not authenticated
          setIsAuthenticated(false);
        }
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately, no delay needed
    checkAuth();
  }, [location.pathname]);

  if (isChecking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Đang kiểm tra...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    // User is authenticated, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated, allow access to public page
  return <>{children}</>;
}

