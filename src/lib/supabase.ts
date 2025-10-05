import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Player = {
  id: string;
  user_id: string;
  name: string;
  current_rating: number;
  created_at: string;
  updated_at: string;
};

export type Shot = {
  id: string;
  player_id: string;
  shot_type: string;
  technical_execution: string;
  outcome: string;
  court_position: string;
  match_context: string;
  consecutive_shots: number;
  opponent_rating: number;
  player_rating_at_time: number;
  rating_change: number;
  multiplier_applied: number;
  notes: string;
  created_at: string;
};

export type RatingHistory = {
  id: string;
  player_id: string;
  rating: number;
  change: number;
  shot_id: string;
  created_at: string;
};
