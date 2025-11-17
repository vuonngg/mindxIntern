import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isTokenExpired } from '../services/tokenService';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute - Checks token expiration before allowing access
 * Redirects to login if token is expired
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check with backend first (backend may use session-based auth)
        const response = await authService.checkAuth();
        
        if (response.success && (response.data || response.user)) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        // If backend check fails, also check token
        const { getToken } = await import('../services/tokenService');
        const tokenData = getToken();
        if (tokenData && !isTokenExpired()) {
          // May be temporary backend issue, allow access
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setIsChecking(false);
      }
    };

    // Add a small delay to ensure token is saved if coming from callback
    const timeoutId = setTimeout(() => {
      checkAuth();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  if (isChecking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Đang kiểm tra...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

