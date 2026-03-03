/*
  # Create Trader Detail Tables

  1. New Tables
    - `trader_details`
      - `id` (uuid, primary key) - Unique identifier
      - `trader_id` (uuid, foreign key) - Reference to traders table
      - `total_deposit` (numeric) - Initial deposit amount
      - `current_balance` (numeric) - Current account balance
      - `created_at` (timestamptz) - Record creation
      - `updated_at` (timestamptz) - Last update

    - `equity_history`
      - `id` (uuid, primary key) - Unique identifier
      - `trader_id` (uuid, foreign key) - Reference to traders table
      - `date` (date) - Date of equity snapshot
      - `equity` (numeric) - Equity amount at that date
      - `created_at` (timestamptz) - Record creation

    - `trade_history`
      - `id` (uuid, primary key) - Unique identifier
      - `trader_id` (uuid, foreign key) - Reference to traders table
      - `symbol` (text) - Trading symbol (e.g., XAUUSD)
      - `type` (text) - Trade type: 'buy' or 'sell'
      - `lot` (numeric) - Lot size
      - `entry_price` (numeric) - Entry price
      - `exit_price` (numeric) - Exit price
      - `profit` (numeric) - Profit/loss from trade
      - `date` (timestamptz) - Trade execution date
      - `created_at` (timestamptz) - Record creation

  2. Security
    - Enable RLS on all new tables
    - Public read access for all data
    - Authenticated users can insert/update

  3. Indexes
    - Index on trader_id for efficient queries
    - Index on date for equity history sorting
    - Index on symbol for trade filtering
*/

-- Create trader_details table
CREATE TABLE IF NOT EXISTS trader_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id uuid NOT NULL REFERENCES traders(id) ON DELETE CASCADE,
  total_deposit numeric(15, 2) NOT NULL DEFAULT 0,
  current_balance numeric(15, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(trader_id)
);


CREATE TABLE IF NOT EXISTS equity_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id uuid NOT NULL REFERENCES traders(id) ON DELETE CASCADE,
  date date NOT NULL,
  equity numeric(15, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);


CREATE TABLE IF NOT EXISTS trade_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id uuid NOT NULL REFERENCES traders(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  type text NOT NULL CHECK (type IN ('buy', 'sell')),
  lot numeric(10, 2) NOT NULL,
  entry_price numeric(15, 4) NOT NULL,
  exit_price numeric(15, 4) NOT NULL,
  profit numeric(15, 2) NOT NULL,
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);


ALTER TABLE trader_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE equity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_history ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Anyone can view trader details"
  ON trader_details
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert trader details"
  ON trader_details
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update trader details"
  ON trader_details
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


CREATE POLICY "Anyone can view equity history"
  ON equity_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert equity history"
  ON equity_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);


CREATE POLICY "Anyone can view trade history"
  ON trade_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert trade history"
  ON trade_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);


CREATE INDEX IF NOT EXISTS idx_trader_details_trader_id ON trader_details(trader_id);
CREATE INDEX IF NOT EXISTS idx_equity_history_trader_id ON equity_history(trader_id);
CREATE INDEX IF NOT EXISTS idx_equity_history_date ON equity_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_trade_history_trader_id ON trade_history(trader_id);
CREATE INDEX IF NOT EXISTS idx_trade_history_symbol ON trade_history(symbol);
