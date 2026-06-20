import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from './types';

// Core providers & utilities
import { AppProvider, useAppContext } from './context/AppContext';

// Layout Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import CollectiveImpact from './components/CollectiveImpact';
import AboutSection from './components/AboutSection';
import CalculatorSection from './components/CalculatorSection';
import ReduceSection from './components/ReduceSection';
import LearnSection from './components/LearnSection';
import CommunitySection from './components/CommunitySection';
import DashboardSection from './components/DashboardSection';
import ProfileSection from './components/ProfileSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

// New feature components
import OnboardingWizard from './components/OnboardingWizard';

import NotificationCenter from './components/NotificationCenter';

// Icons
import { X, Mail, Lock, CheckCircle, Leaf, Eye, EyeOff, Loader2, User } from 'lucide-react';
import { validateEmail, validatePassword, sanitizeText } from './lib/sanitize';

// ─── Inner App (needs AppProvider as parent) ──────────────────────────────────

function AppInner() {
  const {
    onboardingComplete,
    signIn,
    signUp,
    signInWithGoogle,
    signOut: _signOut,
    authLoading,
    authError,
    clearAuthError,
    isAuthenticated,
    isSupabaseConfigured,
    unreadCount,
  } = useAppContext();

  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isSignInOpen, setIsSignInOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  // 'signin' | 'signup'
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');

  // Shared fields
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Field-level errors
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');

  // UI states
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const [checkEmail, setCheckEmail] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Redirect to dashboard after login (via modal)
  useEffect(() => {
    if (isAuthenticated && isSignInOpen) {
      setLoginSuccess(true);
      const t = setTimeout(() => {
        setLoginSuccess(false);
        setIsSignInOpen(false);
        setCurrentView('dashboard');
        resetForm();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, isSignInOpen]);

  // Always land authenticated users on dashboard (handles page refresh / OAuth redirect)
  // and send logged-out users back to home
  useEffect(() => {
    if (isAuthenticated && currentView === 'home') {
      setCurrentView('dashboard');
    } else if (!isAuthenticated) {
      setCurrentView('home');
    }
  }, [isAuthenticated]);

  // Sync authError → checkEmail flag
  useEffect(() => {
    if (authError === '__CHECK_EMAIL__') {
      setCheckEmail(true);
      clearAuthError();
    }
  }, [authError, clearAuthError]);

  // Show onboarding only for newly signed-in users who haven't completed it yet
  useEffect(() => {
    if (isAuthenticated && !onboardingComplete) {
      const timer = setTimeout(() => setShowOnboarding(true), 1500);
      return () => clearTimeout(timer);
    } else {
      // Logged-out visitors or users who already finished onboarding never see the wizard
      setShowOnboarding(false);
    }
  }, [isAuthenticated, onboardingComplete]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  // Close overlays on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setIsSignInOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const resetForm = () => {
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setCheckEmail(false);
    clearAuthError();
  };

  const switchTab = (tab: 'signin' | 'signup') => {
    setAuthTab(tab);
    resetForm();
  };

  const handleSignInSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      let hasError = false;

      if (!validateEmail(authEmail)) {
        setEmailError('Please enter a valid email address.');
        hasError = true;
      } else {
        setEmailError('');
      }

      const pwResult = validatePassword(authPassword);
      if (!pwResult.valid) {
        setPasswordError(pwResult.message);
        hasError = true;
      } else {
        setPasswordError('');
      }

      if (hasError) return;
      await signIn(authEmail, authPassword);
    },
    [authEmail, authPassword, signIn],
  );

  const handleSignUpSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      let hasError = false;

      const trimmedName = authName.trim();
      if (!trimmedName) {
        setNameError('Please enter your name.');
        hasError = true;
      } else {
        setNameError('');
      }

      if (!validateEmail(authEmail)) {
        setEmailError('Please enter a valid email address.');
        hasError = true;
      } else {
        setEmailError('');
      }

      const pwResult = validatePassword(authPassword);
      if (!pwResult.valid) {
        setPasswordError(pwResult.message);
        hasError = true;
      } else {
        setPasswordError('');
      }

      if (hasError) return;

      const displayName =
        sanitizeText(trimmedName, 60)
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') || 'CarbonWise User';

      await signUp(authEmail, authPassword, displayName);
    },
    [authEmail, authPassword, authName, signUp],
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'about':
        return (
          <motion.div key="about" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
            <AboutSection />
          </motion.div>
        );
      case 'calculate':
        return (
          <motion.div key="calculate" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
            <CalculatorSection />
          </motion.div>
        );
      case 'reduce':
        return (
          <motion.div key="reduce" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
            <ReduceSection />
          </motion.div>
        );
      case 'learn':
        return (
          <motion.div key="learn" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
            <LearnSection />
          </motion.div>
        );
      case 'community':
        return (
          <motion.div key="community" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
            <CommunitySection />
          </motion.div>
        );
      case 'dashboard':
        return (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
            <DashboardSection onNavigate={setCurrentView} />
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div key="profile" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
            <ProfileSection />
          </motion.div>
        );
      case 'home':
      default:
        return (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Hero onNavigate={setCurrentView} />
            <Features onNavigate={setCurrentView} />
            <CollectiveImpact onNavigate={setCurrentView} />
            <CTASection onNavigate={setCurrentView} />
          </motion.div>
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50/90 text-white font-sans overflow-x-hidden">
      {/* Skip to main content — WCAG 2.4.1 */}
      <a
        href="#app-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:bg-primary-green focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:font-bold focus:text-sm focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Sticky Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onSignIn={() => setIsSignInOpen(true)}
        onNotifClick={() => setNotifOpen((o) => !o)}
        notifOpen={notifOpen}
      />

      {/* Notification Center drawer */}
      <NotificationCenter
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        onNavigate={(view) => {
          setCurrentView(view);
          setNotifOpen(false);
        }}
      />

      {/* Main content */}
      <main id="app-main-content" className={`w-full ${currentView !== 'home' ? 'pt-16' : ''}`}>
        <AnimatePresence mode="wait">
          {renderCurrentView()}
        </AnimatePresence>
      </main>

      <Footer onNavigate={setCurrentView} />



      {/* Onboarding wizard on first visit */}
      <AnimatePresence>
        {showOnboarding && !onboardingComplete && (
          <OnboardingWizard onClose={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      {/* Sign In / Sign Up Modal */}
      <AnimatePresence>
        {isSignInOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white border border-green-100 p-6 sm:p-8 relative shadow-2xl text-left"
            >
              <button
                onClick={() => { setIsSignInOpen(false); resetForm(); }}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-green-50 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-green to-accent-green flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <h2 id="auth-modal-title" className="font-display font-bold text-lg text-gray-900">
                  CarbonWise Connect
                </h2>
              </div>

              {/* Success state */}
              {loginSuccess ? (
                <div className="py-10 text-center flex flex-col items-center gap-4" role="status" aria-live="polite">
                  <CheckCircle className="w-14 h-14 text-primary-green animate-bounce" aria-hidden="true" />
                  <div className="text-lg font-bold text-gray-900">Welcome back!</div>
                  <div className="text-xs text-primary-green font-semibold">Redirecting to your Dashboard…</div>
                </div>

              /* Email confirmation sent state */
              ) : checkEmail ? (
                <div className="py-8 text-center flex flex-col items-center gap-4" role="status" aria-live="polite">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary-green" aria-hidden="true" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">Check your inbox!</div>
                  <p className="text-sm text-gray-500 max-w-xs">
                    We've sent a confirmation link to <strong>{authEmail}</strong>. Click it to activate your account, then sign in.
                  </p>
                  <button
                    onClick={() => { setCheckEmail(false); setAuthTab('signin'); }}
                    className="text-sm font-semibold text-primary-green hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>

                ) : (
                <>
                  {/* Google Sign-In */}
                  {isSupabaseConfigured && (
                    <>
                      <button
                        type="button"
                        onClick={signInWithGoogle}
                        disabled={authLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60"
                      >
                        {/* Google SVG logo */}
                        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                          <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
                        </svg>
                        Continue with Google
                      </button>

                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    </>
                  )}

                  {/* Tab switcher */}
                  <div className="flex rounded-xl bg-gray-100 p-1 mb-5 gap-1">
                    <button
                      onClick={() => switchTab('signin')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                        authTab === 'signin'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => switchTab('signup')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                        authTab === 'signup'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Global auth error */}
                  {authError && authError !== '__CHECK_EMAIL__' && (
                    <div role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-semibold">
                      {authError}
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {authTab === 'signin' ? (
                      <motion.form
                        key="signin"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleSignInSubmit}
                        className="flex flex-col gap-4"
                        noValidate
                      >
                        {/* Email */}
                        <div>
                          <label htmlFor="signin-email" className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5">
                            Email Address <span aria-hidden="true">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2 z-10" aria-hidden="true" />
                            <input
                              id="signin-email"
                              type="email"
                              required
                              placeholder="alex@carbonwise.com"
                              value={authEmail}
                              onChange={(e) => { setAuthEmail(e.target.value); setEmailError(''); clearAuthError(); }}
                              aria-required="true"
                              aria-invalid={!!emailError}
                              maxLength={320}
                              autoComplete="email"
                              className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-4 text-sm text-gray-900 focus:outline-none transition-colors placeholder-gray-400 ${
                                emailError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-green focus:bg-white'
                              }`}
                            />
                          </div>
                          {emailError && <p role="alert" className="text-xs text-red-500 font-semibold mt-1.5">{emailError}</p>}
                        </div>

                        {/* Password */}
                        <div>
                          <label htmlFor="signin-password" className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5">
                            Password <span aria-hidden="true">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2 z-10" aria-hidden="true" />
                            <input
                              id="signin-password"
                              type={showPassword ? 'text' : 'password'}
                              required
                              placeholder="••••••••"
                              value={authPassword}
                              onChange={(e) => { setAuthPassword(e.target.value); setPasswordError(''); clearAuthError(); }}
                              aria-required="true"
                              aria-invalid={!!passwordError}
                              aria-describedby="signin-pw-hint"
                              maxLength={128}
                              autoComplete="current-password"
                              className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-12 text-sm text-gray-900 focus:outline-none transition-colors placeholder-gray-400 ${
                                passwordError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-green focus:bg-white'
                              }`}
                            />
                            <button type="button" onClick={() => setShowPassword((s) => !s)}
                              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}>
                              {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                            </button>
                          </div>
                          <p id="signin-pw-hint" className="text-[10px] text-gray-400 font-semibold mt-1.5">Minimum 6 characters.</p>
                          {passwordError && <p role="alert" className="text-xs text-red-500 font-semibold mt-1">{passwordError}</p>}
                        </div>

                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full py-3 mt-2 rounded-xl bg-primary-green text-white font-bold text-sm shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:bg-secondary-green transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {authLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : 'Sign In to CarbonWise'}
                        </button>

                        {!isSupabaseConfigured && (
                          <p className="text-center text-xs text-gray-400 font-semibold">
                            Demo mode: use any valid email &amp; password (6+ chars).
                          </p>
                        )}
                      </motion.form>
                    ) : (
                      <motion.form
                        key="signup"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleSignUpSubmit}
                        className="flex flex-col gap-4"
                        noValidate
                      >
                        {/* Name */}
                        <div>
                          <label htmlFor="signup-name" className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5">
                            Full Name <span aria-hidden="true">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2 z-10" aria-hidden="true" />
                            <input
                              id="signup-name"
                              type="text"
                              required
                              placeholder="Alex Turner"
                              value={authName}
                              onChange={(e) => { setAuthName(e.target.value); setNameError(''); }}
                              aria-required="true"
                              aria-invalid={!!nameError}
                              maxLength={60}
                              autoComplete="name"
                              className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-4 text-sm text-gray-900 focus:outline-none transition-colors placeholder-gray-400 ${
                                nameError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-green focus:bg-white'
                              }`}
                            />
                          </div>
                          {nameError && <p role="alert" className="text-xs text-red-500 font-semibold mt-1.5">{nameError}</p>}
                        </div>

                        {/* Email */}
                        <div>
                          <label htmlFor="signup-email" className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5">
                            Email Address <span aria-hidden="true">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2 z-10" aria-hidden="true" />
                            <input
                              id="signup-email"
                              type="email"
                              required
                              placeholder="alex@carbonwise.com"
                              value={authEmail}
                              onChange={(e) => { setAuthEmail(e.target.value); setEmailError(''); clearAuthError(); }}
                              aria-required="true"
                              aria-invalid={!!emailError}
                              maxLength={320}
                              autoComplete="email"
                              className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-4 text-sm text-gray-900 focus:outline-none transition-colors placeholder-gray-400 ${
                                emailError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-green focus:bg-white'
                              }`}
                            />
                          </div>
                          {emailError && <p role="alert" className="text-xs text-red-500 font-semibold mt-1.5">{emailError}</p>}
                        </div>

                        {/* Password */}
                        <div>
                          <label htmlFor="signup-password" className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5">
                            Password <span aria-hidden="true">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2 z-10" aria-hidden="true" />
                            <input
                              id="signup-password"
                              type={showPassword ? 'text' : 'password'}
                              required
                              placeholder="••••••••"
                              value={authPassword}
                              onChange={(e) => { setAuthPassword(e.target.value); setPasswordError(''); clearAuthError(); }}
                              aria-required="true"
                              aria-invalid={!!passwordError}
                              aria-describedby="signup-pw-hint"
                              maxLength={128}
                              autoComplete="new-password"
                              className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-12 text-sm text-gray-900 focus:outline-none transition-colors placeholder-gray-400 ${
                                passwordError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-green focus:bg-white'
                              }`}
                            />
                            <button type="button" onClick={() => setShowPassword((s) => !s)}
                              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}>
                              {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                            </button>
                          </div>
                          <p id="signup-pw-hint" className="text-[10px] text-gray-400 font-semibold mt-1.5">Minimum 6 characters.</p>
                          {passwordError && <p role="alert" className="text-xs text-red-500 font-semibold mt-1">{passwordError}</p>}
                        </div>

                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full py-3 mt-2 rounded-xl bg-primary-green text-white font-bold text-sm shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:bg-secondary-green transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {authLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</> : 'Create Account'}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Root App with Provider ───────────────────────────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
