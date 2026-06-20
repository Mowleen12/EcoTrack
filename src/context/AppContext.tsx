/**
 * CarbonWise — Global Application Context
 * Provides shared state: calculator results, sustainability score,
 * recommendations, notifications, onboarding, goals, and auth state.
 *
 * Auth is powered by Supabase when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 * are configured. Falls back to localStorage-only mode when they are not.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type {
  CalculatorState,
  CalculatorResult,
  SustainabilityScore,
  Recommendation,
  UserGoal,
  OnboardingData,
  AppNotification,
  GoalTarget,
  CarbonCategory,
} from '../types';
import { computeSustainabilityScore, analyzeFootprint, computeBreakdown, computeTotalTonnes } from '../lib/decisionEngine';
import { readStorage, writeStorage, removeStorage } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchProfile,
  upsertProfile,
  fetchCalculatorResult,
  insertCalculatorResult,
  fetchGoals,
  upsertGoal,
  fetchNotifications,
  upsertNotification,
  markNotificationsReadInDB,
} from '../lib/supabaseService';

// ─── Context Shape ─────────────────────────────────────────────────────────────

interface AppContextValue {
  // Auth
  isAuthenticated: boolean;
  userName: string;
  userAvatar: string | null;
  userCreatedAt: string | null;
  userId: string | null;
  authLoading: boolean;
  authError: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  updateUserName: (name: string) => void;

  // Onboarding
  onboardingData: OnboardingData | null;
  onboardingComplete: boolean;
  completeOnboarding: (data: OnboardingData) => void;

  // Calculator
  calculatorResult: CalculatorResult | null;
  calculatorState: CalculatorState | null;
  saveCalculatorResult: (state: CalculatorState) => void;

  // Scoring & Recommendations
  sustainabilityScore: SustainabilityScore | null;
  recommendations: Recommendation[];

  // Goals
  userGoals: UserGoal[];
  addGoal: (goal: UserGoal) => void;
  updateGoalProgress: (goalId: string, currentTonnes: number) => void;

  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAllRead: () => void;
  markNotificationRead: (id: string) => void;

  // Backend info
  isSupabaseConfigured: boolean;
}

// ─── Default Context ───────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => readStorage<boolean>('isAuthenticated') ?? false,
  );
  const [userName, setUserName] = useState<string>(
    () => readStorage<string>('userName') ?? 'Alex Turner',
  );
  const [userAvatar, setUserAvatar] = useState<string | null>(
    () => readStorage<string>('userAvatar'),
  );
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(
    () => readStorage<string>('userCreatedAt'),
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [authError, setAuthError] = useState<string>('');

  // Onboarding
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(
    () => readStorage<OnboardingData>('onboardingData'),
  );

  // Calculator
  const [calculatorResult, setCalculatorResult] = useState<CalculatorResult | null>(
    () => readStorage<CalculatorResult>('calculatorResult'),
  );
  const [calculatorState, setCalculatorState] = useState<CalculatorState | null>(null);

  // Score & Recommendations
  const [sustainabilityScore, setSustainabilityScore] = useState<SustainabilityScore | null>(
    () => readStorage<SustainabilityScore>('sustainabilityScore'),
  );
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Goals
  const [userGoals, setUserGoals] = useState<UserGoal[]>(
    () => readStorage<UserGoal[]>('userGoals') ?? [],
  );

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(
    () => readStorage<AppNotification[]>('notifications') ?? [],
  );

  // Track if we've already loaded cloud data for the current user session
  const cloudLoadedForUser = useRef<string | null>(null);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const onboardingComplete = onboardingData !== null;
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Supabase Auth listener ─────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        writeStorage('isAuthenticated', true);
        // Restore Google avatar if present in metadata
        const avatar = session.user.user_metadata?.avatar_url as string | undefined;
        if (avatar) {
          setUserAvatar(avatar);
          writeStorage('userAvatar', avatar);
        }
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name as string | undefined;
        if (name) {
          setUserName(name);
          writeStorage('userName', name);
        }
        // Persist the real account creation timestamp
        if (session.user.created_at) {
          setUserCreatedAt(session.user.created_at);
          writeStorage('userCreatedAt', session.user.created_at);
        }
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        writeStorage('isAuthenticated', false);
      }
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
          writeStorage('isAuthenticated', true);
          // Pull name and avatar from Google (or any OAuth) user_metadata
          const avatar = session.user.user_metadata?.avatar_url as string | undefined;
          const name = (session.user.user_metadata?.full_name || session.user.user_metadata?.name) as string | undefined;
          if (avatar) {
            setUserAvatar(avatar);
            writeStorage('userAvatar', avatar);
          }
          if (name) {
            setUserName(name);
            writeStorage('userName', name);
          }
          // Persist the real account creation timestamp
          if (session.user.created_at) {
            setUserCreatedAt(session.user.created_at);
            writeStorage('userCreatedAt', session.user.created_at);
          }
        } else {
          setIsAuthenticated(false);
          setUserId(null);
          setUserAvatar(null);
          writeStorage('isAuthenticated', false);
          writeStorage('userAvatar', null);
          // Clear cloud-loaded state on sign-out
          cloudLoadedForUser.current = null;
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Load cloud data when userId is available ───────────────────────────────
  useEffect(() => {
    if (!userId || cloudLoadedForUser.current === userId) return;
    cloudLoadedForUser.current = userId;

    (async () => {
      // ── Reset all user-scoped state before loading so stale data from a
      //    previous session (or anonymous localStorage) never bleeds into
      //    a fresh / different account.
      setCalculatorResult(null);
      setCalculatorState(null);
      setSustainabilityScore(null);
      setRecommendations([]);
      setOnboardingData(null);
      setUserGoals([]);
      setNotifications([]);
      removeStorage('calculatorResult');
      removeStorage('sustainabilityScore');
      removeStorage('onboardingData');
      removeStorage('userGoals');
      removeStorage('notifications');

      // Profile & onboarding
      const profile = await fetchProfile(userId);
      if (profile) {
        const displayName = profile.name || userName;
        setUserName(displayName);
        writeStorage('userName', displayName);

        if (profile.onboarding_data) {
          setOnboardingData(profile.onboarding_data);
          writeStorage('onboardingData', profile.onboarding_data);
        }
      }

      // Calculator result
      const result = await fetchCalculatorResult(userId);
      if (result) {
        setCalculatorResult(result);
        writeStorage('calculatorResult', result);
      }

      // Goals
      const goals = await fetchGoals(userId);
      if (goals.length > 0) {
        setUserGoals(goals);
        writeStorage('userGoals', goals);
      }

      // Notifications
      const notifs = await fetchNotifications(userId);
      if (notifs.length > 0) {
        setNotifications(notifs);
        writeStorage('notifications', notifs);
      }
    })();
  }, [userId]);

  // ── Recompute score on calculatorState change ──────────────────────────────
  useEffect(() => {
    if (!calculatorState) return;
    const score = computeSustainabilityScore(calculatorState);
    const recs = analyzeFootprint(calculatorState);
    setSustainabilityScore(score);
    setRecommendations(recs);
    writeStorage('sustainabilityScore', score);
  }, [calculatorState]);

  // ── Persist notifications to localStorage ─────────────────────────────────
  useEffect(() => {
    writeStorage('notifications', notifications);
  }, [notifications]);

  // ── Persist goals to localStorage ─────────────────────────────────────────
  useEffect(() => {
    writeStorage('userGoals', userGoals);
  }, [userGoals]);

  // ── Auth Actions ──────────────────────────────────────────────────────────

  const clearAuthError = useCallback(() => setAuthError(''), []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      // Fallback: local-only sign-in (original demo behaviour)
      const localPart = email.split('@')[0].replace(/[._\-]/g, ' ');
      const displayName = localPart
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'CarbonWise User';
      setIsAuthenticated(true);
      setUserName(displayName);
      writeStorage('isAuthenticated', true);
      writeStorage('userName', displayName);
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    if (data.user) {
      // Name will be loaded from profile in the useEffect above
      const displayName = data.user.user_metadata?.name || email.split('@')[0];
      setUserName(displayName);
      writeStorage('userName', displayName);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!supabase) {
      // Fallback to local-only
      setIsAuthenticated(true);
      setUserName(name || 'CarbonWise User');
      writeStorage('isAuthenticated', true);
      writeStorage('userName', name || 'CarbonWise User');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setAuthLoading(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    // If email confirmation is required, data.user will be set but session won't be
    if (data.user && !data.session) {
      // Signal to the UI that confirmation email was sent
      setAuthError('__CHECK_EMAIL__');
    }
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setUserId(null);
    setUserAvatar(null);
    setUserCreatedAt(null);
    // Clear all user-scoped state so a subsequent sign-in of a different
    // account always starts from a clean slate.
    setCalculatorResult(null);
    setCalculatorState(null);
    setSustainabilityScore(null);
    setRecommendations([]);
    setOnboardingData(null);
    setUserGoals([]);
    setNotifications([]);
    cloudLoadedForUser.current = null;
    writeStorage('isAuthenticated', false);
    writeStorage('userAvatar', null);
    removeStorage('calculatorResult');
    removeStorage('sustainabilityScore');
    removeStorage('onboardingData');
    removeStorage('userGoals');
    removeStorage('notifications');
    removeStorage('userCreatedAt');
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      setAuthError('Google sign-in requires Supabase to be configured.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    setAuthLoading(false);
    if (error) setAuthError(error.message);
  }, []);

  const updateUserName = useCallback((name: string) => {
    const safeName = name.trim() || userName;
    setUserName(safeName);
    writeStorage('userName', safeName);
    if (userId) upsertProfile(userId, safeName);
  }, [userId, userName]);

  // ── Data Actions ──────────────────────────────────────────────────────────

  const completeOnboarding = useCallback((data: OnboardingData) => {
    setOnboardingData(data);
    writeStorage('onboardingData', data);

    if (userId) {
      upsertProfile(userId, userName, data);
    }

    // Auto-create initial goal from onboarding selection
    const targetMap: Record<GoalTarget, number> = {
      reduce_20: (calculatorResult?.totalTonnes ?? 4.5) * 0.8,
      reduce_50: (calculatorResult?.totalTonnes ?? 4.5) * 0.5,
      net_zero: 0,
      custom: (calculatorResult?.totalTonnes ?? 4.5) * 0.7,
    };
    const labelMap: Record<GoalTarget, string> = {
      reduce_20: 'Reduce footprint by 20%',
      reduce_50: 'Reduce footprint by 50%',
      net_zero: 'Achieve Net Zero',
      custom: 'Custom reduction goal',
    };

    const initialGoal: UserGoal = {
      id: `goal-${Date.now()}`,
      label: labelMap[data.goal],
      target: data.goal,
      targetTonnes: targetMap[data.goal],
      currentTonnes: calculatorResult?.totalTonnes ?? 4.5,
      createdAt: new Date().toISOString(),
      primaryFocus: data.primaryFocus as CarbonCategory,
    };
    setUserGoals([initialGoal]);
    if (userId) upsertGoal(userId, initialGoal);
  }, [calculatorResult, userId, userName]);

  const saveCalculatorResult = useCallback((state: CalculatorState) => {
    const breakdown = computeBreakdown(state);
    const totalTonnes = computeTotalTonnes(state);
    const result: CalculatorResult = {
      totalTonnes,
      breakdown: {
        transport: parseFloat((breakdown.transport / 1000).toFixed(2)),
        energy: parseFloat((breakdown.energy / 1000).toFixed(2)),
        food: parseFloat((breakdown.food / 1000).toFixed(2)),
        lifestyle: parseFloat((breakdown.lifestyle / 1000).toFixed(2)),
        water: parseFloat((breakdown.water / 1000).toFixed(2)),
      },
      calculatedAt: new Date().toISOString(),
    };
    setCalculatorResult(result);
    setCalculatorState(state);
    writeStorage('calculatorResult', result);

    if (userId) insertCalculatorResult(userId, result);

    // Update goal progress
    setUserGoals((prev) => {
      const updated = prev.map((g) => ({ ...g, currentTonnes: totalTonnes }));
      if (userId) updated.forEach((g) => upsertGoal(userId, g));
      return updated;
    });

    // Fire notification
    const score = computeSustainabilityScore(state);
    if (score.score >= 75) {
      addNotification({
        type: 'milestone',
        title: '🏆 Eco Champion Status!',
        message: `Your sustainability score is ${score.score}/100. You're in the top ${100 - score.percentile}% globally!`,
        actionView: 'dashboard',
      });
    } else {
      addNotification({
        type: 'recommendation',
        title: '✅ Footprint Calculated',
        message: `Your annual footprint is ${totalTonnes} t CO₂. Check your personalized recommendations.`,
        actionView: 'dashboard',
      });
    }
  }, [userId]);

  const addGoal = useCallback((goal: UserGoal) => {
    setUserGoals((prev) => [...prev, goal]);
    if (userId) upsertGoal(userId, goal);
  }, [userId]);

  const updateGoalProgress = useCallback((goalId: string, currentTonnes: number) => {
    setUserGoals((prev) => {
      const updated = prev.map((g) => (g.id === goalId ? { ...g, currentTonnes } : g));
      if (userId) {
        const changed = updated.find((g) => g.id === goalId);
        if (changed) upsertGoal(userId, changed);
      }
      return updated;
    });
  }, [userId]);

  const addNotification = useCallback(
    (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      const notification: AppNotification = {
        ...n,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev.slice(0, 49)]);
      if (userId) upsertNotification(userId, notification);
    },
    [userId],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      if (userId) {
        const unreadIds = prev.filter((n) => !n.read).map((n) => n.id);
        markNotificationsReadInDB(userId, unreadIds);
      }
      return updated;
    });
  }, [userId]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (userId) markNotificationsReadInDB(userId, [id]);
  }, [userId]);

  const value: AppContextValue = {
    isAuthenticated,
    userName,
    userAvatar,
    userCreatedAt,
    userId,
    authLoading,
    authError,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearAuthError,
    updateUserName,
    onboardingData,
    onboardingComplete,
    completeOnboarding,
    calculatorResult,
    calculatorState,
    saveCalculatorResult,
    sustainabilityScore,
    recommendations,
    userGoals,
    addGoal,
    updateGoalProgress,
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
    markNotificationRead,
    isSupabaseConfigured,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}
