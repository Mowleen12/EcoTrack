import React, { useState } from 'react';
import { Github, Twitter, Instagram, Linkedin, Send, Check } from 'lucide-react';
import { AppView } from '../types';
import Logo from './Logo';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => {
      setSubscribed(false);
    }, 4000);
  };

  const currentYear = 2026;

  const quickLinks: { label: string; view: AppView }[] = [
    { label: 'Home Page', view: 'home' },
    { label: 'About Us', view: 'about' },
    { label: 'Risk Calculators', view: 'calculate' },
    { label: 'Our Reduce Tips', view: 'reduce' },
    { label: 'Community Feed', view: 'community' },
  ];

  return (
    <footer id="app-footer" className="relative bg-[#f8fbf9] pt-20 pb-10 border-t border-[#e2ece8] select-none text-left font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Col 1: Logo & Statement */}
          <div className="md:col-span-4 flex flex-col items-start">
            <div className="mb-4 cursor-pointer" onClick={() => onNavigate('home')}>
              <Logo />
            </div>
            
            <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-sm font-semibold">
              Empowering global change agents with accurate carbon calculations, personalized micro-action swaps, and collaborative community boards.
            </p>

            {/* Social Links info */}
            <div className="flex gap-3">
              {[
                { icon: Twitter, url: '#' },
                { icon: Instagram, url: '#' },
                { icon: Linkedin, url: '#' },
                { icon: Github, url: '#' }
              ].map((soc, inx) => {
                const Icon = soc.icon;
                return (
                  <a
                    key={inx}
                    href={soc.url}
                    className="w-10 h-10 rounded-xl bg-white hover:bg-primary-green hover:text-white text-gray-500 border border-gray-150 shadow-sm transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-2 flex flex-col items-start">
            <h4 className="text-xs uppercase font-mono text-[#0f291e] font-extrabold tracking-wider mb-4">Quick Links</h4>
            <div className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <button
                  key={link.view}
                  onClick={() => {
                    onNavigate(link.view);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-sm text-gray-500 font-semibold hover:text-primary-green transition-colors cursor-pointer text-left font-normal"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Resources */}
          <div className="md:col-span-2 flex flex-col items-start">
            <h4 className="text-xs uppercase font-mono text-[#0f291e] font-extrabold tracking-wider mb-4">Resources</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Climate Blog', view: 'learn' },
                { label: 'Active Guides', view: 'learn' },
                { label: 'API Integrations', view: 'home' },
                { label: 'Press Kit Room', view: 'home' }
              ].map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onNavigate(res.view as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-sm text-gray-500 font-semibold hover:text-primary-green transition-colors cursor-pointer text-left font-normal"
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 4: Newsletter Subscription form */}
          <div className="md:col-span-4 flex flex-col items-start">
            <h4 className="text-xs uppercase font-mono text-[#0f291e] font-extrabold tracking-wider mb-4">Newsletter</h4>
            <p className="text-xs text-gray-500 font-semibold mb-4 leading-relaxed">
              Subscribe to get curated daily offsets, community progress alerts, and climate technology reviews.
            </p>

            <form onSubmit={handleSubscribe} className="relative w-full flex gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-[#0f291e] placeholder-gray-400 focus:outline-none focus:border-primary-green transition-all"
              />
              <button
                type="submit"
                className="p-3.5 rounded-xl bg-primary-green text-white font-bold cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {subscribed && (
              <div className="flex items-center gap-2 text-xs text-primary-green font-semibold mt-3 animate-pulse bg-green-50 py-1.5 px-3 rounded-lg border border-primary-green/20 font-bold">
                <Check className="w-4 h-4" />
                <span>Thank you! Subscribed successfully.</span>
              </div>
            )}
          </div>

        </div>

        <div className="h-px bg-gray-200 my-8" />

        {/* Bottom row copyrights */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium">
          <div>
            &copy; {currentYear} EcoTrack. All rights reserved.
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-green transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-green transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-green transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
