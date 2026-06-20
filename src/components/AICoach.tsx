/**
 * AICoach — Floating AI Sustainability Coach panel.
 * Shows ranked recommendations from the decision engine.
 * Tabs: For You | Quick Wins | High Impact
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot, X, Sparkles, ChevronRight, Zap, TrendingUp, Star,
  Car, Leaf, ChefHat, ShoppingBag, Droplets
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { COST_INR_LABEL } from '../lib/currency';
import type { Recommendation, CarbonCategory } from '../types';

const CATEGORY_ICON: Record<CarbonCategory, React.ElementType> = {
  Transport: Car,
  Energy: Zap,
  Food: ChefHat,
  Lifestyle: ShoppingBag,
  Water: Droplets,
};

const DIFFICULTY_COLOR = {
  Easy: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Hard: 'bg-red-100 text-red-700 border-red-200',
};

const COST_COLOR = {
  Free: 'text-green-600',
  Low: 'text-emerald-600',
  Medium: 'text-amber-600',
  High: 'text-red-600',
};

type CoachTab = 'for-you' | 'quick-wins' | 'high-impact';

interface RecommendationCardProps {
  rec: Recommendation;
  rank: number;
}

function RecommendationCard({ rec, rank }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICON[rec.category] ?? Leaf;

  return (
    <motion.div
      layout
      className="rounded-xl border border-gray-150 bg-white overflow-hidden hover:border-primary-green/30 transition-colors"
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full p-4 text-left flex items-start gap-3 cursor-pointer"
        aria-expanded={expanded}
        aria-controls={`rec-details-${rec.id}`}
      >
        {/* Rank */}
        <div className="w-6 h-6 rounded-full bg-primary-green/10 flex items-center justify-center shrink-0 text-[10px] font-black text-primary-green font-mono">
          {rank}
        </div>

        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary-green" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#0f291e] leading-snug pr-4">{rec.title}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Impact score */}
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5" aria-label={`Impact: ${rec.impactScore} out of 10`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i < Math.round(rec.impactScore / 2) ? 'bg-primary-green' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400 font-mono font-bold">{rec.impactScore}/10</span>
            </div>

            {/* Difficulty */}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${DIFFICULTY_COLOR[rec.difficulty]}`}>
              {rec.difficulty}
            </span>

            {/* CO2 */}
            <span className="text-[10px] font-bold text-primary-green font-mono">
              -{rec.co2ReductionKg} kg CO₂/yr
            </span>
          </div>
        </div>

        <ChevronRight
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            id={`rec-details-${rec.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 flex flex-col gap-3 border-t border-gray-100">
              {/* Description */}
              <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-3">
                {rec.description}
              </p>

              {/* Why it matters */}
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="text-[10px] uppercase font-mono font-bold text-emerald-700 mb-1">
                  💡 Why this matters
                </div>
                <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
                  {rec.whyItMatters}
                </p>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="text-[9px] font-mono text-gray-400 uppercase font-bold">Cost</div>
                  <div className={`text-xs font-bold mt-0.5 ${COST_COLOR[rec.costEstimate]}`}>
                    {COST_INR_LABEL[rec.costEstimate] ?? rec.costEstimate}
                  </div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="text-[9px] font-mono text-gray-400 uppercase font-bold">Impact</div>
                  <div className="text-xs font-bold text-[#0f291e] mt-0.5">{rec.impactScore}/10</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="text-[9px] font-mono text-gray-400 uppercase font-bold">Timeline</div>
                  <div className="text-xs font-bold text-[#0f291e] mt-0.5">
                    {rec.timeframeDays < 7 ? `${rec.timeframeDays}d` : `${Math.round(rec.timeframeDays / 7)}w`}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AICoach() {
  const { recommendations, calculatorResult } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CoachTab>('for-you');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const getFilteredRecs = useCallback((): Recommendation[] => {
    if (!recommendations.length) return [];
    switch (activeTab) {
      case 'quick-wins':
        return recommendations.filter((r) => r.difficulty === 'Easy').slice(0, 6);
      case 'high-impact':
        return [...recommendations].sort((a, b) => b.impactScore - a.impactScore).slice(0, 6);
      case 'for-you':
      default:
        return recommendations.slice(0, 6);
    }
  }, [recommendations, activeTab]);

  const filteredRecs = getFilteredRecs();

  const TABS: { id: CoachTab; label: string; icon: React.ElementType }[] = [
    { id: 'for-you', label: 'For You', icon: Star },
    { id: 'quick-wins', label: 'Quick Wins', icon: Zap },
    { id: 'high-impact', label: 'High Impact', icon: TrendingUp },
  ];

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-primary-green to-accent-green text-white flex items-center justify-center shadow-[0_8px_25px_rgba(22,163,74,0.4)] hover:shadow-[0_8px_35px_rgba(22,163,74,0.55)] transition-shadow cursor-pointer"
        aria-label={isOpen ? 'Close AI Sustainability Coach' : 'Open AI Sustainability Coach'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-5 h-5" aria-hidden="true" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Bot className="w-6 h-6" aria-hidden="true" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse dot when recommendations available */}
        {recommendations.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute" />
          </span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            key="coach-panel"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="AI Sustainability Coach"
            className="fixed bottom-24 right-6 z-40 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl bg-white border border-gray-150 shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 140px)' }}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#0b2419] to-[#1c5039] text-white">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Bot className="w-4.5 h-4.5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-bold">AI Sustainability Coach</div>
                  <div className="text-[10px] text-emerald-300 font-mono font-bold">
                    {recommendations.length} personalized actions
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-300 font-mono font-bold">
                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                  <span>ACTIVE</span>
                </div>
              </div>

              {!calculatorResult && (
                <div className="p-2.5 rounded-lg bg-white/10 border border-white/15">
                  <p className="text-[11px] text-white/80 font-semibold leading-relaxed">
                    📊 Calculate your footprint first to get personalized recommendations tailored to your habits.
                  </p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-3 pt-2" role="tablist">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`coach-panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                      isActive
                        ? 'border-primary-green text-primary-green'
                        : 'border-transparent text-gray-400 hover:text-[#0f291e]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Recommendation list */}
            <div
              id={`coach-panel-${activeTab}`}
              role="tabpanel"
              className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5"
            >
              {filteredRecs.length === 0 ? (
                <div className="py-10 text-center">
                  <Leaf className="w-10 h-10 text-gray-200 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm text-gray-400 font-semibold">
                    {calculatorResult
                      ? 'No recommendations for this filter yet.'
                      : 'Complete the calculator to unlock AI recommendations.'}
                  </p>
                </div>
              ) : (
                filteredRecs.map((rec, i) => (
                  <RecommendationCard key={rec.id} rec={rec} rank={i + 1} />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 font-semibold text-center">
                Recommendations update after each calculator audit.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
