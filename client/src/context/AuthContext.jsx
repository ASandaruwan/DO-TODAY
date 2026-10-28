import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('dt_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('dt_token') || localStorage.getItem('token') || null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('dt_token');
    localStorage.removeItem('token');
    localStorage.removeItem('dt_user');
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  // Listen for auto-logout event dispatched by Axios interceptor
  useEffect(() => {
    const handleAutoLogout = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleAutoLogout);
    return () => window.removeEventListener('auth:logout', handleAutoLogout);
  }, [logout]);

  // Load user profile on mount if token is present
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('dt_token') || localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('dt_user', JSON.stringify(response.data.user));
          setToken(storedToken);
        } else {
          logout();
        }
      } catch (err) {
        // If request fails (e.g. invalid or expired token), clear state
        console.error('Failed to verify token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [logout]);

  // Login action
  const login = async (username, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', {
        username: username.trim().toLowerCase(),
        password,
      });

      const { token: receivedToken, user: receivedUser } = response.data;
      localStorage.setItem('dt_token', receivedToken);
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('dt_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.msg) ||
        'Failed to log in. Please check your credentials.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Signup action
  const signup = async (userData) => {
    setError(null);
    try {
      const response = await api.post('/auth/signup', userData);
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('dt_token', receivedToken);
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('dt_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.msg) ||
        'Failed to create account. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Update current user locally
  const updateUser = (updatedData) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('dt_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    setError,
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

export default AuthContext;
