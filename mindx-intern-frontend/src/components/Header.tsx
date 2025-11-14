import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type UserData } from '../services/authService';
import { FRONTEND_REDIRECT_URI } from '../config/apiUrls';
import { clearToken } from '../services/tokenService';
import { trackButtonClick, trackLogout } from '../lib/analytics';
import './Header.css';

interface HeaderProps {
  user: UserData;
}

export default function Header({ user }: HeaderProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    // Track logout button click
    trackButtonClick('Logout Button', 'Header');
    trackLogout();
    
    setLoggingOut(true);
    try {
      // Step 1: Get logout URL info from backend (GET /api/auth/get-logout)
      const { baseUrl, idTokenHint } = await authService.getLogoutUrl();
      
      // Step 2: Prepare post_logout_redirect_uri
      // Use FRONTEND_REDIRECT_URI from environment (same as login callback)
      const postLogoutRedirectUri = FRONTEND_REDIRECT_URI;
      
      // Step 3: Set flag for logout callback detection
      // DO NOT clear token/session here - wait for callback from MindX IdP
      sessionStorage.setItem('logoutInProgress', 'true');
      
      // Step 4: Submit POST form to MindX IdP logout endpoint
      // MindX IdP will clear its session and redirect back to post_logout_redirect_uri
      authService.submitLogoutForm(baseUrl, {
        id_token_hint: idTokenHint,
        post_logout_redirect_uri: postLogoutRedirectUri
      });
      
      // Note: After form submission, browser will redirect to MindX IdP
      // Then MindX IdP will redirect back to post_logout_redirect_uri
      // The callback handler will detect logoutInProgress flag and complete the logout
    } catch (err) {
      console.error('Logout error:', err);
      // If logout fails, clear everything and redirect to login as fallback
      clearToken();
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('justLoggedOut', 'true');
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      // Fallback: redirect to login page
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const displayName = user?.name || user?.email || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo">
          <img src="/mindx-logo.svg" alt="MindX" className="header-logo-img" />
          <span className="header-title">MindX Dashboard</span>
        </div>
        
        <div className="header-user" ref={dropdownRef}>
          <button
            className="user-menu-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={loggingOut}
          >
            <div className="user-avatar">{initials}</div>
            <span className="user-name">{displayName}</span>
            <svg
              className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-item user-info-item">
                <div className="user-info-name">{displayName}</div>
                {user.email && (
                  <div className="user-info-email">{user.email}</div>
                )}
              </div>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item logout-item"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

