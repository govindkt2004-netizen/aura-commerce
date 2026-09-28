import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'otp' | 'forgot';
  setAuthModalTab: (tab: 'login' | 'register' | 'otp' | 'forgot') => void;
  openAuthModal: (tab?: 'login' | 'register' | 'otp' | 'forgot') => void;
  login: (identifier: string, password?: string) => Promise<void>;
  loginWithOtp: (identifier: string, code: string, name?: string) => Promise<void>;
  adminLogin: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, phone?: string, password?: string) => Promise<void>;
  googleLogin: (name?: string, email?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name: string; phone?: string; avatar?: string }) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address>;
  intendedDestination: string | null;
  setIntendedDestination: (dest: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'otp' | 'forgot'>('login');
  const [intendedDestination, setIntendedDestination] = useState<string | null>(null);

  const openAuthModal = (tab: 'login' | 'register' | 'otp' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('aura_auth_token');

      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch {
          localStorage.removeItem('aura_auth_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password?: string) => {
    const res = await api.login(identifier, password);
    localStorage.setItem('aura_auth_token', res.token);
    localStorage.removeItem('aura_logged_out');
    setUser(res.user);
    setShowAuthModal(false);
  };

  const loginWithOtp = async (identifier: string, code: string, name?: string) => {
    const res = await api.verifyOtp(identifier, code, name);
    localStorage.setItem('aura_auth_token', res.token);
    localStorage.removeItem('aura_logged_out');
    setUser(res.user);
    setShowAuthModal(false);
  };

  const adminLogin = async (email: string, password?: string) => {
    const res = await api.adminLogin(email, password);
    localStorage.setItem('aura_auth_token', res.token);
    localStorage.removeItem('aura_logged_out');
    setUser(res.user);
    setShowAuthModal(false);
  };

  const register = async (name: string, email: string, phone?: string, password?: string) => {
    const res = await api.register(name, email, phone, password);
    localStorage.setItem('aura_auth_token', res.token);
    localStorage.removeItem('aura_logged_out');
    setUser(res.user);
    setShowAuthModal(false);
  };

  const googleLogin = async (name?: string, email?: string) => {
    const targetEmail = email || 'customer@aura.store';
    const targetName = name || targetEmail.split('@')[0];
    const res = await api.googleLogin(targetName, targetEmail);
    localStorage.setItem('aura_auth_token', res.token);
    localStorage.removeItem('aura_logged_out');
    setUser(res.user);
    setShowAuthModal(false);
  };

  const logout = () => {
    localStorage.removeItem('aura_auth_token');
    localStorage.setItem('aura_logged_out', 'true');
    setUser(null);
  };

  const updateProfile = async (data: { name: string; phone?: string; avatar?: string }) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    const res = await api.addAddress(address);
    setUser(res.user);
    return res.address;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        showAuthModal,
        setShowAuthModal,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        login,
        loginWithOtp,
        adminLogin,
        register,
        googleLogin,
        logout,
        updateProfile,
        addAddress,
        intendedDestination,
        setIntendedDestination
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
