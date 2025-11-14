/**
 * Axios instance with interceptors for token management
 */
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getTokenString, isTokenExpired, clearToken } from '../services/tokenService';
import { AUTH_ENDPOINTS } from '../config/apiUrls';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  withCredentials: true, // Important for cookies/session
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';
    
    // Don't check token expiration for auth endpoints (login, callback, etc.)
    // These endpoints don't require a token and might be setting a new token
    const isAuthEndpoint = 
      url.includes('/api/auth/login-url') ||
      url.includes('/api/auth/callback') ||
      url.includes('/api/auth/check') ||
      url.includes('/api/auth/public') ||
      url.includes('/api/auth/health') ||
      url.includes('/api/auth/get-logout');
    
    // Only check token expiration for non-auth endpoints
    if (!isAuthEndpoint && isTokenExpired()) {
      clearToken();
      // Redirect will be handled by response interceptor on 401
    }

    // Add token to Authorization header if available
    const token = getTokenString();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Axios Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration and errors
axiosInstance.interceptors.response.use(
  async (response: AxiosResponse) => {
    // Check if response contains a new token
    // Backend might return token in response headers or body
    const token = response.headers['authorization'] || 
                  response.headers['x-auth-token'] ||
                  (response.data?.data?.token) ||
                  (response.data?.token);
    
    if (token && typeof token === 'string') {
      // Import and save token synchronously to ensure it's saved before redirect
      const { saveToken } = await import('../services/tokenService');
      saveToken(token);
    }

    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      clearToken();
      
      // Don't redirect for login/callback endpoints
      const url = error.config?.url || '';
      const isAuthEndpoint = 
        url.includes('/api/auth/login-url') ||
        url.includes('/api/auth/callback') ||
        url.includes('/api/auth/public') ||
        url.includes('/api/auth/health');
      
      if (!isAuthEndpoint) {
        // Redirect to login page
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && !currentPath.includes('/auth/callback')) {
          window.location.href = '/login';
        }
      }
    } else if (error.response?.status && error.response.status >= 500) {
      // Only log server errors
      console.error('Server error:', error.response.status, error.config?.url);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

