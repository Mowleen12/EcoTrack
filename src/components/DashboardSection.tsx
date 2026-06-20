import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import {
  LayoutDashboard, Trophy, Brain, Settings, ArrowDown, Flame, Leaf,
  ChevronRight, Award, Check, Sparkles, Target, TrendingUp,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import SustainabilityScoreCard from './SustainabilityScoreCard';
import type { AppView } from '../types';
import { COST_INR_LABEL } from '../lib/currency';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const COST_COLOR: Record<string, string> = {
  Free: 'text-green-600',
  Low: 'text-emerald-600',
  Medium: 'text-amber-600',
  High: 'text-red-600',
};

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Hard: 'bg-red-100 text-red-700 border-red-200',
};

export default function DashboardSection({ onNavigate }: DashboardProps) {
  const {
    userName, calculatorResult, sustainabilityScore, recommendations,
    userGoals, notifications, addNotification,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'Overview' | 'Impact' | 'AI Insights' | 'Challenges' | 'Settings'>('Overview');
  const [showToast, setShowToast] = useState<string | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());

  // Use real data when available, fallback to demo data
  const totalTonnes = calculatorResult?.totalTonnes ?? 1.8;
  const breakdown = calculatorResult?.breakdown ?? {
    transport: 0.63, energy: 0.50, food: 0.37, lifestyle: 0.22, water: 0.08,
  };

  // Monthly trend (simulated downward curve based on actual footprint)
  const lineData = [
    { name: 'Jan', emissions: +(totalTonnes * 1.22).toFixed(1) },
    { name: 'Feb', emissions: +(totalTonnes * 1.11).toFixed(1) },
    { name: 'Mar', emissions: +(totalTonnes * 1.06).toFixed(1) },
    { name: 'Apr', emissions: +(totalTonnes * 1.00).toFixed(1) },
    { name: 'May', emissions: +(totalTonnes * 1.00).toFixed(1) },
    { name: 'Jun', emissions: +(totalTonnes * 0.89).toFixed(1) },
  ];

  const pieData = [
    { name: 'Transport', value: breakdown.transport, color: '#16a34a' },
    { name: 'Home Energy', value: breakdown.energy, color: '#15803d' },
    { name: 'Food & Diet', value: breakdown.food, color: '#22c55e' },
    { name: 'Lifestyle', value: breakdown.lifestyle, color: '#34d399' },
    { name: 'Water', value: breakdown.water, color: '#6ee7b7' },
  ];

  const recentActivities = [
    { id: 1, title: calculatorResult ? 'Completed Carbon Audit' : 'Calculator Audit Pending', date: calculatorResult?.calculatedAt ? new Date(calculatorResult.calculatedAt).toLocaleDateString() : 'Not yet', points: calculatorResult ? '+50 pts' : '' },
    { id: 2, title: 'Used Public Transport Commute', date: 'May 19, 2026', points: '+20 pts' },
    { id: 3, title: 'Planted 3 Certified Tree Sprouts', date: 'May 18, 2026', points: '+30 pts' },
  ];

  const sidebarItems = [
    { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'Impact', label: 'My Impact', icon: Trophy },
    { id: 'AI Insights', label: 'AI Insights', icon: Sparkles },
    { id: 'Challenges', label: 'Challenges', icon: Brain },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  const challenges = [
    { id: 0, title: 'Zero Carbon Commuting Week', desc: 'Transit solely on walking, bikes, or electric mass transit.', points: 250, category: 'Transport' },
    { id: 1, title: 'Plastic Waste Elimination', desc: 'Refuse single-use beverage bottles and non-reusable plastics for 7 days.', points: 150, category: 'Lifestyle' },
    { id: 2, title: 'Plant-Based Meals (5 Days)', desc: 'Eat organic plant recipes for 5 successive days.', points: 200, category: 'Food' },
    { id: 3, title: 'Energy-Saving Week', desc: 'Reduce electricity bill by 20% this month using smart habits.', points: 300, category: 'Energy' },
  ];

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleJoinChallenge = (challenge: typeof challenges[0]) => {
    if (completedChallenges.has(challenge.id)) return;
    setCompletedChallenges((prev) => new Set([...prev, challenge.id]));
    addNotification({
      type: 'challenge',
      title: `🏅 Challenge Joined: ${challenge.title}`,
      message: `You'll earn +${challenge.points} pts on completion. Good luck!`,
      actionView: 'dashboard',
    });
    triggerToast(`Challenge joined! +${challenge.points} pts on completion.`);
  };

  const displayName = userName.split(' ')[0] || 'there';

  return (
    <section
      id="dashboard-section"
      className="relative py-24 bg-gradient-to-b from-[#f3f7f5] via-white to-[#f4f8f6] text-[#0f291e] text-left"
      aria-label="User Dashboard"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              role="status"
              aria-live="polite"
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f291e] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-white/10 font-bold text-sm"
            >
              <Check className="w-4.5 h-4.5 text-primary-green" aria-hidden="true" />
              <span>{showToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar */}
          <nav
            aria-label="Dashboard navigation"
            className="lg:col-span-3 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 bg-white p-2.5 rounded-2xl border border-gray-150 shadow-sm lg:sticky lg:top-24"
          >
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`snap-center flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all w-full text-left cursor-pointer ${
                    isActive
                      ? 'bg-primary-green text-white shadow-sm font-bold'
                      : 'text-gray-500 hover:text-primary-green hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="hidden lg:block h-px bg-gray-200 my-3" />
            <button
              onClick={() => onNavigate('calculate')}
              className="hidden lg:flex items-center justify-between px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-primary-green transition-colors cursor-pointer text-left"
            >
              <span>Launch Calculator</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              onClick={() => onNavigate('reduce')}
              className="hidden lg:flex items-center justify-between px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-primary-green transition-colors cursor-pointer text-left"
            >
              <span>Explore Tips</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </nav>

          {/* Main content */}
          <div className="lg:col-span-9 flex flex-col gap-8 w-full text-left">

            {/* ── OVERVIEW ─────────────────────────────────────────────── */}
            {activeTab === 'Overview' && (
              <>
                <div>
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0f291e]">
                    Welcome back, {displayName} 🌲
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-1">
                    {calculatorResult
                      ? `Last audit: ${new Date(calculatorResult.calculatedAt).toLocaleDateString()} — your footprint is ${totalTonnes} t CO₂/yr.`
                      : "Run your first carbon audit to unlock personalized insights."}
                  </p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Your Footprint</div>
                    <div className="text-3xl font-black font-display text-[#0f291e]">
                      {totalTonnes} <span className="text-xs font-bold text-gray-400 uppercase">t CO₂/yr</span>
                    </div>
                    <div className="text-[11px] text-primary-green flex items-center gap-1.5 mt-3 font-bold">
                      <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>11% less than global avg (4.5t)</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Eco Score</div>
                    {sustainabilityScore ? (
                      <>
                        <div className="text-3xl font-black font-display text-primary-green">
                          {sustainabilityScore.score}<span className="text-xs font-bold text-gray-400">/100</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-bold mt-3">{sustainabilityScore.label} — top {100 - sustainabilityScore.percentile}%</p>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-black font-display text-gray-300">—</div>
                        <button
                          onClick={() => onNavigate('calculate')}
                          className="text-[11px] text-primary-green font-bold mt-3 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          Run calculator <ChevronRight className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Global Rank</div>
                    <div className="text-3xl font-black font-display text-[#0f291e] flex items-center gap-2">
                      Top {sustainabilityScore ? `${100 - sustainabilityScore.percentile}%` : '18%'}
                      <Award className="w-5 h-5 text-yellow-500 shrink-0" aria-hidden="true" />
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold mt-3">Among active change agents</p>
                  </div>
                </div>

                {/* Score card (only when we have data) */}
                {sustainabilityScore && <SustainabilityScoreCard score={sustainabilityScore} />}

                {/* Goal progress */}
                {userGoals.length > 0 && (
                  <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <h2 className="font-display font-extrabold text-sm uppercase tracking-wide text-[#0f291e] mb-4 flex items-center gap-2">
                      <Target className="w-4.5 h-4.5 text-primary-green" aria-hidden="true" />
                      Your Goals
                    </h2>
                    <div className="flex flex-col gap-4">
                      {userGoals.map((goal) => {
                        const pct = Math.max(0, Math.min(100,
                          goal.targetTonnes === 0
                            ? Math.round((1 - goal.currentTonnes / (calculatorResult?.totalTonnes ?? 4.5)) * 100)
                            : Math.round((1 - (goal.currentTonnes - goal.targetTonnes) / (calculatorResult?.totalTonnes ?? 4.5)) * 100),
                        ));
                        return (
                          <div key={goal.id}>
                            <div className="flex justify-between text-xs font-bold text-[#0f291e] mb-2">
                              <span>{goal.label}</span>
                              <span className="text-primary-green">{pct}% achieved</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary-green rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                role="progressbar"
                                aria-valuenow={pct}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${goal.label}: ${pct}% complete`}
                              />
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono font-bold mt-1">
                              Focus: {goal.primaryFocus} | Target: {goal.targetTonnes === 0 ? 'Net Zero' : `${goal.targetTonnes.toFixed(1)} t`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <h2 className="font-display font-extrabold text-sm uppercase tracking-wide text-[#0f291e] mb-4">Footprint Breakdown</h2>
                    <div className="h-56 w-full relative">
                      <ResponsiveContainer width="99%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#ffffff', border: '1px solid #e2ece8', borderRadius: '12px', fontSize: '12px' }}
                            formatter={(v: number) => [`${v} t CO₂`, '']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-2xl font-black font-display text-[#0f291e]">{totalTonnes}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-mono font-bold">t CO₂/yr</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-[11px] mt-3">
                      {pieData.map((d) => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} aria-hidden="true" />
                          <span className="text-gray-500 font-bold">{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <h2 className="font-display font-extrabold text-sm uppercase tracking-wide text-[#0f291e] mb-4">Monthly Trend</h2>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="99%" height="100%">
                        <LineChart data={lineData}>
                          <XAxis dataKey="name" stroke="#d1dbd6" style={{ fontSize: '10px' }} />
                          <YAxis stroke="#d1dbd6" style={{ fontSize: '10px' }} unit=" t" />
                          <Tooltip
                            contentStyle={{ background: '#ffffff', border: '1px solid #e2ece8', borderRadius: '12px', fontSize: '12px' }}
                            formatter={(v: number) => [`${v} t CO₂`, 'Emissions']}
                          />
                          <Line type="monotone" dataKey="emissions" stroke="#16a34a" strokeWidth={3} dot={{ fill: '#34d399' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-[11px] text-gray-400 text-center mt-3 font-bold">
                      Downward trend as habits improve ✅
                    </div>
                  </div>
                </div>

                {/* Streak + Activities */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                  <div className="md:col-span-5 flex flex-col gap-6">
                    <div className="p-6 rounded-2xl bg-[#0f291e] border border-gray-100 flex flex-col justify-between text-left relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/5 rounded-full filter blur-3xl pointer-events-none" />
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-[10px] font-mono text-emerald-200/50 uppercase tracking-widest font-bold">Your Streak</div>
                          <div className="text-3xl font-black font-display text-white mt-1">12 <span className="text-xs font-normal text-emerald-200 uppercase font-sans">Days</span></div>
                        </div>
                        <Flame className="w-6 h-6 text-orange-400 fill-orange-500/15 animate-pulse" aria-hidden="true" />
                      </div>
                      <div className="flex gap-1.5 justify-between" role="list" aria-label="Weekly streak">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, inx) => (
                          <div key={inx} className="flex flex-col items-center gap-1" role="listitem">
                            <span className="text-[9px] font-mono text-emerald-200/40 font-bold">{day}</span>
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${inx < 5 ? 'bg-primary-green text-white shadow-sm' : 'bg-white/5 border border-white/5 text-gray-500'}`}>
                              {inx < 5 ? '✓' : '·'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm flex justify-between items-center group hover:border-primary-green/20 transition-all">
                      <div>
                        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold mb-1">CO₂ Saved</div>
                        <div className="text-3xl font-black font-display text-[#0f291e]">12.4 <span className="text-xs font-bold text-gray-400 font-sans">kg</span></div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-1">This month from habit swaps</div>
                      </div>
                      <Leaf className="w-9 h-9 text-primary-green fill-primary-green/10 group-hover:scale-105 transition-transform" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="md:col-span-7 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <h2 className="font-display font-extrabold text-sm uppercase tracking-wide text-[#0f291e] mb-4">Recent Green Actions</h2>
                    <div className="flex flex-col gap-3.5">
                      {recentActivities.map((act) => (
                        <div key={act.id} className="flex items-center justify-between p-3.5 bg-[#f8fbf9] rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary-green" aria-hidden="true" />
                            <div>
                              <div className="text-xs font-bold text-[#0f291e]">{act.title}</div>
                              <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{act.date}</div>
                            </div>
                          </div>
                          {act.points && <span className="text-xs font-bold text-primary-green font-mono">{act.points}</span>}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => onNavigate('community')}
                      className="text-xs text-primary-green hover:text-secondary-green font-bold text-center mt-5 w-full transition-colors cursor-pointer"
                    >
                      View All Activities →
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── MY IMPACT ────────────────────────────────────────────── */}
            {activeTab === 'Impact' && (
              <div className="flex flex-col gap-6">
                <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <span className="text-xs font-mono text-primary-green font-bold uppercase block mb-2">MY FOREST ENABLER</span>
                  <h2 className="font-display font-extrabold text-2xl text-[#0f291e]">Certified Reforestation Offset</h2>
                  <p className="text-xs text-gray-400 font-semibold mt-1">Through consecutive footprint auditing, you enabled certified tree growth.</p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-5 rounded-xl bg-[#f8fbf9] border border-gray-100">
                      <div className="text-[10px] uppercase font-mono text-gray-400 font-extrabold">Trees Enabled</div>
                      <div className="text-4xl font-black font-display text-[#0f291e] mt-1">15 <span className="text-xs font-bold text-primary-green uppercase font-sans">Sprouts</span></div>
                    </div>
                    <div className="p-5 rounded-xl bg-[#f8fbf9] border border-gray-100">
                      <div className="text-[10px] uppercase font-mono text-gray-400 font-extrabold">Eco Grade</div>
                      <div className="text-4xl font-black font-display text-primary-green mt-1">
                        {sustainabilityScore?.label ?? 'A+'} <span className="text-xs font-bold text-gray-400 uppercase font-sans">Rating</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lifetime stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Audits Done', value: '3', unit: 'total' },
                    { label: 'CO₂ Saved', value: '124', unit: 'kg' },
                    { label: 'Streak', value: '12', unit: 'days' },
                    { label: 'Eco Score', value: sustainabilityScore ? String(sustainabilityScore.score) : '72', unit: '/100' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm text-left">
                      <div className="text-[10px] uppercase font-mono text-gray-400 font-extrabold">{stat.label}</div>
                      <div className="text-2xl font-black font-display text-[#0f291e] mt-1">
                        {stat.value} <span className="text-xs font-bold text-gray-400 uppercase font-sans">{stat.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── AI INSIGHTS ──────────────────────────────────────────── */}
            {activeTab === 'AI Insights' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-[#0f291e] flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary-green" aria-hidden="true" />
                    Personalized AI Insights
                  </h2>
                  <p className="text-sm text-gray-400 font-semibold mt-1">
                    {recommendations.length > 0
                      ? `${recommendations.length} recommendations ranked by: highest impact × lowest effort × lowest cost.`
                      : 'Complete the carbon calculator to generate personalized insights.'}
                  </p>
                </div>

                {recommendations.length === 0 ? (
                  <div className="p-12 rounded-2xl bg-white border border-gray-100 shadow-sm text-center">
                    <Leaf className="w-12 h-12 text-gray-200 mx-auto mb-4" aria-hidden="true" />
                    <p className="text-base font-bold text-gray-400">No insights yet.</p>
                    <button
                      onClick={() => onNavigate('calculate')}
                      className="mt-4 px-6 py-3 rounded-xl bg-primary-green text-white font-bold text-sm cursor-pointer hover:bg-secondary-green transition-colors"
                    >
                      Run Carbon Calculator →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.slice(0, 8).map((rec, i) => (
                      <div key={rec.id} className="p-5 rounded-xl bg-white border border-gray-150 shadow-sm hover:border-primary-green/30 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-6 h-6 rounded-full bg-primary-green text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <h3 className="text-sm font-bold text-[#0f291e] flex-1 leading-snug">{rec.title}</h3>
                        </div>
                        <p className="text-xs text-gray-500 font-semibold leading-relaxed mb-3">{rec.description}</p>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${DIFFICULTY_STYLES[rec.difficulty]}`}>
                            {rec.difficulty}
                          </span>
                          <span className="text-[10px] font-bold text-primary-green font-mono">-{rec.co2ReductionKg} kg CO₂/yr</span>
                          <span className={`text-[10px] font-bold ${COST_COLOR[rec.costEstimate]}`}>{COST_INR_LABEL[rec.costEstimate] ?? rec.costEstimate}</span>
                        </div>
                        <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                          <p className="text-[11px] text-emerald-800 font-semibold leading-relaxed">
                            💡 {rec.whyItMatters}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CHALLENGES ───────────────────────────────────────────── */}
            {activeTab === 'Challenges' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-[#0f291e]">Monthly Challenges</h2>
                  <p className="text-sm text-gray-400 font-semibold mt-1">Join challenges to earn XP, climb leaderboards, and build green habits.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {challenges.map((challenge) => {
                    const done = completedChallenges.has(challenge.id);
                    return (
                      <div
                        key={challenge.id}
                        className={`p-5 rounded-2xl border text-left shadow-sm transition-all ${done ? 'bg-green-50 border-primary-green/40' : 'bg-white border-gray-150'}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-[10px] font-mono font-bold text-primary-green bg-green-50 border border-green-150 px-2.5 py-1 rounded uppercase tracking-wider">
                            +{challenge.points} pts
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 border border-gray-100 px-2 py-0.5 rounded bg-gray-50">
                            {challenge.category}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-base text-[#0f291e] mb-1">{challenge.title}</h3>
                        <p className="text-xs text-gray-400 font-semibold mb-4 leading-relaxed">{challenge.desc}</p>
                        <button
                          onClick={() => handleJoinChallenge(challenge)}
                          disabled={done}
                          aria-label={done ? `${challenge.title}: already joined` : `Join challenge: ${challenge.title}`}
                          className={`w-full py-2.5 rounded-xl font-extrabold text-xs border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            done
                              ? 'bg-primary-green text-white border-primary-green cursor-default'
                              : 'bg-green-50/50 hover:bg-primary-green text-primary-green hover:text-white border-green-150/80'
                          }`}
                        >
                          {done ? <><Check className="w-3.5 h-3.5" aria-hidden="true" /> Joined!</> : 'Join Challenge'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── SETTINGS ─────────────────────────────────────────────── */}
            {activeTab === 'Settings' && (
              <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <h2 className="font-display font-extrabold text-xl text-[#0f291e] mb-4">Dashboard Settings</h2>
                <p className="text-xs text-gray-400 font-semibold mb-6">Customize baseline regional thresholds and calculator defaults.</p>
                <div className="flex flex-col gap-5 max-w-md">
                  <div>
                    <label htmlFor="region-select" className="text-xs uppercase font-mono text-gray-400 font-extrabold block mb-1.5">
                      Region Baseline
                    </label>
                    <select
                      id="region-select"
                      className="w-full bg-[#f8fbf9] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary-green focus:outline-none font-semibold text-[#0f291e]"
                      onChange={() => triggerToast('Region preference saved.')}
                    >
                      <option>North America (US Baseline)</option>
                      <option>European Union (EU Baseline)</option>
                      <option>Global Average Baseline</option>
                      <option>South Asia (India/Pakistan)</option>
                      <option>East Asia (China/Japan)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase font-mono text-gray-400 font-extrabold block mb-2">
                      Email Digest Cadence
                    </label>
                    <div className="flex gap-3">
                      {['Daily', 'Weekly', 'Off'].map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => triggerToast(`Email digest set to ${o}.`)}
                          className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold hover:border-primary-green text-[#0f291e] cursor-pointer bg-white shadow-sm transition-colors hover:bg-green-50 hover:text-primary-green"
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('calculate');
                        triggerToast('Redirecting to calculator…');
                      }}
                      className="w-full py-3 rounded-xl border border-primary-green text-primary-green font-bold text-sm hover:bg-green-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" aria-hidden="true" />
                      Run New Carbon Audit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
