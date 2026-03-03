/*
  # Populate Trader Details Tables with Sample Data

  1. Insert trader details for all traders
  2. Insert equity history showing progression over 60 days
  3. Insert XAUUSD trade history for each trader
*/

-- Insert trader_details for all existing traders
INSERT INTO trader_details (trader_id, total_deposit, current_balance)
SELECT 
  id,
  CASE 
    WHEN trader_name = 'Alex Morgan' THEN 100000
    WHEN trader_name = 'Sarah Chen' THEN 100000
    WHEN trader_name = 'Michael Ross' THEN 100000
    WHEN trader_name = 'Emma Wilson' THEN 100000
    WHEN trader_name = 'James Park' THEN 100000
    WHEN trader_name = 'Olivia Smith' THEN 100000
    WHEN trader_name = 'Daniel Kim' THEN 100000
    WHEN trader_name = 'Sophia Martinez' THEN 100000
    WHEN trader_name = 'Liam Johnson' THEN 100000
    WHEN trader_name = 'Isabella Brown' THEN 100000
    WHEN trader_name = 'Noah Davis' THEN 100000
    WHEN trader_name = 'Ava Taylor' THEN 100000
    WHEN trader_name = 'Ethan Anderson' THEN 100000
    WHEN trader_name = 'Mia Thomas' THEN 100000
    WHEN trader_name = 'Lucas White' THEN 100000
    ELSE 100000
  END as total_deposit,
  CASE 
    WHEN trader_name = 'Alex Morgan' THEN 256750
    WHEN trader_name = 'Sarah Chen' THEN 242300
    WHEN trader_name = 'Michael Ross' THEN 238900
    WHEN trader_name = 'Emma Wilson' THEN 225450
    WHEN trader_name = 'James Park' THEN 218600
    WHEN trader_name = 'Olivia Smith' THEN 212250
    WHEN trader_name = 'Daniel Kim' THEN 205800
    WHEN trader_name = 'Sophia Martinez' THEN 198500
    WHEN trader_name = 'Liam Johnson' THEN 192350
    WHEN trader_name = 'Isabella Brown' THEN 185700
    WHEN trader_name = 'Noah Davis' THEN 178900
    WHEN trader_name = 'Ava Taylor' THEN 172400
    WHEN trader_name = 'Ethan Anderson' THEN 165150
    WHEN trader_name = 'Mia Thomas' THEN 158800
    WHEN trader_name = 'Lucas White' THEN 152300
    ELSE 100000
  END as current_balance
FROM traders
ON CONFLICT (trader_id) DO NOTHING;


WITH alex_id AS (
  SELECT id FROM traders WHERE trader_name = 'Alex Morgan'
)
INSERT INTO equity_history (trader_id, date, equity)
SELECT 
  (SELECT id FROM alex_id),
  CURRENT_DATE - interval '60 days' + (num || ' days')::interval,
  100000 + (156.75 / 60 * num * 1000 * (1 + RANDOM() * 0.1))
FROM generate_series(0, 59) as num
ON CONFLICT DO NOTHING;


WITH sarah_id AS (
  SELECT id FROM traders WHERE trader_name = 'Sarah Chen'
)
INSERT INTO equity_history (trader_id, date, equity)
SELECT 
  (SELECT id FROM sarah_id),
  CURRENT_DATE - interval '60 days' + (num || ' days')::interval,
  100000 + (142.30 / 60 * num * 1000 * (1 + RANDOM() * 0.1))
FROM generate_series(0, 59) as num
ON CONFLICT DO NOTHING;


WITH michael_id AS (
  SELECT id FROM traders WHERE trader_name = 'Michael Ross'
)
INSERT INTO equity_history (trader_id, date, equity)
SELECT 
  (SELECT id FROM michael_id),
  CURRENT_DATE - interval '60 days' + (num || ' days')::interval,
  100000 + (138.90 / 60 * num * 1000 * (1 + RANDOM() * 0.1))
FROM generate_series(0, 59) as num
ON CONFLICT DO NOTHING;


WITH alex_id AS (
  SELECT id FROM traders WHERE trader_name = 'Alex Morgan'
)
INSERT INTO trade_history (trader_id, symbol, type, lot, entry_price, exit_price, profit, date)
VALUES 
  ((SELECT id FROM alex_id), 'XAUUSD', 'buy', 1.5, 2000.50, 2050.75, 760.00, CURRENT_TIMESTAMP - interval '50 days'),
  ((SELECT id FROM alex_id), 'XAUUSD', 'sell', 2.0, 2055.00, 2025.50, 590.00, CURRENT_TIMESTAMP - interval '45 days'),
  ((SELECT id FROM alex_id), 'XAUUSD', 'buy', 1.8, 2010.25, 2080.00, 1260.00, CURRENT_TIMESTAMP - interval '40 days'),
  ((SELECT id FROM alex_id), 'XAUUSD', 'sell', 2.5, 2085.00, 2055.00, 750.00, CURRENT_TIMESTAMP - interval '35 days'),
  ((SELECT id FROM alex_id), 'XAUUSD', 'buy', 2.0, 2045.50, 2120.00, 1500.00, CURRENT_TIMESTAMP - interval '30 days'),
  ((SELECT id FROM alex_id), 'XAUUSD', 'sell', 1.5, 2125.00, 2095.50, 442.00, CURRENT_TIMESTAMP - interval '20 days'),
  ((SELECT id FROM alex_id), 'XAUUSD', 'buy', 2.2, 2090.00, 2150.00, 1320.00, CURRENT_TIMESTAMP - interval '10 days'),
  ((SELECT id FROM alex_id), 'XAUUSD', 'sell', 1.8, 2155.00, 2130.00, 450.00, CURRENT_TIMESTAMP - interval '5 days')
ON CONFLICT DO NOTHING;


WITH sarah_id AS (
  SELECT id FROM traders WHERE trader_name = 'Sarah Chen'
)
INSERT INTO trade_history (trader_id, symbol, type, lot, entry_price, exit_price, profit, date)
VALUES 
  ((SELECT id FROM sarah_id), 'XAUUSD', 'buy', 1.5, 2000.50, 2040.00, 591.00, CURRENT_TIMESTAMP - interval '48 days'),
  ((SELECT id FROM sarah_id), 'XAUUSD', 'sell', 2.0, 2045.00, 2020.00, 500.00, CURRENT_TIMESTAMP - interval '42 days'),
  ((SELECT id FROM sarah_id), 'XAUUSD', 'buy', 1.8, 2015.00, 2070.00, 990.00, CURRENT_TIMESTAMP - interval '37 days'),
  ((SELECT id FROM sarah_id), 'XAUUSD', 'sell', 2.0, 2075.00, 2050.00, 500.00, CURRENT_TIMESTAMP - interval '32 days'),
  ((SELECT id FROM sarah_id), 'XAUUSD', 'buy', 1.5, 2040.00, 2100.00, 900.00, CURRENT_TIMESTAMP - interval '25 days'),
  ((SELECT id FROM sarah_id), 'XAUUSD', 'sell', 2.2, 2105.00, 2080.00, 550.00, CURRENT_TIMESTAMP - interval '15 days')
ON CONFLICT DO NOTHING;


WITH michael_id AS (
  SELECT id FROM traders WHERE trader_name = 'Michael Ross'
)
INSERT INTO trade_history (trader_id, symbol, type, lot, entry_price, exit_price, profit, date)
VALUES 
  ((SELECT id FROM michael_id), 'XAUUSD', 'buy', 1.5, 2000.00, 2035.00, 526.00, CURRENT_TIMESTAMP - interval '52 days'),
  ((SELECT id FROM michael_id), 'XAUUSD', 'sell', 1.8, 2040.00, 2015.00, 450.00, CURRENT_TIMESTAMP - interval '47 days'),
  ((SELECT id FROM michael_id), 'XAUUSD', 'buy', 2.0, 2010.00, 2065.00, 1100.00, CURRENT_TIMESTAMP - interval '41 days'),
  ((SELECT id FROM michael_id), 'XAUUSD', 'sell', 1.5, 2070.00, 2045.00, 375.00, CURRENT_TIMESTAMP - interval '36 days'),
  ((SELECT id FROM michael_id), 'XAUUSD', 'buy', 2.2, 2040.00, 2090.00, 1100.00, CURRENT_TIMESTAMP - interval '28 days')
ON CONFLICT DO NOTHING;
