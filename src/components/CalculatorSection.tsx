import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';
import {
  Bus, Car, Zap, ChefHat, ShoppingBag, Check, RefreshCw, Send, Sparkles,
  AlertTriangle, Leaf, Droplets, Plane, TrendingDown, ArrowRight,
} from 'lucide-react';
import { motion as m } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { analyzeFootprint, computeSustainabilityScore, computeBreakdown } from '../lib/decisionEngine';
import { clampNumber } from '../lib/sanitize';
import SustainabilityScoreCard from './SustainabilityScoreCard';
import type { CalculatorState, Recommendation } from '../types';
import { COST_INR_LABEL } from '../lib/currency';

const INITIAL_STATE: CalculatorState = {
  transportMode: 'Car',
  transportWeeklyDistance: 120,
  publicTransportUse: '3-5 days per week',
  electricityBill: 2000,
  heatingType: 'Solar/Heat Pump',
  dietType: 'Average Meat',
  wasteRecycle: true,
  shoppingFrequency: 'Average',
  waterUsageLitres: 150,
  flightsPerYear: 1,
};

const DIFFICULTY_STYLES = {
  Easy: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Hard: 'bg-red-100 text-red-700 border-red-200',
};

const COST_COLOR: Record<string, string> = {
  Free: 'text-green-600',
  Low: 'text-emerald-600',
  Medium: 'text-amber-600',
  High: 'text-red-600',
};

function RecommendationCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="p-4 rounded-xl bg-white border border-gray-200 flex flex-col gap-3 hover:border-primary-green/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-primary-green text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
          {rank}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-[#0f291e] leading-snug">{rec.title}</div>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${DIFFICULTY_STYLES[rec.difficulty]}`}>
              {rec.difficulty}
            </span>
            <span className="text-[10px] font-bold text-primary-green font-mono">
              -{rec.co2ReductionKg} kg CO₂/yr
            </span>
            <span className={`text-[10px] font-bold ${COST_COLOR[rec.costEstimate]}`}>
              {COST_INR_LABEL[rec.costEstimate] ?? rec.costEstimate}
            </span>
          </div>
        </div>
        {/* Impact dots */}
        <div className="flex gap-0.5 shrink-0 mt-1" aria-label={`Impact score: ${rec.impactScore} out of 10`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-3 rounded-full ${i < Math.round(rec.impactScore / 2) ? 'bg-primary-green' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 font-semibold leading-relaxed">{rec.description}</p>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="text-[11px] font-bold text-primary-green text-left flex items-center gap-1 hover:text-secondary-green transition-colors cursor-pointer"
        aria-expanded={expanded}
        aria-controls={`why-${rec.id}`}
      >
        <Sparkles className="w-3 h-3" aria-hidden="true" />
        {expanded ? 'Hide details' : 'Why this matters'}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            id={`why-${rec.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
                {rec.whyItMatters}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <div className="text-[9px] font-mono text-emerald-600 uppercase font-bold">Cost</div>
                  <div className={`text-xs font-bold mt-0.5 ${COST_COLOR[rec.costEstimate]}`}>{rec.costEstimate}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] font-mono text-emerald-600 uppercase font-bold">Impact</div>
                  <div className="text-xs font-bold text-emerald-800 mt-0.5">{rec.impactScore}/10</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] font-mono text-emerald-600 uppercase font-bold">Timeline</div>
                  <div className="text-xs font-bold text-emerald-800 mt-0.5">
                    {rec.timeframeDays < 7 ? `${rec.timeframeDays}d` : `${Math.round(rec.timeframeDays / 7)}w`}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CalculatorSection() {
  const { saveCalculatorResult } = useAppContext();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<CalculatorState>(INITIAL_STATE);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  const TOTAL_STEPS = 6; // Transport, Energy, Food, Lifestyle, Water, Review

  const getPercentageProgress = () => Math.min(100, Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100));

  const nextStep = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCalculatorResult(formData);
    setHasCalculated(true);
  };

  const handleReset = () => {
    setStep(1);
    setHasCalculated(false);
    setFormData(INITIAL_STATE);
  };

  // Live calculation
  const breakdown = computeBreakdown(formData);
  const totalKg = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const calculatedValue = parseFloat((totalKg / 1000).toFixed(1));
  const scoreData = computeSustainabilityScore(formData);
  const recommendations = analyzeFootprint(formData);

  const getPieData = () => [
    { name: 'Transport', value: parseFloat((breakdown.transport / 1000).toFixed(2)) || 0.01, color: '#34D399' },
    { name: 'Home Energy', value: parseFloat((breakdown.energy / 1000).toFixed(2)) || 0.01, color: '#22C55E' },
    { name: 'Food & Diet', value: parseFloat((breakdown.food / 1000).toFixed(2)) || 0.01, color: '#10B981' },
    { name: 'Lifestyle', value: parseFloat((breakdown.lifestyle / 1000).toFixed(2)) || 0.01, color: '#059669' },
    { name: 'Water', value: parseFloat((breakdown.water / 1000).toFixed(2)) || 0.01, color: '#6EE7B7' },
  ];

  const getBarData = () => [
    { name: 'You', footprint: calculatedValue, fill: '#34D399' },
    { name: 'World Avg', footprint: 4.5, fill: '#16A34A' },
    { name: 'EU Avg', footprint: 6.4, fill: '#059669' },
    { name: 'US Avg', footprint: 16.0, fill: '#047857' },
  ];

  const STEPS = [
    { num: 1, label: 'Transport' },
    { num: 2, label: 'Energy' },
    { num: 3, label: 'Food' },
    { num: 4, label: 'Lifestyle' },
    { num: 5, label: 'Water' },
    { num: 6, label: 'Review' },
  ];

  return (
    <section
      id="calculator-section"
      className="relative py-20 min-h-screen bg-gradient-to-b from-[#f3f7f5] via-white to-[#f4f8f6] text-[#0f291e] text-left"
      aria-label="Carbon Footprint Calculator"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!hasCalculated ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Form */}
            <div className="lg:col-span-7 flex flex-col items-start w-full text-left">
              <span className="text-xs font-mono text-primary-green tracking-widest uppercase mb-3 font-bold">
                CONVERSATIONAL WIZARD
              </span>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0f291e] tracking-tight mb-2">
                Calculate Your <span className="text-primary-green">Carbon Footprint</span>
              </h1>
              <p className="text-gray-500 font-semibold mb-8 max-w-xl text-sm">
                Answer 6 simple questions. Our decision engine calculates your yearly impact and personalized action plan.
              </p>

              {/* Step pills */}
              <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Calculator steps">
                {STEPS.map((s) => {
                  const isActive = step === s.num;
                  const isPast = s.num < step;
                  return (
                    <button
                      key={s.num}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => { if (s.num < step) setStep(s.num); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-primary-green text-white shadow-sm'
                          : isPast
                          ? 'bg-green-50 text-primary-green border border-green-200 cursor-pointer'
                          : 'bg-gray-50 text-gray-300 border border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      {isPast ? <Check className="w-3 h-3 inline mr-1" aria-hidden="true" /> : null}
                      {s.num}. {s.label}
                    </button>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div
                className="w-full bg-gray-100 h-2 rounded-full mb-8 overflow-hidden border border-gray-200"
                role="progressbar"
                aria-valuenow={getPercentageProgress()}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Calculator progress: ${getPercentageProgress()}%`}
              >
                <motion.div
                  className="h-full bg-primary-green rounded-full"
                  animate={{ width: `${getPercentageProgress()}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="w-full min-h-[280px]" noValidate>
                <AnimatePresence mode="wait">
                  {/* ── STEP 1: TRANSPORT ──────────────────────────────── */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col gap-6"
                    >
                      <fieldset>
                        <legend className="text-base font-bold text-[#0f291e] mb-3 flex items-center gap-1.5">
                          <Car className="w-4 h-4 text-primary-green" aria-hidden="true" />
                          How do you usually travel?
                        </legend>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {['Car', 'Motorcycle', 'Public Transport', 'Bicycle', 'Walk'].map((mode) => (
                            <label
                              key={mode}
                              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all text-center ${
                                formData.transportMode === mode
                                  ? 'bg-green-50 border-primary-green text-primary-green font-bold shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-primary-green/30 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="transportMode"
                                value={mode}
                                checked={formData.transportMode === mode}
                                onChange={() => setFormData({ ...formData, transportMode: mode })}
                                className="sr-only"
                              />
                              <span className="text-sm font-semibold">{mode}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      {!['Walk', 'Bicycle'].includes(formData.transportMode) && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <label htmlFor="transport-distance" className="text-sm font-semibold text-gray-600 block mb-2">
                            Weekly travel distance:{' '}
                            <strong className="text-primary-green">{formData.transportWeeklyDistance} km</strong>
                          </label>
                          <input
                            id="transport-distance"
                            type="range"
                            min="0" max="500" step="10"
                            value={formData.transportWeeklyDistance}
                            onChange={(e) =>
                              setFormData({ ...formData, transportWeeklyDistance: clampNumber(parseInt(e.target.value), 0, 500) })
                            }
                            className="w-full accent-primary-green h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            aria-label={`Weekly distance: ${formData.transportWeeklyDistance} km`}
                          />
                          <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                            <span>0 km</span><span>500 km</span>
                          </div>
                        </motion.div>
                      )}

                      <div>
                        <label htmlFor="flights-per-year" className="text-sm font-semibold text-gray-600 block mb-2">
                          <Plane className="w-3.5 h-3.5 inline mr-1 text-primary-green" aria-hidden="true" />
                          Flights per year: <strong className="text-primary-green">{formData.flightsPerYear}</strong>
                        </label>
                        <input
                          id="flights-per-year"
                          type="range"
                          min="0" max="20" step="1"
                          value={formData.flightsPerYear}
                          onChange={(e) =>
                            setFormData({ ...formData, flightsPerYear: clampNumber(parseInt(e.target.value), 0, 20) })
                          }
                          className="w-full accent-primary-green h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          aria-label={`Flights per year: ${formData.flightsPerYear}`}
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                          <span>0</span><span>20 flights</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 2: ENERGY ─────────────────────────────────── */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col gap-6"
                    >
                      <fieldset>
                        <legend className="text-base font-bold text-[#0f291e] mb-3 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-primary-green" aria-hidden="true" />
                          What heats your home?
                        </legend>
                        <div className="grid grid-cols-2 gap-3">
                          {['Natural Gas', 'Heating Oil', 'Electricity', 'Solar/Heat Pump'].map((heat) => (
                            <label
                              key={heat}
                              className={`p-4 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                                formData.heatingType === heat
                                  ? 'bg-green-50 border-primary-green text-primary-green font-bold shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-primary-green/30 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="heatingType"
                                value={heat}
                                checked={formData.heatingType === heat}
                                onChange={() => setFormData({ ...formData, heatingType: heat })}
                                className="sr-only"
                              />
                              <span className="text-sm font-semibold">{heat}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      <div>
                        <label htmlFor="electricity-bill" className="text-sm font-semibold text-gray-600 block mb-2">
                          Monthly electricity bill:{' '}
                          <strong className="text-primary-green">₹{formData.electricityBill.toLocaleString('en-IN')}</strong>
                        </label>
                        <input
                          id="electricity-bill"
                          type="range"
                          min="500" max="15000" step="100"
                          value={formData.electricityBill}
                          onChange={(e) =>
                            setFormData({ ...formData, electricityBill: clampNumber(parseInt(e.target.value), 500, 15000) })
                          }
                          className="w-full accent-primary-green h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          aria-label={`Monthly electricity bill: ₹${formData.electricityBill}`}
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                          <span>₹500</span><span>₹15,000</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 3: FOOD ───────────────────────────────────── */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col gap-4"
                    >
                      <fieldset>
                        <legend className="text-base font-bold text-[#0f291e] mb-3 flex items-center gap-1.5">
                          <ChefHat className="w-4 h-4 text-primary-green" aria-hidden="true" />
                          How would you describe your diet?
                        </legend>
                        <div className="flex flex-col gap-3">
                          {[
                            { key: 'High Meat Eating', d: 'Daily beef, pork, lamb, and poultry.', co2: '2.6 t CO₂/yr', emoji: '🥩' },
                            { key: 'Average Meat', d: 'Moderate meat with grains and vegetables.', co2: '1.5 t CO₂/yr', emoji: '🍗' },
                            { key: 'Vegetarian', d: 'No meat. Dairy, eggs, and legumes.', co2: '0.9 t CO₂/yr', emoji: '🥗' },
                            { key: 'Vegan', d: 'Entirely plant-based, no animal products.', co2: '0.5 t CO₂/yr', emoji: '🌱' },
                          ].map((diet) => (
                            <label
                              key={diet.key}
                              className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                                formData.dietType === diet.key
                                  ? 'bg-green-50 border-primary-green shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-primary-green/20 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="dietType"
                                value={diet.key}
                                checked={formData.dietType === diet.key}
                                onChange={() => setFormData({ ...formData, dietType: diet.key })}
                                className="sr-only"
                              />
                              <span className="text-xl shrink-0">{diet.emoji}</span>
                              <div className="flex-1">
                                <div className={`text-sm font-bold ${formData.dietType === diet.key ? 'text-primary-green' : 'text-[#0f291e]'}`}>
                                  {diet.key}
                                </div>
                                <div className="text-xs text-gray-400 font-semibold mt-0.5">{diet.d}</div>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-primary-green shrink-0">{diet.co2}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </motion.div>
                  )}

                  {/* ── STEP 4: LIFESTYLE ──────────────────────────────── */}
                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col gap-6"
                    >
                      <fieldset>
                        <legend className="text-base font-bold text-[#0f291e] mb-3 flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-primary-green" aria-hidden="true" />
                          How often do you shop for new items?
                        </legend>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { key: 'Very Often', desc: 'Weekly', emoji: '🛍️' },
                            { key: 'Average', desc: 'Monthly', emoji: '🛒' },
                            { key: 'Minimalist', desc: 'Rarely', emoji: '♻️' },
                          ].map((freq) => (
                            <label
                              key={freq.key}
                              className={`p-4 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all text-center ${
                                formData.shoppingFrequency === freq.key
                                  ? 'bg-green-50 border-primary-green text-primary-green font-bold shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-primary-green/20 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="shoppingFrequency"
                                value={freq.key}
                                checked={formData.shoppingFrequency === freq.key}
                                onChange={() => setFormData({ ...formData, shoppingFrequency: freq.key })}
                                className="sr-only"
                              />
                              <span className="text-2xl">{freq.emoji}</span>
                              <span className="text-sm font-semibold">{freq.key}</span>
                              <span className="text-[10px] text-gray-400 font-semibold">{freq.desc}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      {/* Recycling */}
                      <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        formData.wasteRecycle ? 'bg-green-50 border-primary-green' : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}>
                        <div>
                          <div className="text-sm font-bold text-[#0f291e] flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-primary-green" aria-hidden="true" />
                            Do you sort and recycle regularly?
                          </div>
                          <div className="text-xs text-gray-400 font-semibold mt-0.5">Paper, plastic, glass, and metals.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.wasteRecycle}
                          onChange={(e) => setFormData({ ...formData, wasteRecycle: e.target.checked })}
                          className="w-5 h-5 accent-primary-green cursor-pointer"
                          aria-label="Sort and recycle regularly"
                        />
                      </label>
                    </motion.div>
                  )}

                  {/* ── STEP 5: WATER ──────────────────────────────────── */}
                  {step === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col gap-6"
                    >
                      <div>
                        <label htmlFor="water-usage" className="text-base font-bold text-[#0f291e] mb-2 flex items-center gap-1.5">
                          <Droplets className="w-4 h-4 text-primary-green" aria-hidden="true" />
                          Daily water usage:{' '}
                          <strong className="text-primary-green ml-1">{formData.waterUsageLitres} L</strong>
                        </label>
                        <p className="text-xs text-gray-400 font-semibold mb-4">
                          Average person uses ~140–200L/day. Includes showers, cooking, laundry.
                        </p>
                        <input
                          id="water-usage"
                          type="range"
                          min="20" max="500" step="10"
                          value={formData.waterUsageLitres}
                          onChange={(e) =>
                            setFormData({ ...formData, waterUsageLitres: clampNumber(parseInt(e.target.value), 20, 500) })
                          }
                          className="w-full accent-primary-green h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          aria-label={`Daily water usage: ${formData.waterUsageLitres} litres`}
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                          <span>20L (minimal)</span><span>500L (heavy)</span>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                          {[
                            { label: 'Low', value: 80, emoji: '💧' },
                            { label: 'Average', value: 150, emoji: '🚿' },
                            { label: 'High', value: 300, emoji: '🛁' },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setFormData({ ...formData, waterUsageLitres: preset.value })}
                              className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                                formData.waterUsageLitres === preset.value
                                  ? 'bg-green-50 border-primary-green text-primary-green'
                                  : 'bg-white border-gray-200 hover:border-primary-green/20'
                              }`}
                            >
                              {preset.emoji} {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live preview */}
                      <div className="p-4 rounded-xl bg-[#f3f7f5] border border-gray-200">
                        <div className="text-[10px] font-mono text-primary-green font-bold uppercase tracking-widest mb-3">
                          Live Estimate
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black font-display text-[#0f291e]">{calculatedValue}</span>
                          <span className="text-xs text-gray-400 font-bold">t CO₂ / year</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <TrendingDown className="w-3.5 h-3.5 text-primary-green" aria-hidden="true" />
                          <span className="text-xs text-primary-green font-bold">Score: {scoreData.score}/100 — {scoreData.label}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 6: REVIEW ─────────────────────────────────── */}
                  {step === 6 && (
                    <motion.div
                      key="step6"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="p-4 rounded-xl bg-[#f8fbf9] border border-gray-200">
                        <div className="text-xs text-primary-green font-mono uppercase tracking-widest mb-3 font-bold">Your Answers</div>
                        <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                          <div>
                            <div className="text-gray-400">Transport</div>
                            <div className="font-bold text-[#0f291e] mt-0.5">{formData.transportMode} ({formData.transportWeeklyDistance} km/wk)</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Heating</div>
                            <div className="font-bold text-[#0f291e] mt-0.5">{formData.heatingType}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Diet</div>
                            <div className="font-bold text-[#0f291e] mt-0.5">{formData.dietType}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Shopping</div>
                            <div className="font-bold text-[#0f291e] mt-0.5">{formData.shoppingFrequency}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Water/day</div>
                            <div className="font-bold text-[#0f291e] mt-0.5">{formData.waterUsageLitres} L</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Flights/yr</div>
                            <div className="font-bold text-[#0f291e] mt-0.5">{formData.flightsPerYear}</div>
                          </div>
                        </div>
                      </div>

                      {/* Live score preview */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200">
                        <div>
                          <div className="text-[10px] text-gray-400 font-mono uppercase font-bold">Estimated Footprint</div>
                          <div className="text-2xl font-black font-display text-[#0f291e] mt-0.5">{calculatedValue} t CO₂/yr</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-gray-400 font-mono uppercase font-bold">Eco Score</div>
                          <div className="text-2xl font-black font-display text-primary-green mt-0.5">{scoreData.score}/100</div>
                          <div className="text-[10px] text-gray-500 font-bold">{scoreData.label}</div>
                        </div>
                      </div>

                      <div className="flex gap-2.5 bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-xs leading-relaxed font-medium">
                          Results use regional guidelines. Your data stays local and is only synced if you connect your profile.
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 mt-2 rounded-xl bg-primary-green text-white font-bold hover:bg-secondary-green shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        Calculate & Get AI Recommendations
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                {step < TOTAL_STEPS && (
                  <div className="flex gap-3 mt-8">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-sm cursor-pointer"
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 px-8 py-3 rounded-xl bg-primary-green hover:bg-secondary-green text-white font-bold text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Right: Visual card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-80 h-auto sm:w-96 rounded-3xl bg-white border border-gray-150 shadow-sm flex flex-col items-center p-8 gap-6">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-green/5 rounded-full filter blur-2xl" />
                <div className="text-center relative z-10">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="w-32 h-32 rounded-2xl bg-gradient-to-b from-green-50 to-transparent border border-green-150 flex items-center justify-center mb-5 mx-auto"
                  >
                    <Leaf className="w-14 h-14 text-primary-green" aria-hidden="true" />
                  </motion.div>
                  <p className="text-sm font-bold text-[#0f291e]">Audit Progress: {getPercentageProgress()}%</p>
                  <p className="text-xs text-gray-400 font-semibold mt-1.5 leading-relaxed max-w-xs">
                    Answering {TOTAL_STEPS} questions to calculate your carbon footprint and unlock personalized AI coaching.
                  </p>
                </div>

                {/* Live mini-score */}
                {getPercentageProgress() > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full p-4 rounded-xl bg-[#f3f7f5] border border-gray-200 text-center"
                  >
                    <div className="text-[10px] font-mono text-primary-green uppercase font-bold mb-1">Live Estimate</div>
                    <div className="text-2xl font-black font-display text-[#0f291e]">{calculatedValue} t</div>
                    <div className="text-[10px] text-gray-400 font-bold">CO₂ per year</div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── RESULTS VIEW ─────────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-10"
          >
            {/* Hero result card */}
            <div className="p-8 sm:p-12 rounded-[32px] text-left relative overflow-hidden bg-gradient-to-tr from-[#0b2419] to-[#1c5039] border border-emerald-950 shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-green/10 rounded-full filter blur-3xl pointer-events-none" />
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                <div>
                  <span className="text-xs font-mono text-[#74c69d] font-bold tracking-widest uppercase mb-2 block">
                    YOUR ANNUAL FOOTPRINT
                  </span>
                  <div className="text-5xl sm:text-6xl font-extrabold font-display text-white tracking-tight flex items-baseline gap-2">
                    {calculatedValue}
                    <span className="text-lg font-bold text-[#a3cebc] uppercase font-sans">Tonnes CO₂ / Year</span>
                  </div>
                  <div className="text-sm mt-3 text-[#a3cebc] font-medium max-w-xl leading-relaxed">
                    Based on your{' '}
                    <strong>{formData.transportMode.toLowerCase()}</strong> commute,{' '}
                    <strong>{formData.dietType.toLowerCase()}</strong> diet, and home energy use.
                    Your score: <strong className="text-emerald-300">{scoreData.score}/100 ({scoreData.label})</strong>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3.5 rounded-xl border border-white/20 hover:bg-white/5 text-[#a3cebc] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-primary-green" aria-hidden="true" />
                    Recalculate
                  </button>
                  <button
                    onClick={() => {
                      const text = `My annual carbon footprint: ${calculatedValue} t CO₂ (Score: ${scoreData.score}/100 — ${scoreData.label}) via CarbonWise!`;
                      navigator.clipboard?.writeText(text).catch(() => {});
                    }}
                    className="px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-[#0f291e] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Send className="w-4 h-4 text-primary-green" aria-hidden="true" />
                    Share Results
                  </button>
                </div>
              </div>
            </div>

            {/* Sustainability Score Card */}
            <SustainabilityScoreCard score={scoreData} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-150 shadow-sm">
                <h2 className="font-display font-bold text-xl text-[#0f291e] mb-6">Emissions by Category</h2>
                <div className="h-64 sm:h-72 w-full relative">
                  <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        aria-label="Emissions breakdown pie chart"
                      >
                        {getPieData().map((entry, index) => (
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
                    <div className="text-3xl font-extrabold font-display text-[#0f291e]">{calculatedValue} t</div>
                    <div className="text-[10px] text-gray-400 font-mono font-bold">CO₂ / Year</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 justify-center text-[11px]">
                  {getPieData().map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} aria-hidden="true" />
                      <span className="text-gray-500 font-bold">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-150 shadow-sm">
                <h2 className="font-display font-bold text-xl text-[#0f291e] mb-6">Global Comparison</h2>
                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="99%" height="100%">
                    <BarChart data={getBarData()} layout="vertical" margin={{ left: -10, right: 20 }}>
                      <XAxis type="number" stroke="#d1dbd6" style={{ fontSize: '10px' }} unit=" t" />
                      <YAxis dataKey="name" type="category" stroke="#d1dbd6" style={{ fontSize: '10px' }} />
                      <Tooltip
                        contentStyle={{ background: '#ffffff', border: '1px solid #e2ece8', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(v: number) => [`${v} t CO₂`, 'Annual footprint']}
                      />
                      <Bar dataKey="footprint" radius={[0, 8, 8, 0]}>
                        {getBarData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#f8fbf9] border border-gray-200 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center border border-green-150">
                  <Sparkles className="w-5 h-5 text-primary-green" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-[#0f291e] flex items-center gap-2">
                    AI Sustainability Coach
                    <span className="text-[10px] bg-emerald-100 text-primary-green border border-emerald-200 font-mono px-1.5 py-0.5 rounded uppercase font-bold">
                      Personalized
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">
                    Ranked by: highest impact × lowest effort × lowest cost
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {recommendations.slice(0, 6).map((rec, i) => (
                  <RecommendationCard key={rec.id} rec={rec} rank={i + 1} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
