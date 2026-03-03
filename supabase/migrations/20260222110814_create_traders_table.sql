/*
  # Create Traders Table for FTC Trading Competition

  1. New Tables
    - `traders`
      - `id` (uuid, primary key) - Unique identifier for each trader
      - `trader_name` (text) - Name of the trader
      - `growth_percentage` (numeric) - Growth percentage (can be positive or negative)
      - `drawdown_percentage` (numeric) - Drawdown percentage
      - `current_equity` (numeric) - Current equity amount
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `traders` table
    - Add policy for public read access (leaderboard is publicly viewable)
    - Add policy for authenticated users to insert/update trader data

  3. Indexes
    - Add index on growth_percentage for efficient ranking queries
*/

-- Create traders table
CREATE TABLE IF NOT EXISTS traders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_name text NOT NULL,
  growth_percentage numeric(10, 2) NOT NULL DEFAULT 0,
  drawdown_percentage numeric(10, 2) NOT NULL DEFAULT 0,
  current_equity numeric(15, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


ALTER TABLE traders ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Anyone can view traders"
  ON traders
  FOR SELECT
  TO public
  USING (true);


CREATE POLICY "Authenticated users can insert traders"
  ON traders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);


CREATE POLICY "Authenticated users can update traders"
  ON traders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


CREATE INDEX IF NOT EXISTS idx_traders_growth_percentage 
  ON traders(growth_percentage DESC);


INSERT INTO traders (trader_name, growth_percentage, drawdown_percentage, current_equity)
VALUES 
  ('Alex Morgan', 156.75, 8.50, 256750.00),
  ('Sarah Chen', 142.30, 12.20, 242300.00),
  ('Michael Ross', 138.90, 15.75, 238900.00),
  ('Emma Wilson', 125.45, 9.80, 225450.00),
  ('James Park', 118.60, 18.30, 218600.00),
  ('Olivia Smith', 112.25, 11.40, 212250.00),
  ('Daniel Kim', 105.80, 14.90, 205800.00),
  ('Sophia Martinez', 98.50, 10.20, 198500.00),
  ('Liam Johnson', 92.35, 16.50, 192350.00),
  ('Isabella Brown', 85.70, 13.60, 185700.00),
  ('Noah Davis', 78.90, 19.20, 178900.00),
  ('Ava Taylor', 72.40, 8.90, 172400.00),
  ('Ethan Anderson', 65.15, 21.40, 165150.00),
  ('Mia Thomas', 58.80, 12.80, 158800.00),
  ('Lucas White', 52.30, 17.10, 152300.00);
