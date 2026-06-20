import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Leaf, Sparkles } from 'lucide-react';
import { AppView } from '../types';

interface CTAProps {
  onNavigate: (view: AppView) => void;
}

export default function CTASection({ onNavigate }: CTAProps) {
  return (
    <section id="cta-banner-section" className="relative py-20 bg-white select-none overflow-hidden">
      {/* Soft page background blob */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(22,163,74,0.04),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[32px] p-10 sm:p-16 overflow-hidden shadow-[0_20px_60px_rgba(11,36,25,0.25)] bg-gradient-to-br from-[#071a10] via-[#0f2e1a] to-[#1a4d2e] flex flex-col items-center text-center"
        >
          {/* Layered ambient glows */}
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-emerald-500/12 rounded-full filter blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-400/10 rounded-full filter blur-[80px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-green/5 rounded-full filter blur-[120px] pointer-events-none" />

          {/* Grid texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,0.5) 24px,rgba(255,255,255,0.5) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,0.5) 24px,rgba(255,255,255,0.5) 25px)',
            }}
          />

          {/* Floating decoration */}
          <div className="absolute top-8 right-10 opacity-10 animate-spin" style={{ animationDuration: '50s' }}>
            <Leaf className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="absolute bottom-10 left-10 opacity-10 animate-spin" style={{ animationDuration: '35s', animationDirection: 'reverse' }}>
            <Sparkles className="w-8 h-8 text-emerald-300" />
          </div>

          {/* Content */}
          <span className="relative z-10 inline-flex items-center gap-2 text-[10px] font-mono font-extrabold text-emerald-400 tracking-widest uppercase mb-5 bg-white/6 py-1.5 px-4 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Act Today For Tomorrow
          </span>

          <h2 className="relative z-10 font-display font-black text-3xl sm:text-5xl text-white tracking-tight mb-5 max-w-2xl leading-[1.1]">
            Ready to make a{' '}
            <span className="text-emerald-400">real difference?</span>
          </h2>

          <p className="relative z-10 text-emerald-100/60 font-medium text-sm sm:text-base max-w-lg mb-10 leading-relaxed">
            Join thousands of daily active change agents measuring, understanding, and actively offsetting carbon emissions. Your impact starts with a single step.
          </p>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={() => {
                onNavigate('calculate');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group px-8 py-4 rounded-xl bg-white hover:bg-gray-50 text-[#0f291e] font-bold text-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center gap-2.5 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowUpRight className="w-4 h-4 text-primary-green group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={() => {
                onNavigate('community');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-xl bg-white/8 hover:bg-white/14 text-white font-bold text-sm border border-white/15 hover:border-white/25 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
            >
              Explore Community →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
