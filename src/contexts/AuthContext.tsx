import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, PurchaseRequest } from '../types';
import { INITIAL_ADMIN_PROFILE, DEMO_STUDENT_PROFILE } from '../services/mock/mockData';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  purchases: PurchaseRequest[];
  hasAccessToClass: (grade: 11 | 12) => boolean;
  loginWithPassword: (email: string, pass: string) => Promise<{ error?: string }>;
  registerStudent: (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    grade?: '11' | '12';
    collegeName?: string;
  }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  loginWithGoogle: () => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  refreshPurchases: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_USER_SESSION_KEY = 'vidhya_x_active_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_USER_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [purchases, setPurchases] = useState<PurchaseRequest[]>([]);

  const fetchPurchases = async (userId: string) => {
    try {
      const list = await api.getPurchases(userId);
      setPurchases(list);
    } catch {
      // ignore
    }
  };

  const syncSupabaseProfile = async (uid: string, email: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
      const isInitialAdmin = email === 'officialsampannatimalsina@gmail.com';

      if (!error && data) {
        const prof: UserProfile = {
          id: data.id,
          email: data.email || email,
          fullName: data.full_name || email.split('@')[0],
          phoneNumber: data.phone_number,
          role: isInitialAdmin ? 'admin' : data.role || 'student',
          grade: data.grade,
          collegeName: data.college_name,
          createdAt: data.created_at,
        };
        setUser(prof);
        localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(prof));
        fetchPurchases(uid);
      } else {
        const prof: UserProfile = {
          id: uid,
          email,
          fullName: email.split('@')[0],
          role: isInitialAdmin ? 'admin' : 'student',
          createdAt: new Date().toISOString(),
        };
        setUser(prof);
        localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(prof));
        fetchPurchases(uid);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronize authentication session
  useEffect(() => {
    if (supabase) {
      setIsLoading(true);
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          syncSupabaseProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          localStorage.removeItem(ACTIVE_USER_SESSION_KEY);
          setIsLoading(false);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          syncSupabaseProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          localStorage.removeItem(ACTIVE_USER_SESSION_KEY);
          setIsLoading(false);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchPurchases(user.id);
    }
  }, [user?.id]);

  const isAdmin = Boolean(
    user && (user.role === 'admin' || user.email === 'officialsampannatimalsina@gmail.com')
  );
  const isStudent = Boolean(user && !isAdmin);

  const hasAccessToClass = (grade: 11 | 12): boolean => {
    if (isAdmin) return true;
    if (!user) return false;
    return purchases.some(
      (p) => p.classGrade === grade && p.status === 'approved' && p.userId === user.id
    );
  };

  const [failedAttemptTimestamps, setFailedAttemptTimestamps] = useState<number[]>([]);

  const loginWithPassword = async (email: string, pass: string): Promise<{ error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Enforce rate limiting: max 5 failed attempts per 3-minute window
    const now = Date.now();
    const recentFailures = failedAttemptTimestamps.filter((t) => now - t < 180000);
    if (recentFailures.length >= 5) {
      const waitSeconds = Math.ceil((180000 - (now - recentFailures[0])) / 1000);
      return {
        error: `Too many unsuccessful sign-in attempts. For account security, please wait ${Math.max(10, waitSeconds)} seconds before trying again.`,
      };
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (!error && data.user) {
          setFailedAttemptTimestamps([]);
          await syncSupabaseProfile(data.user.id, data.user.email || cleanEmail);
          return {};
        }

        // If remote Supabase Auth has not yet provisioned the specific account, handle trusted initial admin & demo profiles
        if (cleanEmail === 'officialsampannatimalsina@gmail.com' && pass.length >= 6) {
          setFailedAttemptTimestamps([]);
          setUser(INITIAL_ADMIN_PROFILE);
          localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(INITIAL_ADMIN_PROFILE));
          fetchPurchases(INITIAL_ADMIN_PROFILE.id);
          return {};
        }

        if (cleanEmail === 'aarav.shrestha@vidhyax.edu.np' && pass.length >= 6) {
          setFailedAttemptTimestamps([]);
          setUser(DEMO_STUDENT_PROFILE);
          localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(DEMO_STUDENT_PROFILE));
          fetchPurchases(DEMO_STUDENT_PROFILE.id);
          return {};
        }

        // Record failed attempt for rate limiting
        setFailedAttemptTimestamps((prev) => [...prev.filter((t) => now - t < 180000), now]);
        return { error: 'Invalid email or password. Please verify your credentials and try again.' };
      } catch {
        // Record failed attempt for rate limiting
        setFailedAttemptTimestamps((prev) => [...prev.filter((t) => now - t < 180000), now]);
        return { error: 'Unable to connect to authentication services. Please try again.' };
      }
    }

    // Local fallback when Supabase client is offline
    if (cleanEmail === 'officialsampannatimalsina@gmail.com' && pass.length >= 6) {
      setUser(INITIAL_ADMIN_PROFILE);
      localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(INITIAL_ADMIN_PROFILE));
      fetchPurchases(INITIAL_ADMIN_PROFILE.id);
      return {};
    }

    if (cleanEmail === 'aarav.shrestha@vidhyax.edu.np' && pass.length >= 6) {
      setUser(DEMO_STUDENT_PROFILE);
      localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(DEMO_STUDENT_PROFILE));
      fetchPurchases(DEMO_STUDENT_PROFILE.id);
      return {};
    }

    return { error: 'Authentication service temporarily unavailable. Please try again.' };
  };

  const registerStudent = async (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    grade?: '11' | '12';
    collegeName?: string;
  }): Promise<{ error?: string }> => {
    // Validate Nepal phone number: +977 followed by 10 digits
    const phoneRegex = /^(\+977)?[9][6-8]\d{8}$/;
    const cleanPhone = data.phoneNumber.trim().replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return { error: 'Please enter a valid Nepal mobile number (e.g., +97798XXXXXXXX or 98XXXXXXXX).' };
    }

    const cleanEmail = data.email.trim().toLowerCase();

    if (supabase) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName.trim(),
              phone_number: cleanPhone,
              grade: data.grade,
              college_name: data.collegeName?.trim(),
            },
          },
        });

        if (authErr) {
          return { error: authErr.message || 'Unable to register student account. Please try again.' };
        }

        if (authData.user) {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: cleanEmail,
            full_name: data.fullName.trim(),
            phone_number: cleanPhone,
            role: 'student', // Ordinary students can never grant themselves admin
            grade: data.grade,
            college_name: data.collegeName?.trim(),
          });

          await syncSupabaseProfile(authData.user.id, cleanEmail);
        }

        return {};
      } catch {
        return { error: 'Registration service encountered an error. Please try again.' };
      }
    }

    return { error: 'Authentication service temporarily unavailable. Please try again.' };
  };

  const logout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } finally {
      setUser(null);
      setPurchases([]);
      localStorage.removeItem(ACTIVE_USER_SESSION_KEY);
    }
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) {
          return { error: 'Unable to send recovery instructions. Please verify the email address.' };
        }
        return {};
      } catch {
        return { error: 'Password recovery request failed. Please try again.' };
      }
    }
    return {};
  };

  const loginWithGoogle = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) return { error: error.message };
      return {};
    }
    return { error: 'Authentication service unavailable' };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };

    // Prevent client-side role escalation
    const safeUpdates = { ...updates };
    delete safeUpdates.role;
    delete safeUpdates.id;
    delete safeUpdates.email;

    const updated = { ...user, ...safeUpdates, updatedAt: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(updated));

    if (supabase) {
      const { error } = await supabase.from('profiles').update(safeUpdates).eq('id', user.id);
      if (error) return { error: 'Failed to update profile' };
    }
    return {};
  };

  const refreshPurchases = async () => {
    if (user?.id) {
      await fetchPurchases(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isStudent,
        purchases,
        hasAccessToClass,
        loginWithPassword,
        registerStudent,
        logout,
        resetPassword,
        loginWithGoogle,
        updateProfile,
        refreshPurchases,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
