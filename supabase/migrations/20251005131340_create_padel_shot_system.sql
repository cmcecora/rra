/*
  # Padel Shot Simulator Database Schema

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `current_rating` (integer, default 1500)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `shots`
      - `id` (uuid, primary key)
      - `player_id` (uuid, references players)
      - `shot_type` (text)
      - `technical_execution` (text)
      - `outcome` (text)
      - `court_position` (text)
      - `match_context` (text)
      - `consecutive_shots` (integer)
      - `opponent_rating` (integer)
      - `player_rating_at_time` (integer)
      - `rating_change` (decimal)
      - `multiplier_applied` (decimal)
      - `notes` (text)
      - `created_at` (timestamptz)

    - `rating_history`
      - `id` (uuid, primary key)
      - `player_id` (uuid, references players)
      - `rating` (integer)
      - `change` (decimal)
      - `shot_id` (uuid, references shots)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  name text NOT NULL,
  current_rating integer DEFAULT 1500,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shots table
CREATE TABLE IF NOT EXISTS shots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players ON DELETE CASCADE,
  shot_type text NOT NULL,
  technical_execution text NOT NULL,
  outcome text NOT NULL,
  court_position text,
  match_context text,
  consecutive_shots integer DEFAULT 1,
  opponent_rating integer,
  player_rating_at_time integer NOT NULL,
  rating_change decimal(10,2) NOT NULL,
  multiplier_applied decimal(10,2) DEFAULT 1.0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create rating_history table
CREATE TABLE IF NOT EXISTS rating_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players ON DELETE CASCADE,
  rating integer NOT NULL,
  change decimal(10,2) NOT NULL,
  shot_id uuid REFERENCES shots ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_history ENABLE ROW LEVEL SECURITY;

-- Policies for players table
CREATE POLICY "Users can view all players"
  ON players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own player"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for shots table
CREATE POLICY "Users can view shots for their players"
  ON shots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = shots.player_id
      AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert shots for their players"
  ON shots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = shots.player_id
      AND players.user_id = auth.uid()
    )
  );

-- Policies for rating_history table
CREATE POLICY "Users can view rating history for their players"
  ON rating_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = rating_history.player_id
      AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rating history for their players"
  ON rating_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = rating_history.player_id
      AND players.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shots_player_id ON shots(player_id);
CREATE INDEX IF NOT EXISTS idx_shots_created_at ON shots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rating_history_player_id ON rating_history(player_id);
CREATE INDEX IF NOT EXISTS idx_rating_history_created_at ON rating_history(created_at DESC);