import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Leaf, Lightbulb, Bus, Sliders, Info, Zap, X, Flame, ChevronRight,
  CheckCircle2, Star,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { TipItem } from '../types';
import { COST_INR_LABEL } from '../lib/currency';

const ALL_TIPS: TipItem[] = [
  {
    id: 'led-switching',
    title: 'Switch to LED Lights',
    category: 'Home',
    savingsEstimate: 'Save up to 100 kg CO₂ / year',
    co2ReductionKg: 100,
    description: 'Replacing incandescent bulbs with Energy Star certified LEDs cuts electricity use by 75–80% and lasts 25× longer.',
    whyItMatters: 'Lighting accounts for ~15% of home electricity use. LEDs generate almost no waste heat, reducing your cooling load too. A full-home switch pays back in under 12 months.',
    iconName: 'lightbulb',
    difficulty: 'Easy',
    costEstimate: 'Low',
    timeframeDays: 1,
    impactScore: 5,
  },
  {
    id: 'public-transit',
    title: 'Use Public Transport',
    category: 'Transport',
    savingsEstimate: 'Save up to 500 kg CO₂ / year',
    co2ReductionKg: 500,
    description: 'Taking trains, buses, or metro instead of driving a single-occupancy car slashes transport emissions by 60–70%.',
    whyItMatters: 'Transport is often the single largest emission source for individuals. One person switching to public transit for one year saves the equivalent of planting 23 trees.',
    iconName: 'bus',
    difficulty: 'Medium',
    costEstimate: 'Low',
    timeframeDays: 30,
    impactScore: 9,
  },
  {
    id: 'plant-based',
    title: 'Eat More Plants',
    category: 'Food',
    savingsEstimate: 'Save up to 600 kg CO₂ / year',
    co2ReductionKg: 600,
    description: 'Shifting to plant-focused proteins (legumes, tofu, nuts) and reducing red meat 3 days/week yields massive emissions cuts.',
    whyItMatters: 'Beef generates ~60 kg CO₂ per kg of food — 30× more than legumes. Global livestock accounts for 14.5% of all greenhouse gas emissions.',
    iconName: 'plant',
    difficulty: 'Easy',
    costEstimate: 'Free',
    timeframeDays: 7,
    impactScore: 9,
  },
  {
    id: 'reduce-plastic',
    title: 'Eliminate Single-Use Plastics',
    category: 'Lifestyle',
    savingsEstimate: 'Save up to 150 kg CO₂ / year',
    co2ReductionKg: 150,
    description: 'Refusing plastic bottles, bags, and packaging prevents fossil fuel extraction and reduces landfill methane emissions.',
    whyItMatters: 'Single-use plastics are made from oil and gas. When incinerated or landfilled, they release CO₂ and methane. Reusable alternatives pay back their carbon cost within weeks.',
    iconName: 'trash',
    difficulty: 'Easy',
    costEstimate: 'Free',
    timeframeDays: 1,
    impactScore: 4,
  },
  {
    id: 'home-thermostat',
    title: 'Smart Thermostat',
    category: 'Home',
    savingsEstimate: 'Save up to 220 kg CO₂ / year',
    co2ReductionKg: 220,
    description: 'Lower heating by 2°C in winter and raise AC by 2°C in summer. A smart thermostat automates this saving ~10% energy.',
    whyItMatters: 'Heating and cooling account for up to 50% of home energy use. Smart thermostats optimize schedules automatically and can save £150–300/year on energy bills.',
    iconName: 'thermostat',
    difficulty: 'Easy',
    costEstimate: 'Medium',
    timeframeDays: 30,
    impactScore: 7,
  },
  {
    id: 'bike-miles',
    title: 'Cycle for Short Trips',
    category: 'Transport',
    savingsEstimate: 'Save up to 450 kg CO₂ / year',
    co2ReductionKg: 450,
    description: 'Replace journeys under 5 km with cycling. Zero-emission, faster than driving in cities, and improves health.',
    whyItMatters: 'Short car trips are disproportionately polluting (cold engine, inefficient combustion). Replacing just 3 short drives per week with cycling cuts 450+ kg CO₂/year.',
    iconName: 'bike',
    difficulty: 'Medium',
    costEstimate: 'Low',
    timeframeDays: 1,
    impactScore: 8,
  },
  {
    id: 'local-produce',
    title: 'Buy Local & Seasonal Food',
    category: 'Food',
    savingsEstimate: 'Save up to 180 kg CO₂ / year',
    co2ReductionKg: 180,
    description: 'Purchasing from local markets cuts international air-freight. Seasonal foods need no refrigeration during transport.',
    whyItMatters: 'Air-freighted food generates 50× more CO₂ than road or sea transport. Local farms also store more carbon in soil via organic practices.',
    iconName: 'local',
    difficulty: 'Medium',
    costEstimate: 'Free',
    timeframeDays: 14,
    impactScore: 6,
  },
  {
    id: 'recycled-consumer',
    title: 'Buy Second-Hand',
    category: 'Lifestyle',
    savingsEstimate: 'Save up to 200 kg CO₂ / year',
    co2ReductionKg: 200,
    description: 'Source clothes, furniture, and electronics from thrift stores or resale apps to skip energy-intensive manufacturing.',
    whyItMatters: 'Manufacturing one pair of jeans uses ~3,000 litres of water and generates ~33 kg CO₂. Buying second-hand eliminates that entirely.',
    iconName: 'shop',
    difficulty: 'Easy',
    costEstimate: 'Free',
    timeframeDays: 7,
    impactScore: 6,
  },
  {
    id: 'renewable-energy',
    title: 'Switch to Green Energy',
    category: 'Home',
    savingsEstimate: 'Save up to 800 kg CO₂ / year',
    co2ReductionKg: 800,
    description: 'Change your electricity supplier to a certified 100% renewable tariff or install solar panels.',
    whyItMatters: 'Your home electricity accounts for a large share of your footprint. Switching to renewables cuts that to near-zero — often at the same or lower cost than fossil fuel tariffs.',
    iconName: 'solar',
    difficulty: 'Easy',
    costEstimate: 'Low',
    timeframeDays: 14,
    impactScore: 9,
  },
];

export default function ReduceSection() {
  const { recommendations } = useAppContext();
  const [activeTab, setActiveTab] = useState<'All' | 'Home' | 'Transport' | 'Food' | 'Lifestyle'>('All');
  const [selectedTip, setSelectedTip] = useState<TipItem | null>(null);
  const [completedTips, setCompletedTips] = useState<Set<string>>(new Set());

  // Identify personalized tips from decision engine
  const personalizedIds = new Set(recommendations.map((r) => r.id));
  // Map decision engine IDs to tip IDs where they overlap
  const tipIdMatchMap: Record<string, string> = {
    'switch-public-transit': 'public-transit',
    'cycle-short-trips': 'bike-miles',
    'reduce-red-meat': 'plant-based',
    'plant-based-days': 'plant-based',
    'smart-thermostat': 'home-thermostat',
    'led-lighting': 'led-switching',
    'renewable-tariff': 'renewable-energy',
    'local-seasonal-food': 'local-produce',
    'buy-secondhand': 'recycled-consumer',
  };
  const personalizedTipIds = new Set(
    recommendations.map((r) => tipIdMatchMap[r.id]).filter(Boolean),
  );

  const filteredTips = (activeTab === 'All' ? ALL_TIPS : ALL_TIPS.filter((tip) => tip.category === activeTab))
    .map((tip) => ({ ...tip, isPersonalized: personalizedTipIds.has(tip.id) }))
    .sort((a, b) => (b.isPersonalized ? 1 : 0) - (a.isPersonalized ? 1 : 0));

  const DIFFICULTY_DOT: Record<string, string> = {
    Easy: 'bg-green-500',
    Medium: 'bg-amber-500',
    Hard: 'bg-red-500',
  };

  const getTipIcon = (iconName: string) => {
    switch (iconName) {
      case 'lightbulb': return <Lightbulb className="w-6 h-6 text-yellow-500" />;
      case 'bus': return <Bus className="w-6 h-6 text-primary-green" />;
      case 'plant': return <Leaf className="w-6 h-6 text-teal-500" />;
      case 'trash': return <Sliders className="w-6 h-6 text-emerald-500" />;
      case 'thermostat': return <Zap className="w-6 h-6 text-rose-500" />;
      case 'solar': return <Zap className="w-6 h-6 text-yellow-500" />;
      default: return <Info className="w-6 h-6 text-primary-green" />;
    }
  };

  const handleMarkDone = (tipId: string) => {
    setCompletedTips((prev) => {
      const next = new Set(prev);
      if (next.has(tipId)) next.delete(tipId);
      else next.add(tipId);
      return next;
    });
    setSelectedTip(null);
  };

  return (
    <section
      id="reduce-section"
      className="relative py-24 bg-gradient-to-b from-white via-[#f3f7f5] to-white text-[#0f291e]"
      aria-label="Reduce Your Carbon Footprint"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono text-primary-green tracking-widest uppercase mb-3 block font-bold">OFFSET STRATEGIES</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0f291e] tracking-tight leading-tight">
            Simple Steps, <span className="text-primary-green">Big Impact</span>
          </h1>
          <p className="mt-3 text-gray-500 font-semibold text-sm">
            Small, intentional adjustments in your daily life yield massive collective benefits.
            {recommendations.length > 0 && (
              <span className="text-primary-green font-bold"> ⭐ Personalized for your footprint profile.</span>
            )}
          </p>
        </div>

        {/* Tab bar */}
        <div
          id="reduce-tabs"
          className="flex flex-wrap justify-center gap-2 mb-12 max-w-xl mx-auto bg-[#e8efeb] p-1.5 rounded-2xl border border-gray-100"
          role="tablist"
          aria-label="Filter tips by category"
        >
          {(['All', 'Home', 'Transport', 'Food', 'Lifestyle'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isActive ? 'bg-primary-green text-white shadow-md font-extrabold' : 'text-gray-500 hover:text-[#0f291e] hover:bg-white/80'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tips grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTips.map((tip) => {
              const done = completedTips.has(tip.id);
              return (
                <motion.article
                  key={tip.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-2xl bg-white border p-6 flex flex-col justify-between hover:shadow-lg group text-left transition-all ${
                    done ? 'border-primary-green/30 bg-green-50/20' : tip.isPersonalized ? 'border-primary-green/25 hover:border-primary-green/40' : 'border-gray-150 hover:border-primary-green/25'
                  }`}
                  aria-label={`${tip.title} — ${tip.difficulty} difficulty`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono tracking-wider bg-green-50 border border-green-150 text-primary-green">
                          {tip.category}
                        </span>
                        {tip.isPersonalized && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
                            <Star className="w-2.5 h-2.5" aria-hidden="true" />
                            For You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${DIFFICULTY_DOT[tip.difficulty]}`} aria-hidden="true" />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${tip.difficulty === 'Easy' ? 'text-primary-green' : 'text-amber-600'}`}>
                          {tip.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-green-100">
                      {getTipIcon(tip.iconName)}
                    </div>

                    <h2 className="font-display font-bold text-lg text-[#0f291e] mb-2 leading-snug">{tip.title}</h2>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary-green mb-4">
                      <Flame className="w-3.5 h-3.5 fill-primary-green text-primary-green" aria-hidden="true" />
                      <span>{tip.savingsEstimate}</span>
                    </div>

                    {/* Metadata row */}
                    <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-gray-400 mb-1">
                      <span>Cost: {COST_INR_LABEL[tip.costEstimate as keyof typeof COST_INR_LABEL] ?? tip.costEstimate}</span>
                      <span>·</span>
                      <span>Impact: {tip.impactScore}/10</span>
                      <span>·</span>
                      <span>{tip.timeframeDays < 7 ? `${tip.timeframeDays}d` : `${Math.round(tip.timeframeDays / 7)}w`}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setSelectedTip(tip)}
                      aria-label={`Learn more about: ${tip.title}`}
                      className="flex-1 py-2.5 rounded-xl bg-green-50/50 hover:bg-primary-green text-[#0f291e] hover:text-white font-bold text-xs border border-green-150/60 flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer"
                    >
                      <span>Learn More</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleMarkDone(tip.id)}
                      aria-label={done ? `Mark ${tip.title} as not done` : `Mark ${tip.title} as done`}
                      aria-pressed={done}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        done
                          ? 'bg-primary-green text-white border-primary-green'
                          : 'bg-white border-gray-200 text-gray-400 hover:border-primary-green hover:text-primary-green'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Detail modal */}
        <AnimatePresence>
          {selectedTip && (
            <div
              className="fixed inset-0 bg-black/55 backdrop-blur-md z-[100] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tip-modal-title"
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedTip(null); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-lg rounded-3xl bg-white border border-gray-200 p-6 sm:p-8 relative shadow-2xl text-left"
                role="document"
              >
                <button
                  onClick={() => setSelectedTip(null)}
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-800 transition-colors cursor-pointer"
                  aria-label="Close tip details"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>

                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-green-50 text-primary-green border border-green-150 mb-4 inline-block">
                  {selectedTip.category}
                </span>

                <h2 id="tip-modal-title" className="font-display font-extrabold text-2xl text-[#0f291e] mb-3 mt-1 leading-snug">
                  {selectedTip.title}
                </h2>

                <div className="flex items-center gap-2 text-sm font-semibold text-primary-green mb-6 bg-green-50 py-2.5 px-4 rounded-xl border border-green-150">
                  <Flame className="w-4 h-4 text-primary-green fill-primary-green" aria-hidden="true" />
                  <span>Carbon saving: <strong>{selectedTip.savingsEstimate}</strong></span>
                </div>

                <div className="mb-5">
                  <h3 className="text-xs uppercase font-mono text-gray-400 tracking-widest mb-2 font-bold">Why it matters:</h3>
                  <p className="text-sm text-gray-500 font-semibold leading-relaxed bg-gray-50/80 p-4 rounded-xl border border-gray-150">
                    {selectedTip.whyItMatters}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Cost', value: COST_INR_LABEL[selectedTip.costEstimate as keyof typeof COST_INR_LABEL] ?? selectedTip.costEstimate },
                    { label: 'Difficulty', value: selectedTip.difficulty },
                    { label: 'Impact', value: `${selectedTip.impactScore}/10` },
                    { label: 'Timeline', value: selectedTip.timeframeDays < 7 ? `${selectedTip.timeframeDays} day${selectedTip.timeframeDays > 1 ? 's' : ''}` : `${Math.round(selectedTip.timeframeDays / 7)} week${Math.round(selectedTip.timeframeDays / 7) > 1 ? 's' : ''}` },
                  ].map((meta) => (
                    <div key={meta.label} className="bg-gray-50/80 p-3 rounded-xl border border-gray-150 text-center">
                      <div className="text-[9px] uppercase font-mono text-gray-400 font-bold">{meta.label}</div>
                      <div className="text-xs font-bold text-[#0f291e] mt-1">{meta.value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleMarkDone(selectedTip.id)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      completedTips.has(selectedTip.id)
                        ? 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                        : 'bg-primary-green text-white shadow-md hover:bg-secondary-green'
                    }`}
                  >
                    {completedTips.has(selectedTip.id) ? (
                      <><CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Done — click to undo</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Mark as Done</>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
