import React, { createContext, useContext, useState, useEffect, JSX } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@shared/lib/supabase';
import { apiClient } from '@shared/api/apiClient';
import { analysisApi } from '@features/analysis/store/analysisApi';
import { store } from '@shared/store';

const CLICKED_KEY = '@auth:hasClickedCard';

interface AuthContextValue {
  isLoggedIn: boolean;
  hasClickedCard: boolean;
  isLoading: boolean;
  justLoggedIn: boolean;
  session: Session | null;
  user: Session['user'] | null;
  isPremium: boolean;
  subscriptionPlan: string | null;
  subscriptionStatus: string;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  markCardClicked: () => Promise<void>;
  clearJustLoggedIn: () => void;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [hasClickedCard, setHasClickedCard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('none');

  const loadSubscription = async (accessToken: string) => {
    try {
      const status = await apiClient.getSubscriptionStatus(accessToken);
      setIsPremium(status.isPremium);
      setSubscriptionPlan(status.subscriptionPlan);
      setSubscriptionStatus(status.subscriptionStatus);
    } catch {
      // silently fail — subscription state stays as default
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        setSession(currentSession);

        const clicked = await AsyncStorage.getItem(CLICKED_KEY);
        setHasClickedCard(clicked === 'true');

        if (currentSession?.access_token) {
          await loadSubscription(currentSession.access_token);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.access_token) {
        loadSubscription(newSession.access_token);
      } else {
        setIsPremium(false);
        setSubscriptionPlan(null);
        setSubscriptionStatus('none');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    store.dispatch(analysisApi.util.invalidateTags(['Neighborhoods', 'Favorites']));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) setJustLoggedIn(true);
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
    store.dispatch(analysisApi.util.invalidateTags(['Neighborhoods', 'Favorites']));
    await supabase.auth.signOut();
    await AsyncStorage.clear();
    setHasClickedCard(false);
    setJustLoggedIn(false);
    setIsPremium(false);
    setSubscriptionPlan(null);
    setSubscriptionStatus('none');
  };

  const markCardClicked = async () => {
    await AsyncStorage.clear();
    setHasClickedCard(true);
  };

  const clearJustLoggedIn = () => setJustLoggedIn(false);

  const refreshSubscription = async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    if (currentSession?.access_token) {
      await loadSubscription(currentSession.access_token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!session,
        hasClickedCard,
        isLoading,
        justLoggedIn,
        session,
        user: session?.user ?? null,
        isPremium,
        subscriptionPlan,
        subscriptionStatus,
        login,
        signup,
        logout,
        markCardClicked,
        clearJustLoggedIn,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
