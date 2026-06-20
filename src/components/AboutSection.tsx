import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Database, Users, Calendar, Globe, Sparkles } from 'lucide-react';

export default function AboutSection() {
  const values = [
    {
      title: 'Empowering Individuals',
      desc: 'We change global dynamics by giving every person the clarity, tracking, and habits they need to live eco-consciously.',
      icon: ShieldCheck,
      color: 'text-primary-green',
    },
    {
      title: 'Data-Driven Insights',
      desc: 'No guesswork. We rely on carbon algorithms, scientific regional baselines, and transparent audits to calculate precision footprints.',
      icon: Database,
      color: 'text-accent-green',
    },
    {
      title: 'Building Community',
      desc: 'A green future requires structured, cooperative efforts. We construct social spaces, group challenges, and corporate boards.',
      icon: Users,
      color: 'text-emerald-400',
    },
  ];

  return (
    <section id="about-section" className="relative py-24 bg-gradient-to-b from-white via-[#f3f7f5] to-white text-[#0f291e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-primary-green tracking-widest uppercase mb-3 block font-bold">WHO WE ARE</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#0f291e] tracking-tight leading-tight">
            About <span className="text-primary-green">CarbonWise</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-500 font-semibold font-display">
            "Making sustainability simple, accessible and impactful."
          </p>
        </div>

        {/* Layout Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          {/* Card left: Values */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            <h3 className="font-display font-bold text-2xl text-[#0f291e] mb-2">Our Core Philosophies</h3>
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-150 hover:border-primary-green/25 hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary-green" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg text-[#0f291e] mb-1.5">{val.title}</h4>
                    <p className="text-sm text-gray-500 font-semibold leading-relaxed">{val.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Card right: Beautiful Earth Graphic Card closely matching reference image */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative w-full max-w-lg rounded-[32px] bg-gradient-to-tr from-[#0b2419] to-[#1c5039] p-8 overflow-hidden flex flex-col justify-between aspect-square border border-[#16422d] group shadow-xl"
            >
              {/* Outer halo */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-radial from-emerald-500/20 to-transparent filter blur-2xl group-hover:scale-110 transition-transform duration-500" />

              <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#74c69d]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Restore Balance</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-250/40">WORLD AUDIT_2026</div>
              </div>

              {/* Vector Central Earth (Rendered as beautiful CSS artwork) */}
              <div className="flex-1 flex items-center justify-center relative select-none">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  className="w-48 h-48 rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.25)] border border-emerald-400/20"
                >
                  {/* Styled Continental SVGs / Abstract circles inside */}
                  <div className="absolute -top-4 -right-2 w-20 h-20 rounded-full bg-primary-green/30 filter blur-sm" />
                  <div className="absolute bottom-6 -left-4 w-28 h-20 rounded-full bg-emerald-600/30 filter blur-sm" />
                  <div className="absolute top-8 left-8 w-16 h-12 rounded-full bg-accent-green/20 filter blur-sm" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="w-36 h-36 text-accent-green opacity-40 animate-pulse stroke-[1.25]" />
                  </div>
                </motion.div>
                {/* Floating environmental leaves decor */}
                <div className="absolute top-12 left-12 w-6 h-6 rounded-full bg-primary-green/10 flex items-center justify-center border border-primary-green/20 animate-bounce">
                  <LeafIcon className="w-3 h-3 text-primary-green" />
                </div>
                <div className="absolute bottom-16 right-10 w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center border border-accent-green/20 animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <LeafIcon className="w-4 h-4 text-[#74c69d]" />
                </div>
              </div>

              {/* Card Meta details */}
              <div className="mt-auto block text-left z-10 bg-black/30 p-4 rounded-2xl border border-white/5">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-green animate-pulse" />
                  CarbonWise Active Node
                </h4>
                <p className="text-xs text-[#a3cebc] mt-1 font-medium">Connecting localized carbon actions with dynamic cloud metrics.</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Dynamic Journey Stats strip (Exactly as reference image) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[24px] bg-white border border-gray-150 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 shadow-sm"
        >
          <div className="text-center">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1 font-bold">
              <Calendar className="w-3.5 h-3.5 text-primary-green" />
              Our Journey
            </div>
            <div className="text-2xl font-black font-display text-[#0f291e]">Since 2022</div>
          </div>
          <div className="text-center border-l border-gray-150">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Active Users</div>
            <div className="text-2xl font-black font-display text-primary-green">50K+</div>
          </div>
          <div className="text-center border-l border-gray-150">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Countries</div>
            <div className="text-2xl font-black font-display text-primary-green">120+</div>
          </div>
          <div className="text-center border-l border-gray-150">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">CO₂ Reduced</div>
            <div className="text-2xl font-black font-display text-primary-green">1.2M+ kg</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Simple internal SVG inline leaf for micro art
function LeafIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.5 0 8.5C17 14 14 17 11 20z" />
      <path d="M19 2c-2.26 4.33-5.27 7.14-8 10" />
    </svg>
  );
}
