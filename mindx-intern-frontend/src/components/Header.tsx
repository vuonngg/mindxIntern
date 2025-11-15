import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type UserData } from '../services/authService';
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
      // Step 1: Clear frontend session (token, localStorage, cookies)
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
      
      // Step 2: Call backend to clear Spring Boot session
      try {
        await authService.logout();
      } catch (logoutErr) {
        // Continue anyway - frontend session is already cleared
        console.error('Error clearing backend session:', logoutErr);
      }
      
      // Step 3: Set flag to prevent auto-login check
      sessionStorage.setItem('justLoggedOut', 'true');
      
      // Step 4: Redirect to login page
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      // If logout fails, ensure everything is cleared anyway
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
      
      // Redirect to login page
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
          <img src="/anoano-logo.svg" alt="Anoano" className="header-logo-img" />
          <span className="header-title">Anoano</span>
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

