import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  transparent?: boolean; // white mode when on dark/video background
}

export default function Logo({ className = 'h-10', iconOnly = false, transparent = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className} selection:bg-transparent`}>
      {/* Custom Footprint-Leaf SVG */}
      <div
        className={`relative shrink-0 flex items-center justify-center transition-colors duration-300 ${
          transparent ? 'text-emerald-400' : 'text-primary-green'
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-9 h-9 select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(22,163,74,0.2)]"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M48 88C35 84 22 70 24 48C25 35 38 18 48 10C48 10 52 18 52 35C52 50 63 70 54 85C52.5 87.2 50.2 88 48 88Z" opacity="0.95" />
          <path d="M58 26C65 26 71 18 69 11C67 4 57 4 55 11C53 18 51 26 58 26Z" />
          <path d="M72 38C79 38 84 31 82 24C80 17 71 17 69 24C67 31 65 38 72 38Z" />
          <path d="M80 54C87 54 91 47 89 40C87 33 78 33 76 40C74 47 73 54 80 54Z" />
          <path d="M34 22C39 27 43 21 42 15C41.5 9 35 4 31.5 9C28 14 29 17 34 22Z" opacity="0.6" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left leading-none">
          <div
            className={`font-display font-black text-[1.35rem] tracking-tight transition-colors duration-300 flex items-center gap-0.5 ${
              transparent ? 'text-white' : 'text-brand-dark'
            }`}
          >
            Eco<span className={transparent ? 'text-emerald-400' : 'text-primary-green'}>Track</span>
          </div>
          <p
            className={`text-[8.5px] uppercase font-mono font-extrabold tracking-widest mt-0.5 transition-colors duration-300 ${
              transparent ? 'text-white/45' : 'text-[#0f291e]/45'
            }`}
          >
            Track Today, Protect Tomorrow
          </p>
        </div>
      )}
    </div>
  );
}
