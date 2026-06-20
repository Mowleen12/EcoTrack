import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Globe, Leaf, Users, TreePine } from 'lucide-react';
import { AppView } from '../types';

interface CollectiveImpactProps {
  onNavigate: (view: AppView) => void;
}

// Simple animated counter hook
function useCountUp(target: number, duration = 1600, decimals = 0) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  const start = () => {
    if (started.current) return;
    started.current = true;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.pow(step / steps, 0.5);
      const current = Math.min(target, target * progress);
      setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current));
      if (step >= steps) clearInterval(timer);
    }, interval);
  };

  return { value, start };
}

export default function CollectiveImpact({ onNavigate }: CollectiveImpactProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const co2 = useCountUp(12.5, 1600, 1);
  const trees = useCountUp(85000, 1600);
  const members = useCountUp(50000, 1600);
  const countries = useCountUp(120, 1400);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          co2.start(); trees.start(); members.start(); countries.start();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      id: 'co2',
      label: 'kg CO₂ Reduced',
      value: `${co2.value}M+`,
      icon: Leaf,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]',
    },
    {
      id: 'trees',
      label: 'Trees Planted',
      value: trees.value.toLocaleString() + '+',
      icon: TreePine,
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-100',
      glow: 'group-hover:shadow-[0_0_20px_rgba(22,163,74,0.12)]',
    },
    {
      id: 'members',
      label: 'Active Members',
      value: members.value.toLocaleString() + '+',
      icon: Users,
      color: 'text-teal-600',
      bg: 'bg-teal-50 border-teal-100',
      glow: 'group-hover:shadow-[0_0_20px_rgba(20,184,166,0.12)]',
    },
    {
      id: 'countries',
      label: 'Countries Active',
      value: `${countries.value}+`,
      icon: Globe,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="collective-impact-section"
      className="relative py-24 overflow-hidden border-b border-gray-100"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f3f7f5] via-white to-[#edf5f0]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-green/4 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-green/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-center">

          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col items-start text-left"
          >
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-primary-green font-extrabold tracking-widest uppercase mb-4 bg-primary-green/8 px-3 py-1 rounded-full border border-primary-green/15">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse" />
              Collective Climate Impact
            </span>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.6rem] text-[#0f291e] tracking-tight leading-[1.1] mb-5">
              Small Actions.<br />
              <span className="text-primary-green">Big Change.</span>
            </h2>

            <p className="text-gray-500 font-medium text-sm sm:text-base mb-8 max-w-md leading-relaxed">
              Every solar transition, public bus route, and sustainable meal adds to the global reduction counter. See how our community of active change agents are restoring the eco-balance.
            </p>

            <button
              onClick={() => onNavigate('dashboard')}
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#0f291e] hover:bg-primary-green text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-[0_4px_14px_rgba(15,41,30,0.12)] hover:shadow-[0_4px_20px_rgba(22,163,74,0.25)] hover:-translate-y-0.5"
            >
              <span>See Live Impact Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>

          {/* Right: Stats grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((st, i) => {
              const Icon = st.icon;
              return (
                <motion.div
                  key={st.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`group rounded-2xl bg-white border border-gray-100 px-6 py-6 text-left hover:border-primary-green/20 transition-all duration-300 ${st.glow}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${st.bg}`}>
                      <Icon className={`w-5 h-5 stroke-[1.8] ${st.color}`} />
                    </div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{st.label}</span>
                  </div>
                  <div className="text-[2.4rem] sm:text-[2.8rem] font-black font-display text-[#0f291e] tracking-tight leading-none mb-1">
                    {st.value}
                  </div>
                  <div className="text-[10px] font-semibold text-gray-300 mt-1">Verified offset tracker</div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
