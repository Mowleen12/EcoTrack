/**
 * SustainabilityScoreCard — Animated radial gauge showing 0–100 score.
 * Used in both CalculatorSection results and DashboardSection overview.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Leaf, Star, TrendingUp } from 'lucide-react';
import type { SustainabilityScore } from '../types';

interface SustainabilityScoreCardProps {
  score: SustainabilityScore;
  /** If true, renders a compact version suitable for stat card areas */
  compact?: boolean;
}

const LABEL_CONFIG = {
  'Beginner':     { color: '#ef4444', bg: 'bg-red-50',    border: 'border-red-200',    icon: Leaf,      text: 'text-red-600' },
  'Aware':        { color: '#f59e0b', bg: 'bg-amber-50',  border: 'border-amber-200',  icon: TrendingUp, text: 'text-amber-600' },
  'Sustainable':  { color: '#22c55e', bg: 'bg-green-50',  border: 'border-green-200',  icon: Star,      text: 'text-green-600' },
  'Eco Champion': { color: '#16a34a', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Trophy,  text: 'text-emerald-700' },
} as const;

/** Returns the SVG arc path for a given percentage (0–100). */
function describeArc(cx: number, cy: number, r: number, pct: number): string {
  const startAngle = -200;
  const endAngle = startAngle + (pct / 100) * 220;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export default function SustainabilityScoreCard({ score, compact = false }: SustainabilityScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const cfg = LABEL_CONFIG[score.label];
  const Icon = cfg.icon;

  // Animate counter up on mount
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score.score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score.score]);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-4 rounded-xl ${cfg.bg} border ${cfg.border}`}
        role="img"
        aria-label={`Sustainability Score: ${score.score} out of 100. Label: ${score.label}`}
      >
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="28" cy="28" r="22" fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <motion.circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke={cfg.color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - score.score / 100)}`}
              initial={{ strokeDashoffset: `${2 * Math.PI * 22}` }}
              animate={{ strokeDashoffset: `${2 * Math.PI * 22 * (1 - score.score / 100)}` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-black font-display ${cfg.text}`}>{displayScore}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Eco Score</div>
          <div className={`text-sm font-extrabold ${cfg.text}`}>{score.label}</div>
          <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Top {100 - score.percentile}% globally</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm"
      role="region"
      aria-label="Sustainability Score Panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold mb-1">
            Your Sustainability Score
          </div>
          <h3 className="font-display font-extrabold text-xl text-[#0f291e]">
            Eco Performance Rating
          </h3>
        </div>
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center border ${cfg.border}`}>
          <Icon className={`w-5 h-5 ${cfg.text}`} aria-hidden="true" />
        </div>
      </div>

      {/* Radial Gauge */}
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div
          className="relative w-48 h-48 shrink-0"
          role="img"
          aria-label={`Score: ${score.score} out of 100`}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
            {/* Track */}
            <path
              d={describeArc(100, 100, 75, 100)}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Fill */}
            <motion.path
              d={describeArc(100, 100, 75, score.score)}
              fill="none"
              stroke={cfg.color}
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-4xl font-black font-display ${cfg.text}`}
              aria-live="polite"
            >
              {displayScore}
            </span>
            <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">/ 100</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4 flex-1 w-full">
          {/* Label badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${cfg.bg} border ${cfg.border} self-start`}>
            <Icon className={`w-4 h-4 ${cfg.text}`} aria-hidden="true" />
            <span className={`text-sm font-extrabold ${cfg.text}`}>{score.label}</span>
          </div>

          {/* Percentile */}
          <p className="text-sm text-gray-500 font-semibold leading-relaxed">
            You outperform{' '}
            <strong className={cfg.text}>{score.percentile}%</strong> of people globally.
            The 1.5°C climate target requires &lt;2 t CO₂/person/year.
          </p>

          {/* Score tiers */}
          <div className="grid grid-cols-4 gap-1.5" role="list" aria-label="Score tiers">
            {(['Beginner', 'Aware', 'Sustainable', 'Eco Champion'] as const).map((tier) => {
              const tierCfg = LABEL_CONFIG[tier];
              const isActive = tier === score.label;
              return (
                <div
                  key={tier}
                  role="listitem"
                  className={`text-center p-2 rounded-lg border text-[9px] font-bold uppercase font-mono transition-all ${
                    isActive
                      ? `${tierCfg.bg} ${tierCfg.border} ${tierCfg.text}`
                      : 'bg-gray-50 border-gray-100 text-gray-300'
                  }`}
                  aria-current={isActive ? 'true' : 'false'}
                >
                  {tier}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
