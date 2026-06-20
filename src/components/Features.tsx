import React from 'react';
import { motion } from 'motion/react';
import { Calculator, LineChart, Leaf, Trophy, ArrowRight } from 'lucide-react';
import { AppView } from '../types';

interface FeaturesProps {
  onNavigate: (view: AppView) => void;
}

export default function Features({ onNavigate }: FeaturesProps) {
  const cards = [
    {
      id: 'calculate',
      icon: Calculator,
      title: 'Calculate',
      desc: 'Measure your carbon footprint in minutes with our precision audit tools.',
      view: 'calculate' as AppView,
      gradient: 'from-green-50 to-emerald-50/60',
      iconBg: 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700',
      accent: 'group-hover:text-green-600',
    },
    {
      id: 'understand',
      icon: LineChart,
      title: 'Understand',
      desc: 'Get personalised charts and actionable insights about your habits.',
      view: 'dashboard' as AppView,
      gradient: 'from-emerald-50 to-teal-50/60',
      iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700',
      accent: 'group-hover:text-emerald-600',
    },
    {
      id: 'reduce',
      icon: Leaf,
      title: 'Reduce',
      desc: 'Discover proven daily habit swaps to shrink your environmental impact.',
      view: 'reduce' as AppView,
      gradient: 'from-green-50 to-lime-50/60',
      iconBg: 'bg-gradient-to-br from-green-100 to-lime-100 text-green-700',
      accent: 'group-hover:text-green-600',
    },
    {
      id: 'impact',
      icon: Trophy,
      title: 'Make Impact',
      desc: 'Track progress, earn badges, and inspire your community to act.',
      view: 'community' as AppView,
      gradient: 'from-amber-50/50 to-emerald-50/60',
      iconBg: 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-700',
      accent: 'group-hover:text-amber-600',
    },
  ];

  return (
    <section
      id="features-strip-section"
      className="relative py-16 bg-white border-b border-gray-100 overflow-hidden"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(22,163,74,0.04),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-primary-green tracking-widest uppercase font-extrabold bg-primary-green/8 px-3 py-1 rounded-full border border-primary-green/15">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse" />
            How It Works
          </span>
          <h2 className="mt-3 font-display font-extrabold text-2xl sm:text-3xl text-[#0f291e] tracking-tight">
            Everything you need to go <span className="text-primary-green">net-zero</span>
          </h2>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.09 }}
                onClick={() => {
                  onNavigate(card.view);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`group relative rounded-2xl border border-gray-100 p-6 bg-gradient-to-br ${card.gradient} hover:border-primary-green/20 hover:shadow-[0_8px_30px_rgba(22,163,74,0.07)] transition-all duration-300 cursor-pointer flex flex-col gap-4 overflow-hidden`}
              >
                {/* Hover shimmer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-primary-green/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm ${card.iconBg}`}>
                  <Icon className="w-5.5 h-5.5 stroke-[2]" />
                </div>

                <div className="flex-1">
                  <h3 className={`font-display font-extrabold text-[#0f291e] text-base mb-1.5 transition-colors ${card.accent}`}>
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                {/* Subtle arrow indicator */}
                <div className="flex items-center gap-1 text-primary-green opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0 text-xs font-bold">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
