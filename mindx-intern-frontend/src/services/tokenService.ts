/**
 * Token Service - Manages JWT token storage and validation
 */
import { jwtDecode } from 'jwt-decode';

export interface TokenData {
  token: string;
  expiresAt: number; // Unix timestamp in milliseconds
  decoded?: {
    exp?: number; // Expiration time from JWT
    iat?: number; // Issued at time
    sub?: string; // Subject (user ID)
    [key: string]: unknown;
  };
}

const TOKEN_STORAGE_KEY = 'mindx_auth_token';

/**
 * Decode JWT token using jwt-decode library
 * Note: This is a simple decode, not verification
 */
function decodeJWT(token: string): TokenData['decoded'] | null {
  try {
    const decoded = jwtDecode(token);
    return decoded as TokenData['decoded'];
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Get token from localStorage
 */
export function getToken(): TokenData | null {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const tokenData: TokenData = JSON.parse(stored);
    return tokenData;
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
    return null;
  }
}

/**
 * Save token to localStorage
 * @param token - JWT token string from backend
 */
export function saveToken(token: string): void {
  try {
    const decoded = decodeJWT(token);
    
    // Calculate expiration time
    // If JWT has 'exp' claim, use it (it's in seconds, convert to milliseconds)
    // Otherwise, set expiration to 24 hours from now
    let expiresAt: number;
    if (decoded?.exp) {
      expiresAt = decoded.exp * 1000; // Convert seconds to milliseconds
    } else {
      expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    }

    const tokenData: TokenData = {
      token,
      expiresAt,
      decoded,
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
  } catch (error) {
    console.error('Error saving token to localStorage:', error);
    throw error;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
  const tokenData = getToken();
  if (!tokenData) {
    return true; // No token = expired
  }

  // Check if expired (with 5 minute buffer for safety)
  const now = Date.now();
  const buffer = 5 * 60 * 1000; // 5 minutes
  const isExpired = tokenData.expiresAt <= (now + buffer);

  return isExpired;
}

/**
 * Get token string (for API calls)
 */
export function getTokenString(): string | null {
  const tokenData = getToken();
  return tokenData?.token || null;
}

/**
 * Clear token from localStorage
 */
export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing token from localStorage:', error);
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(): number | null {
  const tokenData = getToken();
  return tokenData?.expiresAt || null;
}

