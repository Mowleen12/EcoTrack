/**
 * CarbonWise — Supabase Client
 * Initializes the Supabase client from Vite environment variables.
 * If the env vars are not set the client will be null and the app
 * gracefully falls back to localStorage-only mode.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client instance.
 * Will be `null` if environment variables are not configured,
 * allowing the app to run in localStorage-only mode.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const isSupabaseConfigured = !!supabase;
