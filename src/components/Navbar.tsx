import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, UserCircle2, LogOut, LayoutDashboard } from 'lucide-react';
import { AppView } from '../types';
import Logo from './Logo';
import { NotificationBell } from './NotificationCenter';
import { useAppContext } from '../context/AppContext';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onSignIn: () => void;
  onNotifClick?: () => void;
  notifOpen?: boolean;
}

export default function Navbar({ currentView, onNavigate, onSignIn, onNotifClick, notifOpen = false }: NavbarProps) {
  const { isAuthenticated, userName, userAvatar, signOut } = useAppContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Only the home view sits on top of the dark hero video
  const isOnHero = currentView === 'home';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll detection on view change
  useEffect(() => {
    setIsScrolled(false);
  }, [currentView]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks: { label: string; view: AppView }[] = [
    { label: 'Home', view: 'home' },
    { label: 'About', view: 'about' },
    { label: 'Calculate', view: 'calculate' },
    { label: 'Reduce', view: 'reduce' },
    { label: 'Learn', view: 'learn' },
    { label: 'Community', view: 'community' },
  ];

  const handleLinkClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
  };

  // Determine colour scheme
  const isTransparentMode = isOnHero && !isScrolled;

  // Shared avatar element
  const AvatarIcon = ({ size = 8 }: { size?: number }) =>
    userAvatar ? (
      <img
        src={userAvatar}
        alt={userName}
        referrerPolicy="no-referrer"
        className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-primary-green/30 flex-shrink-0`}
      />
    ) : (
      <span
        className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-primary-green to-accent-green flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0`}
        aria-hidden="true"
      >
        {userName.trim().charAt(0).toUpperCase()}
      </span>
    );

  return (
    <>
      <nav
        id="app-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(15,41,30,0.08)] border-b border-gray-100 py-2'
            : isOnHero
            ? 'bg-transparent py-4'
            : 'bg-white/85 backdrop-blur-md border-b border-[#e2ece8] py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div
              id="navbar-logo"
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleLinkClick('home')}
            >
              <Logo transparent={isTransparentMode} />
            </div>

            {/* Desktop Navigation Links */}
            <div id="desktop-links" className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = currentView === link.view;
                return (
                  <button
                    key={link.view}
                    onClick={() => handleLinkClick(link.view)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? isTransparentMode
                          ? 'text-white font-bold bg-white/10'
                          : 'text-primary-green font-bold bg-primary-green/6'
                        : isTransparentMode
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-primary-green hover:bg-gray-100/60'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={`absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full ${
                          isTransparentMode ? 'bg-white' : 'bg-primary-green'
                        }`}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Desktop CTA Buttons */}
            <div id="desktop-ctas" className="hidden md:flex items-center gap-3">
              {/* Notification bell */}
              {onNotifClick && (
                <NotificationBell
                  onClick={onNotifClick}
                  isOpen={notifOpen}
                  isTransparent={isTransparentMode}
                />
              )}

              {isAuthenticated ? (
                /* Profile dropdown */
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen((o) => !o)}
                    aria-label="Open profile menu"
                    aria-expanded={profileMenuOpen}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                      isTransparentMode
                        ? 'text-white/90 hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <AvatarIcon size={8} />
                    <span className="hidden lg:block max-w-[80px] truncate">{userName.split(' ')[0]}</span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''} ${isTransparentMode ? 'text-white/70' : 'text-gray-400'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50"
                      >
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                          <AvatarIcon size={9} />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                            <p className="text-[11px] text-gray-400 font-medium">Eco Member</p>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5 flex flex-col gap-0.5">
                          <button
                            onClick={() => handleLinkClick('profile')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-green transition-colors cursor-pointer text-left"
                          >
                            <UserCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            My Profile
                          </button>
                          <button
                            onClick={() => handleLinkClick('dashboard')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-green transition-colors cursor-pointer text-left"
                          >
                            <LayoutDashboard className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            Dashboard
                          </button>

                          <div className="h-px bg-gray-100 my-1" />

                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-left"
                          >
                            <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={onSignIn}
                  className={`text-sm font-bold transition-colors cursor-pointer ${
                    isTransparentMode
                      ? 'text-white/80 hover:text-white'
                      : 'text-gray-600 hover:text-primary-green'
                  }`}
                >
                  Sign In
                </button>
              )}

              <button
                onClick={() => handleLinkClick('dashboard')}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer ${
                  isTransparentMode
                    ? 'bg-white/15 backdrop-blur-sm text-white border border-white/25 hover:bg-white/25 shadow-none'
                    : 'bg-primary-green hover:bg-secondary-green text-white shadow-[0_4px_14px_rgba(22,163,74,0.25)] hover:shadow-[0_4px_22px_rgba(22,163,74,0.38)]'
                }`}
              >
                {isAuthenticated ? 'Dashboard' : 'Get Started'}
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => handleLinkClick('dashboard')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                  isTransparentMode
                    ? 'bg-white/15 text-white border border-white/25'
                    : 'bg-primary-green text-white'
                }`}
              >
                Get Started
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-menu"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isTransparentMode
                    ? 'text-white/80 hover:bg-white/10 hover:text-white'
                    : 'text-gray-600 hover:text-brand-dark hover:bg-gray-100'
                }`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 top-[70px] z-45 md:hidden bg-white/95 backdrop-blur-xl p-6 shadow-[0_12px_40px_rgba(15,41,30,0.1)] border-b border-[#e2ece8]"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const isActive = currentView === link.view;
                return (
                  <button
                    key={link.view}
                    onClick={() => handleLinkClick(link.view)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full text-left py-2.5 px-4 rounded-xl text-base font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-primary-green/8 text-primary-green font-bold'
                        : 'text-gray-600 hover:text-primary-green hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}

              <div className="h-px bg-gray-200 my-1" />

              {isAuthenticated ? (
                /* Authenticated mobile actions */
                <div className="flex flex-col gap-2">
                  {/* User row */}
                  <div className="flex items-center gap-3 px-2 py-1">
                    <AvatarIcon size={9} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{userName}</p>
                      <p className="text-[11px] text-gray-400 font-medium">Eco Member</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLinkClick('profile')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-primary-green transition-colors cursor-pointer"
                    >
                      <UserCircle2 className="w-4 h-4" aria-hidden="true" />
                      Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 bg-red-50 text-sm font-bold text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>

                  <button
                    onClick={() => handleLinkClick('dashboard')}
                    className="w-full py-2.5 rounded-xl bg-primary-green text-white font-bold text-sm shadow-[0_4px_14px_rgba(22,163,74,0.25)] cursor-pointer"
                  >
                    Dashboard →
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignIn();
                    }}
                    className="text-base font-bold text-gray-600 hover:text-primary-green transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleLinkClick('dashboard')}
                    className="px-5 py-2 rounded-xl bg-primary-green text-white font-bold text-sm shadow-[0_4px_14px_rgba(22,163,74,0.25)] cursor-pointer"
                  >
                    Dashboard →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
