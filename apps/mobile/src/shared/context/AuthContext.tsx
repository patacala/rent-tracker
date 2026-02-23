import React, { createContext, useContext, useState, useEffect, JSX } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@shared/lib/supabase';

const CLICKED_KEY = '@auth:hasClickedCard';

interface AuthContextValue {
  isLoggedIn: boolean;
  hasClickedCard: boolean;
  isLoading: boolean;
  session: Session | null;
  user: Session['user'] | null;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  markCardClicked: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [hasClickedCard, setHasClickedCard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        const clicked = await AsyncStorage.getItem(CLICKED_KEY);
        setHasClickedCard(clicked === 'true');
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signup = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: 'https://heartfelt-muffin-54d184.netlify.app/',
      },
    });
    return { error: error?.message ?? null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(CLICKED_KEY);
    setHasClickedCard(false);
  };

  const markCardClicked = async () => {
    await AsyncStorage.setItem(CLICKED_KEY, 'true');
    setHasClickedCard(true);
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn: !!session,
      hasClickedCard,
      isLoading,
      session,
      user: session?.user ?? null,
      login,
      signup,
      logout,
      markCardClicked,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}