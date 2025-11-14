// API Base URL - if not provided, use same origin (backend and frontend on same domain)
// Can be empty string for relative paths, or full URL like http://localhost:8080
// Read from window.__ENV__ (runtime injection) or import.meta.env (build time)
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // window.__ENV__ is injected at runtime by docker-entrypoint.sh
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key as keyof typeof window.__ENV__]) {
    return window.__ENV__[key as keyof typeof window.__ENV__] || defaultValue;
  }
  // Fallback to build-time env vars
  return import.meta.env[key] as string || defaultValue;
};

const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', '');
const FRONTEND_REDIRECT_URI = getEnvVar('VITE_FRONTEND_REDIRECT_URI', `${window.location.origin}/auth/callback`);
const OPENID_CLIENT_ID = getEnvVar('VITE_OPENID_CLIENT_ID', 'mindx-onboarding');

export const AUTH_ENDPOINTS = {
  loginUrl: `${API_BASE_URL}/api/auth/login-url`,
  callback: `${API_BASE_URL}/api/auth/callback`,
  getUserMe: `${API_BASE_URL}/api/auth/user/me`,
  checkAuth: `${API_BASE_URL}/api/auth/check`,
  getLogout: `${API_BASE_URL}/api/auth/get-logout`,
  logout: `${API_BASE_URL}/api/auth/logout`,
  health: `${API_BASE_URL}/api/auth/health`,
  public: `${API_BASE_URL}/api/auth/public`,
} as const;

export { API_BASE_URL, FRONTEND_REDIRECT_URI, OPENID_CLIENT_ID };


