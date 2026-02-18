import React, { createContext, useContext, useState, useEffect, JSX } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@auth:isLoggedIn';
const CLICKED_KEY = '@auth:hasClickedCard';

interface AuthContextValue {
  isLoggedIn: boolean;
  hasClickedCard: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  markCardClicked: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasClickedCard, setHasClickedCard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [loggedIn, clicked] = await Promise.all([
          AsyncStorage.getItem(AUTH_KEY),
          AsyncStorage.getItem(CLICKED_KEY),
        ]);
        setIsLoggedIn(loggedIn === 'true');
        setHasClickedCard(clicked === 'true');
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const login = async () => {
    await AsyncStorage.setItem(AUTH_KEY, 'true');
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([AUTH_KEY, CLICKED_KEY]);
    setIsLoggedIn(false);
    setHasClickedCard(false);
  };

  const markCardClicked = async () => {
    await AsyncStorage.setItem(CLICKED_KEY, 'true');
    setHasClickedCard(true);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, hasClickedCard, isLoading, login, logout, markCardClicked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}