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
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
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
