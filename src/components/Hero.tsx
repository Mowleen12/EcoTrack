import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Compass, Leaf, ChevronDown } from 'lucide-react';
import { AppView } from '../types';

interface HeroProps {
  onNavigate: (view: AppView) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const ecoBg = new URL('../../assets/eco_bg.mp4', import.meta.url).href;

  return (
    <section
      id="hero-section"
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: '100dvh', minHeight: '600px' }}
    >
      {/* ── Full-bleed background video — fixed to exact viewport size ── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center center' }}
        >
          <source src={ecoBg} type="video/mp4" />
        </video>
        {/* Dark gradient overlay — keeps text legible without blurring the video */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />
      </div>

      {/* Decorative ambient colour blobs */}
      <div className="absolute top-1/4 -left-36 w-[500px] h-[500px] bg-emerald-500/8 rounded-full filter blur-[140px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-green-400/8 rounded-full filter blur-[120px] pointer-events-none z-10" />

      {/* ── Hero Content — centred, constrained to viewport ── */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold mb-7 border border-white/15"
        >
          <Sparkles className="w-3.5 h-3.5 fill-emerald-400/20" />
          <span>Sustainable Future Starts With You</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[4.25rem] tracking-tight text-white mb-6 leading-[1.08] drop-shadow-lg"
        >
          Track Your Footprint.{' '}
          <span className="text-emerald-400">Create a Greener</span> Tomorrow.
        </motion.h1>

        {/* Sub-description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="text-base sm:text-lg text-white/75 font-medium max-w-2xl mb-10 leading-relaxed"
        >
          Understand your impact. Take interactive carbon calculation audits. Apply daily
          carbon-reducing habit swaps and join our unified global climate movement.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <button
            onClick={() => onNavigate('calculate')}
            className="group px-8 py-4 rounded-xl bg-primary-green hover:bg-secondary-green text-white font-bold text-sm shadow-[0_6px_24px_rgba(22,163,74,0.35)] hover:shadow-[0_6px_32px_rgba(22,163,74,0.5)] flex items-center justify-center gap-2.5 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <span>Calculate Your Footprint</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => onNavigate('reduce')}
            className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold text-sm border border-white/20 hover:border-white/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Explore Tips</span>
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)] animate-pulse flex-shrink-0" />
          <div className="text-left">
            <div className="text-sm font-extrabold text-white">Join 50,000+ people</div>
            <div className="text-xs font-medium text-white/55">actively measuring and reducing emissions</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 ml-2">
            <Leaf className="w-4 h-4 fill-emerald-400/20" />
          </div>
        </motion.div>
      </div>

      {/* Scroll cue — bouncing chevron at bottom center */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-white/40 select-none pointer-events-none"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* Bottom fade that bleeds into the Features section */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#f3f7f5] to-transparent z-20 pointer-events-none" />
    </section>
  );
}
