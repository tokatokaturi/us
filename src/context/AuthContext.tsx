import React, { createContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  googleLogin: (googleId: string, email: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Load token and user from cookie on mount
  useEffect(() => {
    const savedToken = Cookies.get('auth_token');
    if (savedToken) {
      setToken(savedToken);
      // Verify token
      verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });


      if (response.ok) {
        const userData = await response.json();
        setUser({
        id: userData.user_id,
        email: userData.email,
        name: userData.name,
        is_admin: userData.is_admin,
      });

      } else {
        // Token is invalid, clear it
        Cookies.remove('auth_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      Cookies.remove('auth_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      setToken(data.token);
      setUser({
        id: data.user_id,
        email: email,
        name: data.name || email,
        is_admin: data.is_admin,
      });
      
      Cookies.set('auth_token', data.token, { expires: 7 });
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      
      setToken(data.token);
      setUser({
        id: data.user_id,
        email: email,
        name: name,
        is_admin: false,
      });
      
      Cookies.set('auth_token', data.token, { expires: 7 });
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (googleId: string, email: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ google_id: googleId, email, name }),
      });

      if (!response.ok) {
        throw new Error('Google login failed');
      }

      const data = await response.json();
      
      setToken(data.token);
      setUser({
        id: data.user_id,
        email: email,
        name: name,
        is_admin: data.is_admin,
      });
      
      Cookies.set('auth_token', data.token, { expires: 7 });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('auth_token');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    signup,
    googleLogin,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  
  return context;
};
