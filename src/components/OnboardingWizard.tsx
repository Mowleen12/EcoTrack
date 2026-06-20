/**
 * OnboardingWizard — 3-step animated first-visit setup modal.
 * Collects: user name, sustainability goal, primary focus area.
 * Shown only when onboardingComplete is false.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Target, Zap, Car, ChefHat, ShoppingBag, Droplets, ArrowRight, Check, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { sanitizeText, validateDisplayName } from '../lib/sanitize';
import type { GoalTarget, CarbonCategory, OnboardingData } from '../types';

const GOALS: { id: GoalTarget; label: string; desc: string; emoji: string }[] = [
  { id: 'reduce_20', label: 'Reduce by 20%', desc: 'A great starting point — manageable changes with real impact.', emoji: '🌱' },
  { id: 'reduce_50', label: 'Cut in Half', desc: 'Ambitious but achievable with consistent daily habits.', emoji: '⚡' },
  { id: 'net_zero', label: 'Go Net Zero', desc: 'The ultimate goal — offset every tonne you produce.', emoji: '🌍' },
  { id: 'custom', label: 'Start Exploring', desc: 'Not sure yet? Start tracking and see where you stand.', emoji: '🧭' },
];

const FOCUS_AREAS: { id: CarbonCategory; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'Transport', label: 'Transport', icon: Car, desc: 'Cars, flights, and daily commuting' },
  { id: 'Energy', label: 'Home Energy', icon: Zap, desc: 'Electricity, heating, and cooling' },
  { id: 'Food', label: 'Food & Diet', icon: ChefHat, desc: 'What you eat and where it comes from' },
  { id: 'Lifestyle', label: 'Lifestyle', icon: ShoppingBag, desc: 'Shopping, consumption, and waste' },
  { id: 'Water', label: 'Water Use', icon: Droplets, desc: 'Daily water consumption habits' },
];

export default function OnboardingWizard({ onClose }: { onClose?: () => void }) {
  const { completeOnboarding } = useAppContext();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<GoalTarget | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<CarbonCategory | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLInputElement>(null);

  // Focus first element on mount
  useEffect(() => {
    firstFocusRef.current?.focus();
  }, [step]);

  // Trap focus inside modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validateStep1 = useCallback(() => {
    const validation = validateDisplayName(name);
    if (!validation.valid) {
      setNameError(validation.message);
      return false;
    }
    setNameError('');
    return true;
  }, [name]);

  const handleNext = useCallback(() => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !selectedGoal) return;
    setStep((s) => s + 1);
  }, [step, validateStep1, selectedGoal]);

  const handleFinish = useCallback(() => {
    if (!selectedFocus || !selectedGoal) return;
    const data: OnboardingData = {
      name: sanitizeText(name, 60),
      goal: selectedGoal,
      primaryFocus: selectedFocus,
      completedAt: new Date().toISOString(),
    };
    completeOnboarding(data);
  }, [name, selectedGoal, selectedFocus, completeOnboarding]);

  const TOTAL_STEPS = 3;
  const progress = ((step - 1) / TOTAL_STEPS) * 100;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-150 overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Setup progress">
          <motion.div
            className="h-full bg-primary-green rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-green to-accent-green flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-display font-bold text-[#0f291e]">CarbonWise</span>
            </div>
            <div className="text-xs font-mono text-gray-400 font-bold">
              Step {step}/{TOTAL_STEPS}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* ── STEP 1: NAME ──────────────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <h1
                  id="onboarding-title"
                  className="font-display font-black text-2xl sm:text-3xl text-[#0f291e] mb-2"
                >
                  Welcome to <span className="text-primary-green">CarbonWise</span> 🌿
                </h1>
                <p className="text-sm text-gray-500 font-semibold mb-8">
                  Your intelligent sustainability coach. Let's set up your profile in 60 seconds.
                </p>

                <div>
                  <label
                    htmlFor="onboarding-name"
                    className="text-[11px] uppercase font-mono text-gray-400 font-bold tracking-widest block mb-2"
                  >
                    What should we call you?
                  </label>
                  <input
                    id="onboarding-name"
                    ref={firstFocusRef}
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    placeholder="e.g. Alex Turner"
                    maxLength={60}
                    autoComplete="given-name"
                    aria-describedby={nameError ? 'name-error' : undefined}
                    aria-invalid={!!nameError}
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-[#0f291e] font-semibold focus:outline-none transition-colors ${
                      nameError
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary-green'
                    }`}
                  />
                  {nameError && (
                    <p id="name-error" className="text-xs text-red-500 font-semibold mt-1.5" role="alert">
                      {nameError}
                    </p>
                  )}
                </div>

                <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-150">
                  <p className="text-xs text-green-700 font-semibold">
                    🔒 Your data stays on your device. We never share personal information.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: GOAL ──────────────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-display font-black text-2xl text-[#0f291e] mb-2" id="onboarding-title">
                  What's your <span className="text-primary-green">sustainability goal</span>?
                </h2>
                <p className="text-sm text-gray-500 font-semibold mb-6">
                  Hi {sanitizeText(name) || 'there'}! Choose the goal that feels right for where you are.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-labelledby="onboarding-title">
                  {GOALS.map((goal) => {
                    const isSelected = selectedGoal === goal.id;
                    return (
                      <button
                        key={goal.id}
                        ref={goal.id === GOALS[0].id ? (firstFocusRef as React.RefObject<HTMLButtonElement>) : undefined}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedGoal(goal.id)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-green-50 border-primary-green shadow-sm'
                            : 'bg-white border-gray-200 hover:border-primary-green/30 hover:bg-green-50/30'
                        }`}
                      >
                        <div className="text-xl mb-2">{goal.emoji}</div>
                        <div className={`text-sm font-bold ${isSelected ? 'text-primary-green' : 'text-[#0f291e]'}`}>
                          {goal.label}
                        </div>
                        <div className="text-xs text-gray-400 font-semibold mt-0.5 leading-relaxed">
                          {goal.desc}
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-primary-green text-xs font-bold mt-2">
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Selected</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: FOCUS ─────────────────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-display font-black text-2xl text-[#0f291e] mb-2" id="onboarding-title">
                  Where's your biggest <span className="text-primary-green">impact area</span>?
                </h2>
                <p className="text-sm text-gray-500 font-semibold mb-6">
                  We'll tailor your recommendations to this area first.
                </p>

                <div className="grid grid-cols-1 gap-2.5" role="radiogroup" aria-labelledby="onboarding-title">
                  {FOCUS_AREAS.map((area, idx) => {
                    const Icon = area.icon;
                    const isSelected = selectedFocus === area.id;
                    return (
                      <button
                        key={area.id}
                        ref={idx === 0 ? (firstFocusRef as React.RefObject<HTMLButtonElement>) : undefined}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedFocus(area.id)}
                        className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-green-50 border-primary-green shadow-sm'
                            : 'bg-white border-gray-200 hover:border-primary-green/30 hover:bg-green-50/30'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary-green text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-bold ${isSelected ? 'text-primary-green' : 'text-[#0f291e]'}`}>
                            {area.label}
                          </div>
                          <div className="text-xs text-gray-400 font-semibold">{area.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-primary-green shrink-0" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={step === TOTAL_STEPS ? handleFinish : handleNext}
              disabled={step === 2 && !selectedGoal}
              aria-disabled={step === 2 && !selectedGoal}
              className="flex-1 py-3 rounded-xl bg-primary-green text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary-green transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {step === TOTAL_STEPS ? (
                <>
                  <Target className="w-4 h-4" aria-hidden="true" />
                  <span>Start My Journey</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          {step === 1 && (
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-3 py-2 text-xs text-gray-400 font-semibold hover:text-gray-600 transition-colors cursor-pointer"
            >
              Skip for now
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
