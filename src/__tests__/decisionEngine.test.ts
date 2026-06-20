/**
 * Tests for the Decision Engine (decisionEngine.ts)
 * Tests: computeBreakdown, computeTotalTonnes, computeSustainabilityScore, analyzeFootprint
 */

import { describe, it, expect } from 'vitest';
import {
  computeBreakdown,
  computeTotalTonnes,
  computeSustainabilityScore,
  analyzeFootprint,
} from '../lib/decisionEngine';
import type { CalculatorState } from '../types';

const BASE_STATE: CalculatorState = {
  transportMode: 'Car',
  transportWeeklyDistance: 100,
  publicTransportUse: '3-5 days per week',
  electricityBill: 100,
  heatingType: 'Natural Gas',
  dietType: 'Average Meat',
  wasteRecycle: false,
  shoppingFrequency: 'Average',
  waterUsageLitres: 150,
  flightsPerYear: 0,
};

// ─── computeBreakdown ─────────────────────────────────────────────────────────

describe('computeBreakdown', () => {
  it('returns non-negative values for each category', () => {
    const breakdown = computeBreakdown(BASE_STATE);
    expect(breakdown.transport).toBeGreaterThanOrEqual(0);
    expect(breakdown.energy).toBeGreaterThanOrEqual(0);
    expect(breakdown.food).toBeGreaterThanOrEqual(0);
    expect(breakdown.lifestyle).toBeGreaterThanOrEqual(0);
    expect(breakdown.water).toBeGreaterThanOrEqual(0);
  });

  it('emits zero transport for walking mode', () => {
    const state: CalculatorState = { ...BASE_STATE, transportMode: 'Walk', flightsPerYear: 0 };
    const breakdown = computeBreakdown(state);
    expect(breakdown.transport).toBe(0);
  });

  it('emits zero transport for bicycle mode', () => {
    const state: CalculatorState = { ...BASE_STATE, transportMode: 'Bicycle', flightsPerYear: 0 };
    const breakdown = computeBreakdown(state);
    expect(breakdown.transport).toBe(0);
  });

  it('calculates higher transport for car vs public transport', () => {
    const carState: CalculatorState = { ...BASE_STATE, transportMode: 'Car' };
    const ptState: CalculatorState = { ...BASE_STATE, transportMode: 'Public Transport' };
    expect(computeBreakdown(carState).transport).toBeGreaterThan(computeBreakdown(ptState).transport);
  });

  it('adds flight emissions correctly (255 kg per flight)', () => {
    const noFlight: CalculatorState = { ...BASE_STATE, transportMode: 'Walk', flightsPerYear: 0 };
    const twoFlights: CalculatorState = { ...BASE_STATE, transportMode: 'Walk', flightsPerYear: 2 };
    const diff = computeBreakdown(twoFlights).transport - computeBreakdown(noFlight).transport;
    expect(diff).toBeCloseTo(510, 0); // 2 × 255 = 510
  });

  it('vegan diet produces lowest food emissions', () => {
    const vegan: CalculatorState = { ...BASE_STATE, dietType: 'Vegan' };
    const highMeat: CalculatorState = { ...BASE_STATE, dietType: 'High Meat Eating' };
    expect(computeBreakdown(vegan).food).toBeLessThan(computeBreakdown(highMeat).food);
  });

  it('recycling reduces lifestyle emissions', () => {
    const noRecycle: CalculatorState = { ...BASE_STATE, wasteRecycle: false };
    const recycle: CalculatorState = { ...BASE_STATE, wasteRecycle: true };
    expect(computeBreakdown(recycle).lifestyle).toBeLessThan(computeBreakdown(noRecycle).lifestyle);
  });

  it('heating oil produces more energy emissions than solar', () => {
    const oil: CalculatorState = { ...BASE_STATE, heatingType: 'Heating Oil' };
    const solar: CalculatorState = { ...BASE_STATE, heatingType: 'Solar/Heat Pump' };
    expect(computeBreakdown(oil).energy).toBeGreaterThan(computeBreakdown(solar).energy);
  });
});

// ─── computeTotalTonnes ───────────────────────────────────────────────────────

describe('computeTotalTonnes', () => {
  it('returns a positive number', () => {
    expect(computeTotalTonnes(BASE_STATE)).toBeGreaterThan(0);
  });

  it('minimal footprint scenario returns less than high footprint', () => {
    const minimal: CalculatorState = {
      transportMode: 'Walk',
      transportWeeklyDistance: 0,
      publicTransportUse: '3-5 days per week',
      electricityBill: 20,
      heatingType: 'Solar/Heat Pump',
      dietType: 'Vegan',
      wasteRecycle: true,
      shoppingFrequency: 'Minimalist',
      waterUsageLitres: 20,
      flightsPerYear: 0,
    };
    const heavy: CalculatorState = {
      transportMode: 'Car',
      transportWeeklyDistance: 500,
      publicTransportUse: 'Never',
      electricityBill: 500,
      heatingType: 'Heating Oil',
      dietType: 'High Meat Eating',
      wasteRecycle: false,
      shoppingFrequency: 'Very Often',
      waterUsageLitres: 500,
      flightsPerYear: 20,
    };
    expect(computeTotalTonnes(minimal)).toBeLessThan(computeTotalTonnes(heavy));
  });

  it('returns value rounded to 2 decimal places', () => {
    const result = computeTotalTonnes(BASE_STATE);
    expect(result).toBe(parseFloat(result.toFixed(2)));
  });
});

// ─── computeSustainabilityScore ───────────────────────────────────────────────

describe('computeSustainabilityScore', () => {
  it('score is between 0 and 100', () => {
    const result = computeSustainabilityScore(BASE_STATE);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('very high emissions → Beginner label', () => {
    const heavy: CalculatorState = {
      ...BASE_STATE,
      transportMode: 'Car',
      transportWeeklyDistance: 500,
      electricityBill: 500,
      heatingType: 'Heating Oil',
      dietType: 'High Meat Eating',
      flightsPerYear: 20,
    };
    const result = computeSustainabilityScore(heavy);
    expect(result.label).toBe('Beginner');
    expect(result.score).toBeLessThanOrEqual(25);
  });

  it('minimal emissions → Eco Champion label', () => {
    const clean: CalculatorState = {
      ...BASE_STATE,
      transportMode: 'Walk',
      transportWeeklyDistance: 0,
      electricityBill: 20,
      heatingType: 'Solar/Heat Pump',
      dietType: 'Vegan',
      wasteRecycle: true,
      shoppingFrequency: 'Minimalist',
      waterUsageLitres: 20,
      flightsPerYear: 0,
    };
    const result = computeSustainabilityScore(clean);
    expect(result.label).toBe('Eco Champion');
    expect(result.score).toBeGreaterThanOrEqual(76);
  });

  it('percentile is between 0 and 99', () => {
    const result = computeSustainabilityScore(BASE_STATE);
    expect(result.percentile).toBeGreaterThanOrEqual(0);
    expect(result.percentile).toBeLessThanOrEqual(99);
  });
});

// ─── analyzeFootprint ─────────────────────────────────────────────────────────

describe('analyzeFootprint', () => {
  it('returns an array of recommendations', () => {
    const result = analyzeFootprint(BASE_STATE);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('each recommendation has required fields', () => {
    const result = analyzeFootprint(BASE_STATE);
    result.forEach((rec) => {
      expect(rec.id).toBeDefined();
      expect(rec.title).toBeDefined();
      expect(rec.category).toBeDefined();
      expect(rec.impactScore).toBeGreaterThan(0);
      expect(rec.co2ReductionKg).toBeGreaterThan(0);
      expect(['Easy', 'Medium', 'Hard']).toContain(rec.difficulty);
      expect(['Free', 'Low', 'Medium', 'High']).toContain(rec.costEstimate);
      expect(rec.timeframeDays).toBeGreaterThan(0);
    });
  });

  it('no duplicate recommendation IDs', () => {
    const result = analyzeFootprint(BASE_STATE);
    const ids = result.map((r) => r.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('car driver gets transport recommendations', () => {
    const state: CalculatorState = { ...BASE_STATE, transportMode: 'Car' };
    const result = analyzeFootprint(state);
    const transportRecs = result.filter((r) => r.category === 'Transport');
    expect(transportRecs.length).toBeGreaterThan(0);
  });

  it('vegan with solar gets fewer transport/food recs', () => {
    const greenState: CalculatorState = {
      ...BASE_STATE,
      transportMode: 'Bicycle',
      flightsPerYear: 0,
      dietType: 'Vegan',
      heatingType: 'Solar/Heat Pump',
      electricityBill: 20,
    };
    const result = analyzeFootprint(greenState);
    const transportRecs = result.filter((r) => r.category === 'Transport');
    expect(transportRecs.length).toBe(0); // No car/flight, no transport recs
  });

  it('recommendations are sorted by priority (ascending)', () => {
    const result = analyzeFootprint(BASE_STATE);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].priority).toBeLessThanOrEqual(result[i].priority);
    }
  });
});
