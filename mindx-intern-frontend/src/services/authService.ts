import { AUTH_ENDPOINTS, FRONTEND_REDIRECT_URI } from '../config/apiUrls';
import axiosInstance from '../lib/axios';
import { saveToken, clearToken } from './tokenService';
import type { AxiosResponse } from 'axios';

export interface AuthResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  user?: UserData;
  token?: string; // JWT token from backend
}

export interface UserData {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

export interface CallbackRequest {
  code: string;
  state: string;
  redirectUri: string;
}

/**
 * Extract token from response (check headers and body)
 */
function extractTokenFromResponse<T>(response: AxiosResponse<AuthResponse<T>>): string | null {
  // Check response headers
  const headerToken = response.headers['authorization'] || 
                      response.headers['x-auth-token'];
  if (headerToken) {
    return typeof headerToken === 'string' ? headerToken : null;
  }

  // Check response body
  const bodyToken = response.data?.token;
  if (bodyToken && typeof bodyToken === 'string') {
    return bodyToken;
  }

  return null;
}

/**
 * Handle axios response and extract token
 */
async function handleAxiosResponse<T>(response: AxiosResponse<AuthResponse<T>>): Promise<AuthResponse<T>> {
  // Extract and save token if present
  const token = extractTokenFromResponse(response);
  
  if (token) {
    try {
      saveToken(token);
    } catch (err) {
      console.error('Error saving token:', err);
    }
  }
  // Note: No token in response is normal for session-based auth

  return response.data;
}

export const authService = {
  /**
   * Get authorization URL from backend
   * Backend will generate the OAuth authorization URL with proper parameters
   * 
   * @param redirectUri - Redirect URI after login (default: from env)
   * @param state - State parameter (auto-generated if not provided)
   * @param usePAR - Use Pushed Authorization Request (default: false)
   * @param prompt - Prompt parameter: "login", "consent", "none" (optional)
   */
  async getLoginUrl(
    redirectUri?: string, 
    state?: string, 
    usePAR: boolean = false,
    prompt?: string
  ): Promise<string> {
    const finalRedirectUri = redirectUri || FRONTEND_REDIRECT_URI;
    const params = new URLSearchParams();
    params.append('redirectUri', finalRedirectUri);
    if (state) {
      params.append('state', state);
    }
    params.append('usePAR', usePAR.toString());
    if (prompt) {
      params.append('prompt', prompt);
    }

    const url = `${AUTH_ENDPOINTS.loginUrl}?${params.toString()}`;
    console.log('=== getLoginUrl: Calling backend ===');
    console.log('Endpoint:', AUTH_ENDPOINTS.loginUrl);
    console.log('Full URL:', url);
    console.log('Params:', { redirectUri: finalRedirectUri, state, usePAR, prompt });
    
    try {
      const response = await axiosInstance.get<AuthResponse<string>>(url);
      console.log('=== getLoginUrl: Response received ===');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      
      const data = await handleAxiosResponse(response);
      console.log('=== getLoginUrl: Processed data ===');
      console.log('Processed data:', data);
      
      // Backend returns the authorization URL in the message field
      let authUrl: string | null = null;
      
      if (data.message && typeof data.message === 'string' && data.message.startsWith('http')) {
        authUrl = data.message;
        console.log('Found auth URL in data.message');
      } else if (data.data && typeof data.data === 'string' && data.data.startsWith('http')) {
        authUrl = data.data;
        console.log('Found auth URL in data.data');
      } else {
        console.warn('No valid auth URL found in response');
        console.warn('data.message:', data.message);
        console.warn('data.data:', data.data);
      }
      
      if (authUrl) {
        console.log('=== getLoginUrl: Authorization URL found ===');
        console.log('Original URL:', authUrl);
        
        // Fix endpoint based on discovery document
        // Discovery document shows: authorization_endpoint = "https://id-dev.mindx.edu.vn/auth"
        // Not /oauth/authorize or /oauth2/authorize
        if (authUrl.includes('/oauth/authorize')) {
          console.warn('Fixing OAuth endpoint: /oauth/authorize -> /auth (from discovery document)');
          authUrl = authUrl.replace('/oauth/authorize', '/auth');
          console.log('Fixed authorization URL:', authUrl);
        } else if (authUrl.includes('/oauth2/authorize')) {
          console.warn('Fixing OAuth endpoint: /oauth2/authorize -> /auth (from discovery document)');
          authUrl = authUrl.replace('/oauth2/authorize', '/auth');
          console.log('Fixed authorization URL:', authUrl);
        }
        
        console.log('=== getLoginUrl: Returning URL ===');
        console.log('Final auth URL:', authUrl);
        return authUrl;
      }
      
      console.error('=== getLoginUrl: Invalid response ===');
      console.error('Response data:', data);
      throw new Error('Invalid authorization URL received from backend. Response: ' + JSON.stringify(data));
    } catch (error) {
      console.error('=== getLoginUrl: Error ===');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        console.error('Axios error response:', axiosError.response?.data);
        console.error('Axios error status:', axiosError.response?.status);
      }
      throw error;
    }
  },

  /**
   * Handle OAuth callback - exchange code for user info
   * Frontend receives code from OpenID provider and sends it to backend
   * Backend will return JWT token which will be saved to localStorage
   */
  async handleCallback(code: string, state: string, redirectUri?: string): Promise<AuthResponse<UserData>> {
    const finalRedirectUri = redirectUri || FRONTEND_REDIRECT_URI;
    
    const request: CallbackRequest = {
      code,
      state,
      redirectUri: finalRedirectUri,
    };

    console.log('Calling callback endpoint:', AUTH_ENDPOINTS.callback);
    console.log('Callback request:', { 
      code: code.substring(0, 10) + '...', 
      state, 
      redirectUri: finalRedirectUri 
    });

    try {
      const response = await axiosInstance.post<AuthResponse<UserData>>(
        AUTH_ENDPOINTS.callback,
        request
      );
      const data = await handleAxiosResponse(response);
      console.log('Callback response:', data);
      return data;
    } catch (error) {
      console.error('Callback error:', error);
      throw error;
    }
  },

  /**
   * Get current authenticated user information from session
   */
  async getCurrentUser(): Promise<AuthResponse<UserData>> {
    const response = await axiosInstance.get<AuthResponse<UserData>>(AUTH_ENDPOINTS.getUserMe);
    return handleAxiosResponse(response);
  },

  /**
   * Check if user is authenticated
   * Backend will return token if authenticated (or use session-based auth)
   */
  async checkAuth(): Promise<AuthResponse<UserData>> {
    const response = await axiosInstance.get<AuthResponse<UserData>>(AUTH_ENDPOINTS.checkAuth);
    const data = await handleAxiosResponse(response);
    return data;
  },

  /**
   * Submit POST form to logout URL (for OpenID provider logout)
   * Creates a hidden form and submits it via POST method
   */
  submitLogoutForm(logoutUrl: string, params: { id_token_hint: string; post_logout_redirect_uri: string }): void {
    console.log('Building POST form for logout...');
    console.log('Logout URL (action):', logoutUrl);
    console.log('id_token_hint:', params.id_token_hint.substring(0, 20) + '...');
    console.log('post_logout_redirect_uri:', params.post_logout_redirect_uri);
    
    // Create a form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = logoutUrl;
    form.style.display = 'none';
    
    // Add id_token_hint parameter
    const idTokenInput = document.createElement('input');
    idTokenInput.type = 'hidden';
    idTokenInput.name = 'id_token_hint';
    idTokenInput.value = params.id_token_hint;
    form.appendChild(idTokenInput);
    
    // Add post_logout_redirect_uri parameter
    // Ensure exact match with registered URI (no encoding issues)
    const redirectUriInput = document.createElement('input');
    redirectUriInput.type = 'hidden';
    redirectUriInput.name = 'post_logout_redirect_uri';
    redirectUriInput.value = params.post_logout_redirect_uri;
    form.appendChild(redirectUriInput);
    
    // Log form data before submit
    console.log('Form data to be submitted:');
    console.log('  - id_token_hint:', idTokenInput.value.substring(0, 20) + '...');
    console.log('  - post_logout_redirect_uri:', redirectUriInput.value);
    
    // Append form to body and submit
    document.body.appendChild(form);
    form.submit();
  },

  /**
   * Get logout URL from backend (GET /api/auth/get-logout)
   * Backend returns logout URL with id_token_hint and client_id
   * Frontend will remove client_id and add post_logout_redirect_uri
   */
  async getLogoutUrl(): Promise<{ baseUrl: string; idTokenHint: string }> {
    console.log('Calling get-logout endpoint:', AUTH_ENDPOINTS.getLogout);
    
    const response = await axiosInstance.get<AuthResponse<string>>(AUTH_ENDPOINTS.getLogout);
    const data = await handleAxiosResponse(response);
    
    console.log('Get logout URL response:', data);
    
    // Backend returns logout URL in the message field
    // URL format: https://id-dev.mindx.edu.vn/session/end?client_id=...&id_token_hint=...
    if (data.message && data.message.startsWith('http')) {
      console.log('Logout URL from backend:', data.message);
      
      // Parse URL to extract base URL and id_token_hint
      const url = new URL(data.message);
      const idTokenHint = url.searchParams.get('id_token_hint');
      
      if (!idTokenHint) {
        throw new Error('id_token_hint not found in logout URL');
      }
      
      // Return base URL (end_session_endpoint) and id_token_hint
      // Remove all query params to get clean base URL
      const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
      
      return {
        baseUrl,
        idTokenHint
      };
    }
    
    throw new Error('Invalid logout URL received from backend');
  },

  /**
   * Logout - clear session on backend (POST /api/auth/logout)
   * This should be called after MindX IdP has logged out and redirected back to frontend
   * Also clears token from localStorage
   */
  async logout(): Promise<AuthResponse<void>> {
    console.log('Calling logout endpoint:', AUTH_ENDPOINTS.logout);
    
    try {
      const response = await axiosInstance.post<AuthResponse<void>>(AUTH_ENDPOINTS.logout);
      const data = await handleAxiosResponse(response);
      console.log('Logout response:', data);
      
      // Clear token from localStorage
      clearToken();
      
      return data;
    } catch (error) {
      // Even if logout fails, clear token
      clearToken();
      throw error;
    }
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<AuthResponse<string>> {
    const response = await axiosInstance.get<AuthResponse<string>>(AUTH_ENDPOINTS.health);
    return handleAxiosResponse(response);
  },
};

export type AuthService = typeof authService;
