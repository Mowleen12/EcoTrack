/**
 * CarbonWise — Supabase Service Layer
 * All CRUD operations against the Supabase Postgres database.
 * Every function accepts a userId and only operates on that user's rows.
 */

import { supabase } from './supabase';
import type {
  CalculatorResult,
  UserGoal,
  AppNotification,
  OnboardingData,
} from '../types';

// ─── Profile ───────────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) { console.warn('[supabase] fetchProfile:', error.message); return null; }
  return data as { id: string; name: string; onboarding_data: OnboardingData | null };
}

export async function upsertProfile(
  userId: string,
  name: string,
  onboardingData?: OnboardingData | null,
) {
  if (!supabase) return;
  const payload: Record<string, unknown> = {
    id: userId,
    name,
    updated_at: new Date().toISOString(),
  };
  if (onboardingData !== undefined) payload.onboarding_data = onboardingData;
  const { error } = await supabase.from('profiles').upsert(payload);
  if (error) console.warn('[supabase] upsertProfile:', error.message);
}

// ─── Calculator Results ─────────────────────────────────────────────────────────

export async function fetchCalculatorResult(userId: string): Promise<CalculatorResult | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('calculator_results')
    .select('*')
    .eq('user_id', userId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) { console.warn('[supabase] fetchCalculatorResult:', error.message); return null; }
  if (!data) return null;
  return {
    totalTonnes: Number(data.total_tonnes),
    breakdown: data.breakdown as CalculatorResult['breakdown'],
    calculatedAt: data.calculated_at,
  };
}

export async function insertCalculatorResult(
  userId: string,
  result: CalculatorResult,
) {
  if (!supabase) return;
  const { error } = await supabase.from('calculator_results').insert({
    user_id: userId,
    total_tonnes: result.totalTonnes,
    breakdown: result.breakdown,
    calculated_at: result.calculatedAt,
  });
  if (error) console.warn('[supabase] insertCalculatorResult:', error.message);
}

// ─── Goals ──────────────────────────────────────────────────────────────────────

export async function fetchGoals(userId: string): Promise<UserGoal[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) { console.warn('[supabase] fetchGoals:', error.message); return []; }
  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    target: row.target,
    targetTonnes: Number(row.target_tonnes),
    currentTonnes: Number(row.current_tonnes),
    createdAt: row.created_at,
    primaryFocus: row.primary_focus,
  }));
}

export async function upsertGoal(userId: string, goal: UserGoal) {
  if (!supabase) return;
  const { error } = await supabase.from('user_goals').upsert({
    id: goal.id,
    user_id: userId,
    label: goal.label,
    target: goal.target,
    target_tonnes: goal.targetTonnes,
    current_tonnes: goal.currentTonnes,
    primary_focus: goal.primaryFocus,
    created_at: goal.createdAt,
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn('[supabase] upsertGoal:', error.message);
}

export async function deleteGoal(goalId: string) {
  if (!supabase) return;
  const { error } = await supabase.from('user_goals').delete().eq('id', goalId);
  if (error) console.warn('[supabase] deleteGoal:', error.message);
}

// ─── Notifications ──────────────────────────────────────────────────────────────

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { console.warn('[supabase] fetchNotifications:', error.message); return []; }
  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    createdAt: row.created_at,
    read: row.read,
    actionView: row.action_view ?? undefined,
  }));
}

export async function upsertNotification(userId: string, notif: AppNotification) {
  if (!supabase) return;
  const { error } = await supabase.from('notifications').upsert({
    id: notif.id,
    user_id: userId,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    read: notif.read,
    action_view: notif.actionView ?? null,
    created_at: notif.createdAt,
  });
  if (error) console.warn('[supabase] upsertNotification:', error.message);
}

export async function markNotificationsReadInDB(userId: string, ids: string[]) {
  if (!supabase || ids.length === 0) return;
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .in('id', ids);
  if (error) console.warn('[supabase] markNotificationsRead:', error.message);
}
