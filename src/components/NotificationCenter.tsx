/**
 * NotificationCenter — Slide-in drawer showing app notifications.
 * Triggered by bell icon in Navbar.
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCheck, Leaf, Trophy, Target, Flame, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { AppView, AppNotification, NotificationType } from '../types';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  milestone: { icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  recommendation: { icon: Leaf, color: 'text-primary-green', bg: 'bg-green-50 border-green-100' },
  challenge: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100' },
  streak: { icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  goal: { icon: Target, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
};

function formatTime(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return '';
  }
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
}

export default function NotificationCenter({ isOpen, onClose, onNavigate }: NotificationCenterProps) {
  const { notifications, unreadCount, markAllRead, markNotificationRead } = useAppContext();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape, trap focus
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleNotifClick = (notif: AppNotification) => {
    markNotificationRead(notif.id);
    if (notif.actionView) {
      onNavigate(notif.actionView);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={drawerRef}
            key="notif-drawer"
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Notification Center"
            className="fixed top-20 right-4 sm:right-6 z-50 w-[350px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-gray-150 shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-[#0f291e]" aria-hidden="true" />
                <h2 className="font-display font-bold text-base text-[#0f291e]">Notifications</h2>
                {unreadCount > 0 && (
                  <span
                    className="text-[10px] font-black font-mono bg-primary-green text-white px-1.5 py-0.5 rounded-full"
                    aria-label={`${unreadCount} unread`}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-semibold text-primary-green hover:text-secondary-green transition-colors cursor-pointer flex items-center gap-1"
                    aria-label="Mark all notifications as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>All read</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#0f291e] transition-colors cursor-pointer"
                  aria-label="Close notification center"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div
              className="flex-1 overflow-y-auto"
              role="log"
              aria-label="Notification list"
              aria-live="polite"
            >
              {notifications.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center px-6">
                  <Bell className="w-10 h-10 text-gray-200 mb-3" aria-hidden="true" />
                  <p className="text-sm text-gray-400 font-semibold">No notifications yet.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Complete your first calculator audit to get started.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {notifications.map((notif) => {
                    const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.recommendation;
                    const Icon = cfg.icon;
                    return (
                      <motion.li
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <button
                          type="button"
                          onClick={() => handleNotifClick(notif)}
                          className={`w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-green-50/40' : ''}`}
                          aria-label={`${notif.title}: ${notif.message}${!notif.read ? ' (unread)' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                            <Icon className={`w-4 h-4 ${cfg.color}`} aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-[#0f291e] leading-snug">{notif.title}</p>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-primary-green shrink-0 mt-1" aria-hidden="true" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 font-semibold leading-relaxed mt-0.5">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono font-bold mt-1.5">
                              {formatTime(notif.createdAt)}
                            </p>
                          </div>
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Bell icon button for Navbar with unread badge. */
export function NotificationBell({
  onClick,
  isOpen,
  isTransparent = false,
}: {
  onClick: () => void;
  isOpen: boolean;
  isTransparent?: boolean;
}) {
  const { unreadCount } = useAppContext();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
        isTransparent
          ? 'text-white/80 hover:text-white hover:bg-white/10'
          : 'text-gray-500 hover:text-[#0f291e] hover:bg-gray-100'
      } ${isOpen ? (isTransparent ? 'bg-white/15 text-white' : 'bg-gray-100 text-[#0f291e]') : ''}`}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      <Bell className="w-5 h-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center"
          aria-hidden="true"
        >
          {Math.min(unreadCount, 9)}{unreadCount > 9 ? '+' : ''}
        </span>
      )}
    </button>
  );
}
