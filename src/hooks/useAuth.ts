import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { RateLimiter, isValidEmail, sanitizeInput, createSecureError } from '../lib/security';
import { logFailedLogin, logSuccessfulLogin, logRateLimitExceeded } from '../lib/securityLogger';

export interface AuthUser {
  id: string;
  email: string | null;
}

// Rate limiter for login attempts (5 attempts per 15 minutes)
const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUser({ id: data.session.user.id, email: data.session.user.email || null });
        }
      } catch {
        // Silently handle session errors
      } finally {
        setLoading(false);
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || null });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Sanitize email input
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      const error = new Error('Invalid email format');
      logFailedLogin(sanitizedEmail, 'Invalid email format');
      throw error;
    }

    // Check rate limit
    const rateKey = `login_${sanitizedEmail}`;
    if (!loginRateLimiter.canProceed(rateKey)) {
      logRateLimitExceeded('login');
      const resetTime = Math.ceil(loginRateLimiter.getResetTime(rateKey) / 1000 / 60);
      throw new Error(`Too many login attempts. Please try again in ${resetTime} minutes.`);
    }

    // Record attempt
    loginRateLimiter.recordAttempt(rateKey);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        // Log failed login with generic reason
        logFailedLogin(sanitizedEmail, 'Invalid credentials');
        throw new Error('Invalid email or password. Please try again.');
      }

      // Success - reset rate limiter and log
      loginRateLimiter.reset(rateKey);
      logSuccessfulLogin(sanitizedEmail);

      return data;
    } catch (error: unknown) {
      // Use secure error messages
      const message = createSecureError(error, 'Authentication failed. Please try again.');
      throw new Error(message);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    // Sanitize and validate email
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());

    if (!isValidEmail(sanitizedEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    // Validate password length
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        // Use generic error message to prevent account enumeration
        throw new Error('Unable to create account. Please try again.');
      }

      return data;
    } catch (error: unknown) {
      const message = createSecureError(error, 'Unable to create account. Please try again.');
      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch {
      // Silently handle sign out errors
      setUser(null);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());

    if (!isValidEmail(sanitizedEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        // Generic message to prevent account enumeration
        throw new Error('If an account exists with this email, you will receive a password reset link.');
      }

      // Always return the same message to prevent account enumeration
      return 'If an account exists with this email, you will receive a password reset link.';
    } catch {
      return 'If an account exists with this email, you will receive a password reset link.';
    }
  }, []);

  const getRateLimitStatus = useCallback((email: string) => {
    const rateKey = `login_${email.trim().toLowerCase()}`;
    return {
      remaining: loginRateLimiter.getRemainingAttempts(rateKey),
      resetTime: loginRateLimiter.getResetTime(rateKey),
    };
  }, []);

  return { user, loading, signIn, signUp, signOut, resetPassword, getRateLimitStatus };
}
