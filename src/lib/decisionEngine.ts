/**
 * CarbonWise — Rule-Based Decision Engine
 *
 * Analyzes a user's CalculatorState and produces:
 * 1. A ranked list of Recommendations (by impact × effort × cost)
 * 2. A SustainabilityScore (0–100) with label
 *
 * This engine is purely deterministic and runs client-side — no API required.
 */

import type { CalculatorState, Recommendation, SustainabilityScore, SustainabilityLabel } from '../types';

// ─── Emission Calculation Helpers ─────────────────────────────────────────────

/** Compute per-category annual emissions in kg CO₂. */
export function computeBreakdown(data: CalculatorState): {
  transport: number;
  energy: number;
  food: number;
  lifestyle: number;
  water: number;
} {
  // Transport
  let transport = 0;
  if (data.transportMode === 'Car') {
    transport = data.transportWeeklyDistance * 52 * 0.18;
  } else if (data.transportMode === 'Motorcycle') {
    transport = data.transportWeeklyDistance * 52 * 0.10;
  } else if (data.transportMode === 'Public Transport') {
    transport = data.transportWeeklyDistance * 52 * 0.04;
  } else if (data.transportMode === 'Bicycle' || data.transportMode === 'Walk') {
    transport = 0;
  }
  // Add flights (avg 255 kg CO₂ per flight)
  transport += (data.flightsPerYear ?? 0) * 255;

  // Energy
  let energy = data.electricityBill * 12 * 0.35;
  if (data.heatingType === 'Natural Gas') energy += 800;
  else if (data.heatingType === 'Heating Oil') energy += 1400;
  else if (data.heatingType === 'Electricity') energy += 1000;
  else energy += 150; // Solar/Heat Pump

  // Food
  let food = 1500;
  if (data.dietType === 'High Meat Eating') food = 2600;
  else if (data.dietType === 'Vegetarian') food = 900;
  else if (data.dietType === 'Vegan') food = 500;

  // Lifestyle/Shopping
  let lifestyle = 1000;
  if (data.shoppingFrequency === 'Very Often') lifestyle = 2200;
  else if (data.shoppingFrequency === 'Minimalist') lifestyle = 400;
  if (data.wasteRecycle) lifestyle -= 200;

  // Water (avg ~0.34 kg CO₂ per 1000L, using monthly litres)
  const waterLitres = data.waterUsageLitres ?? 150;
  const water = (waterLitres / 1000) * 0.34 * 365;

  return { transport, energy, food, lifestyle, water };
}

/** Compute total annual footprint in tonnes CO₂. */
export function computeTotalTonnes(data: CalculatorState): number {
  const b = computeBreakdown(data);
  const totalKg = b.transport + b.energy + b.food + b.lifestyle + b.water;
  return parseFloat((totalKg / 1000).toFixed(2));
}

// ─── Sustainability Scoring ────────────────────────────────────────────────────

/**
 * Maps annual tonnes CO₂ → a 0–100 score.
 * Global per-capita target for 1.5°C pathway ≈ 2.0 t/year.
 * US avg ≈ 16 t, World avg ≈ 4.5 t.
 *
 * Score = 100 × (1 − (tonnes / maxBenchmark)) clamped 0–100.
 */
export function computeSustainabilityScore(data: CalculatorState): SustainabilityScore {
  const total = computeTotalTonnes(data);
  const MAX_TONNES = 20; // Anything ≥ 20 t → score 0
  const raw = Math.max(0, (1 - total / MAX_TONNES) * 100);
  const score = Math.round(Math.min(100, raw));

  let label: SustainabilityLabel;
  let percentile: number;

  if (score <= 25) {
    label = 'Beginner';
    percentile = Math.round(score * 0.5);
  } else if (score <= 50) {
    label = 'Aware';
    percentile = Math.round(15 + (score - 25) * 0.8);
  } else if (score <= 75) {
    label = 'Sustainable';
    percentile = Math.round(35 + (score - 50) * 1.2);
  } else {
    label = 'Eco Champion';
    percentile = Math.round(65 + (score - 75) * 1.4);
  }

  return { score, label, percentile: Math.min(percentile, 99) };
}

// ─── Recommendation Templates ─────────────────────────────────────────────────

/** Full library of possible recommendations. */
const RECOMMENDATION_LIBRARY: Omit<Recommendation, 'priority'>[] = [
  // ── Transport ──────────────────────────────────────────────────────────────
  {
    id: 'switch-public-transit',
    title: 'Switch to Public Transport',
    description: 'Replace most car journeys with buses, trains, or trams.',
    whyItMatters: 'A single-occupancy car emits ~4.5× more CO₂ per km than a bus. By switching even 3 days per week you can cut your transport footprint by nearly half.',
    category: 'Transport',
    impactScore: 9,
    co2ReductionKg: 500,
    difficulty: 'Medium',
    costEstimate: 'Low',
    timeframeDays: 30,
  },
  {
    id: 'carpool-commute',
    title: 'Carpool With Colleagues',
    description: 'Share rides with co-workers to split fuel emissions across passengers.',
    whyItMatters: 'Carpooling halves your per-trip transport emissions instantly, with zero lifestyle changes needed.',
    category: 'Transport',
    impactScore: 7,
    co2ReductionKg: 350,
    difficulty: 'Easy',
    costEstimate: 'Free',
    timeframeDays: 7,
  },
  {
    id: 'cycle-short-trips',
    title: 'Cycle for Short Trips',
    description: 'Replace journeys under 5 km with cycling or walking.',
    whyItMatters: 'Short car trips are disproportionately carbon-intensive (cold engine, stop-start traffic). Cycling eliminates those emissions entirely.',
    category: 'Transport',
    impactScore: 8,
    co2ReductionKg: 450,
    difficulty: 'Easy',
    costEstimate: 'Low',
    timeframeDays: 1,
  },
  {
    id: 'reduce-flights',
    title: 'Reduce Air Travel',
    description: 'Replace one flight per year with a train journey or virtual meeting.',
    whyItMatters: 'A single long-haul flight can generate more CO₂ than two months of typical driving. Even one fewer flight has a massive impact.',
    category: 'Transport',
    impactScore: 10,
    co2ReductionKg: 700,
    difficulty: 'Hard',
    costEstimate: 'Free',
    timeframeDays: 365,
  },
  // ── Energy ─────────────────────────────────────────────────────────────────
  {
    id: 'heat-pump-upgrade',
    title: 'Switch to a Heat Pump',
    description: 'Replace your gas or oil boiler with an electric heat pump.',
    whyItMatters: 'Heat pumps are 3–4× more efficient than gas boilers. As your electricity grid decarbonizes, your heating automatically gets greener too.',
    category: 'Energy',
    impactScore: 10,
    co2ReductionKg: 1200,
    difficulty: 'Hard',
    costEstimate: 'High',
    timeframeDays: 90,
  },
  {
    id: 'renewable-tariff',
    title: 'Switch to a Renewable Energy Tariff',
    description: 'Change your electricity supplier to a certified 100% renewable tariff.',
    whyItMatters: 'Your home electricity use accounts for a large share of your footprint. Switching to green energy can cut this to near-zero instantly.',
    category: 'Energy',
    impactScore: 9,
    co2ReductionKg: 800,
    difficulty: 'Easy',
    costEstimate: 'Low',
    timeframeDays: 14,
  },
  {
    id: 'smart-thermostat',
    title: 'Install a Smart Thermostat',
    description: 'Program your heating to only run when needed.',
    whyItMatters: 'Heating accounts for up to 50% of home energy use. A smart thermostat saves ~10% on bills while cutting emissions proportionally.',
    category: 'Energy',
    impactScore: 7,
    co2ReductionKg: 220,
    difficulty: 'Easy',
    costEstimate: 'Medium',
    timeframeDays: 30,
  },
  {
    id: 'led-lighting',
    title: 'Switch to LED Lighting',
    description: 'Replace all incandescent and halogen bulbs with LEDs.',
    whyItMatters: 'LEDs use 75–80% less energy than incandescents, last 25× longer, and pay back their cost within months.',
    category: 'Energy',
    impactScore: 5,
    co2ReductionKg: 100,
    difficulty: 'Easy',
    costEstimate: 'Low',
    timeframeDays: 1,
  },
  // ── Food ───────────────────────────────────────────────────────────────────
  {
    id: 'reduce-red-meat',
    title: 'Cut Red Meat to Once a Week',
    description: 'Replace beef and lamb with chicken, fish, or plant proteins most days.',
    whyItMatters: 'Beef produces ~60 kg CO₂e per kg of food — 30× more than legumes. Reducing red meat 3 days/week saves the equivalent of not driving for 3 months.',
    category: 'Food',
    impactScore: 9,
    co2ReductionKg: 600,
    difficulty: 'Easy',
    costEstimate: 'Free',
    timeframeDays: 7,
  },
  {
    id: 'plant-based-days',
    title: 'Adopt 2 Vegan Days Per Week',
    description: 'Choose entirely plant-based meals on two days each week.',
    whyItMatters: 'Plant foods require up to 18× less land and generate far fewer greenhouse gases than animal products per calorie.',
    category: 'Food',
    impactScore: 8,
    co2ReductionKg: 400,
    difficulty: 'Easy',
    costEstimate: 'Free',
    timeframeDays: 7,
  },
  {
    id: 'local-seasonal-food',
    title: 'Buy Local & Seasonal Produce',
    description: 'Shop at farmers markets or buy locally grown food in season.',
    whyItMatters: 'Air-freighted food can generate 50× more CO₂ than locally produced equivalents. Seasonal eating also reduces refrigeration energy.',
    category: 'Food',
    impactScore: 6,
    co2ReductionKg: 180,
    difficulty: 'Medium',
    costEstimate: 'Free',
    timeframeDays: 14,
  },
  {
    id: 'reduce-food-waste',
    title: 'Cut Food Waste by Half',
    description: 'Plan meals, use leftovers, and compost organic waste.',
    whyItMatters: 'One-third of all food produced globally is wasted. Food waste in landfill generates methane — 80× more potent than CO₂ over 20 years.',
    category: 'Food',
    impactScore: 7,
    co2ReductionKg: 250,
    difficulty: 'Easy',
    costEstimate: 'Free',
    timeframeDays: 7,
  },
  // ── Lifestyle ──────────────────────────────────────────────────────────────
  {
    id: 'buy-secondhand',
    title: 'Buy Second-Hand Clothing',
    description: 'Source clothes from thrift stores, swaps, or resale apps.',
    whyItMatters: 'Fashion accounts for 10% of global carbon emissions. A single new cotton T-shirt generates ~5 kg CO₂ in production. Second-hand eliminates that.',
    category: 'Lifestyle',
    impactScore: 6,
    co2ReductionKg: 200,
    difficulty: 'Easy',
    costEstimate: 'Free',
    timeframeDays: 7,
  },
  {
    id: 'reduce-streaming',
    title: 'Lower Digital Consumption',
    description: 'Reduce video streaming quality and unsubscribe from unused services.',
    whyItMatters: 'Global data centres consume ~1% of world electricity. Streaming HD video for 1 hour emits ~36g CO₂. Small changes across millions add up.',
    category: 'Lifestyle',
    impactScore: 3,
    co2ReductionKg: 50,
    difficulty: 'Easy',
    costEstimate: 'Free',
    timeframeDays: 1,
  },
  {
    id: 'recycle-sort',
    title: 'Consistently Sort & Recycle',
    description: 'Properly sort paper, plastic, metal, and glass for recycling.',
    whyItMatters: 'Recycling aluminium saves 95% of the energy needed to produce new metal. Proper sorting ensures materials actually get recycled.',
    category: 'Lifestyle',
    impactScore: 4,
    co2ReductionKg: 150,
    difficulty: 'Easy',
    costEstimate: 'Free',
    timeframeDays: 1,
  },
  // ── Water ──────────────────────────────────────────────────────────────────
  {
    id: 'shorter-showers',
    title: 'Take Shorter Showers',
    description: 'Cut shower time to 5 minutes and install a low-flow showerhead.',
    whyItMatters: 'Hot water heating accounts for a significant portion of home energy use. Cutting shower time by 4 minutes/day saves ~250 kg CO₂/year.',
    category: 'Water',
    impactScore: 5,
    co2ReductionKg: 120,
    difficulty: 'Easy',
    costEstimate: 'Free',
    timeframeDays: 1,
  },
];

// ─── Priority Scoring ─────────────────────────────────────────────────────────

const COST_SCORE: Record<string, number> = {
  Free: 4,
  Low: 3,
  Medium: 2,
  High: 1,
};

const DIFFICULTY_SCORE: Record<string, number> = {
  Easy: 3,
  Medium: 2,
  Hard: 1,
};

/** Lower priority number = higher in the list. */
function computePriority(rec: Omit<Recommendation, 'priority'>): number {
  const effort = DIFFICULTY_SCORE[rec.difficulty] ?? 1;
  const cost = COST_SCORE[rec.costEstimate] ?? 1;
  // Higher impact + easier + cheaper = lower (better) priority number
  return 100 - (rec.impactScore * 4 + effort * 3 + cost * 2);
}

// ─── Main Analyzer ─────────────────────────────────────────────────────────────

/**
 * Analyzes a CalculatorState and returns a ranked list of Recommendations.
 * Recommendations are filtered by user's emission profile, then ranked by priority.
 */
export function analyzeFootprint(data: CalculatorState): Recommendation[] {
  const breakdown = computeBreakdown(data);
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  // Determine which categories are "high" relative to total
  const pct = {
    transport: breakdown.transport / total,
    energy: breakdown.energy / total,
    food: breakdown.food / total,
    lifestyle: breakdown.lifestyle / total,
    water: breakdown.water / total,
  };

  const applicable: Omit<Recommendation, 'priority'>[] = [];

  // ── Transport recommendations ──────────────────────────────────────────────
  if (data.transportMode === 'Car' || data.transportMode === 'Motorcycle') {
    applicable.push(
      RECOMMENDATION_LIBRARY.find((r) => r.id === 'switch-public-transit')!,
      RECOMMENDATION_LIBRARY.find((r) => r.id === 'carpool-commute')!,
      RECOMMENDATION_LIBRARY.find((r) => r.id === 'cycle-short-trips')!,
    );
  }
  if ((data.flightsPerYear ?? 0) >= 2) {
    applicable.push(RECOMMENDATION_LIBRARY.find((r) => r.id === 'reduce-flights')!);
  }

  // ── Energy recommendations ─────────────────────────────────────────────────
  if (data.heatingType === 'Natural Gas' || data.heatingType === 'Heating Oil') {
    applicable.push(
      RECOMMENDATION_LIBRARY.find((r) => r.id === 'heat-pump-upgrade')!,
      RECOMMENDATION_LIBRARY.find((r) => r.id === 'renewable-tariff')!,
    );
  }
  if (data.electricityBill > 100 || pct.energy > 0.25) {
    applicable.push(
      RECOMMENDATION_LIBRARY.find((r) => r.id === 'smart-thermostat')!,
      RECOMMENDATION_LIBRARY.find((r) => r.id === 'led-lighting')!,
    );
  }

  // ── Food recommendations ───────────────────────────────────────────────────
  if (data.dietType === 'High Meat Eating') {
    applicable.push(
      RECOMMENDATION_LIBRARY.find((r) => r.id === 'reduce-red-meat')!,
      RECOMMENDATION_LIBRARY.find((r) => r.id === 'plant-based-days')!,
    );
  } else if (data.dietType === 'Average Meat') {
    applicable.push(
      RECOMMENDATION_LIBRARY.find((r) => r.id === 'reduce-red-meat')!,
      RECOMMENDATION_LIBRARY.find((r) => r.id === 'local-seasonal-food')!,
    );
  }
  applicable.push(RECOMMENDATION_LIBRARY.find((r) => r.id === 'reduce-food-waste')!);

  // ── Lifestyle recommendations ──────────────────────────────────────────────
  if (data.shoppingFrequency === 'Very Often' || data.shoppingFrequency === 'Average') {
    applicable.push(RECOMMENDATION_LIBRARY.find((r) => r.id === 'buy-secondhand')!);
  }
  if (!data.wasteRecycle) {
    applicable.push(RECOMMENDATION_LIBRARY.find((r) => r.id === 'recycle-sort')!);
  }
  applicable.push(RECOMMENDATION_LIBRARY.find((r) => r.id === 'reduce-streaming')!);

  // ── Water recommendations ─────────────────────────────────────────────────
  if ((data.waterUsageLitres ?? 150) > 100) {
    applicable.push(RECOMMENDATION_LIBRARY.find((r) => r.id === 'shorter-showers')!);
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = applicable.filter((r) => {
    if (!r || seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  // Boost recommendations in the user's highest-emission category
  const topCategory =
    pct.transport > pct.energy && pct.transport > pct.food
      ? 'Transport'
      : pct.energy > pct.food
      ? 'Energy'
      : 'Food';

  // Rank: compute priority, boost top-category items
  const ranked: Recommendation[] = unique
    .map((r) => ({
      ...r,
      priority: computePriority(r) - (r.category.toLowerCase() === topCategory.toLowerCase() ? 15 : 0),
    }))
    .sort((a, b) => a.priority - b.priority);

  return ranked;
}
