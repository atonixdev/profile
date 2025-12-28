import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure CSRF cookie exists, then attempt to load current user (cookie auth)
    (async () => {
      try {
        await api.get('/auth/csrf/');
      } catch {
        // ignore
      }

      try {
        const resp = await api.get('/accounts/profiles/me/');
        if (resp.data) setUser(resp.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (username, password, otp) => {
    try {
      await api.get('/auth/csrf/');
      await api.post('/auth/login/', { username, password, ...(otp ? { otp } : {}) });
      const userResponse = await api.get('/accounts/profiles/me/');
      if (userResponse.data) setUser(userResponse.data);

      return { success: true };
    } catch (error) {
      if (!error.response) {
        return {
          success: false,
          error: 'Cannot reach the API server. Check backend connectivity and HTTPS-only browser settings.',
        };
      }

      const status = error.response?.status;
      const data = error.response?.data;

      if (error.response?.status === 429) {
        return { success: false, error: 'Too many login attempts. Please wait and try again.' };
      }

      if (error.response?.status === 400 && error.response?.data?.otp) {
        const otpError = error.response.data.otp;
        return {
          success: false,
          error: Array.isArray(otpError) ? otpError[0] : String(otpError),
          requiresOtp: true,
        };
      }

      // CSRF failures sometimes come back as plain text/HTML; prefer a clear message.
      if (status === 403) {
        if (data?.detail) return { success: false, error: data.detail };
        if (typeof data === 'string' && data.toLowerCase().includes('csrf')) {
          return { success: false, error: 'CSRF token missing/invalid. Refresh the page and try again.' };
        }
        return { success: false, error: 'Request forbidden. Please refresh and try again.' };
      }

      // Invalid credentials in SimpleJWT typically return 401 with a helpful detail.
      if (status === 401) {
        return { success: false, error: data?.detail || 'Invalid username/email or password.' };
      }

      // Generic validation errors (DRF returns a dict of field errors)
      if (status === 400 && data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstVal = data[firstKey];
        const msg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
        return { success: false, error: msg || 'Login failed' };
      }

      return {
        success: false,
        error: data?.detail || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
