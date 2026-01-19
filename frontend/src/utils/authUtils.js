/**
 * Authentication utilities for token management
 * Centralizes token storage logic to avoid duplication
 */

export const storeTokens = (accessToken, refreshToken, rememberMe = false) => {
  if (!accessToken) throw new Error('Access token is required');
  
  localStorage.setItem('access_token', accessToken);
  
  // Store refresh token only if user checked "Remember me"
  if (rememberMe && refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getTokens = () => {
  return {
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token')
  };
};

export const isTokenValid = () => {
  const { accessToken } = getTokens();
  return !!accessToken;
};

/**
 * Handle successful auth from both traditional signup and OAuth flows
 */
export const handleAuthSuccess = (accessToken, refreshToken, rememberMe = false) => {
  storeTokens(accessToken, refreshToken, rememberMe);
  // Redirect logic should be handled by the caller (AuthPage or AuthCallback)
};
