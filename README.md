# FTC Trading Competition Leaderboard

A modern, elegant, and fully responsive trading competition platform built with Next.js 13 (App Router), TypeScript, Tailwind CSS, and Supabase. Features a dynamic leaderboard and comprehensive trader profile pages with equity tracking and trade history.

## Core Features

### Leaderboard Page
- **Real-time Rankings**: Dynamic ranking system based on trader performance
- **Advanced Sorting**: Sort by Growth %, Drawdown %, or Current Equity
- **Color-Coded Metrics**:
  - Green for positive growth
  - Red for negative growth and high drawdowns
  - Orange/Yellow for moderate drawdowns
- **Top 3 Badges**: Gold, Silver, and Bronze medals for top performers
- **Clickable Trader Names**: Navigate to individual trader profiles
- **Responsive Design**:
  - Elegant table layout on desktop
  - Card layout on mobile devices
  - Sticky header on scroll

### Trader Profile Pages
- **Detailed Performance Metrics**:
  - Trader Name and Current Rank
  - Total Deposit Amount
  - Current Balance
  - Current Equity
  - Growth Percentage
  - Max Drawdown Percentage
- **Equity Growth Chart**: Interactive line chart showing 60-day equity progression
- **Trade History**: XAUUSD trades with pagination (20 trades per page)
- **Responsive Layout**: 2-column grid on desktop, stacked on mobile
- **Back Navigation**: Smooth transition back to leaderboard

### Design Elements
- **Premium Dark Theme**: Deep black (#0B0B0F) background with gold (#D4AF37) accents
- **Interactive Elements**: Hover effects, smooth transitions, and animations
- **Professional Fintech Aesthetic**: Elite, trustworthy appearance

## Tech Stack

- **Frontend**: Next.js 13 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Supabase
- **Icons**: Lucide React
- **Deployment Ready**: Optimized for Vercel or Railway

## Project Structure

```
├── app/
│   ├── api/
│   │   └── traders/
│   │       └── route.ts          # API endpoint for fetching traders
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main leaderboard page
│   └── globals.css               # Global styles
├── lib/
│   └── supabase.ts               # Supabase client configuration
└── components/
    └── ui/                       # shadcn/ui components
```

## Database Schema

### traders (main table)
- `id`: Unique identifier (UUID)
- `trader_name`: Trader's name (text)
- `growth_percentage`: Growth percentage (numeric, positive or negative)
- `drawdown_percentage`: Drawdown percentage (numeric)
- `current_equity`: Current equity amount (numeric)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

### trader_details
- `id`: Unique identifier (UUID)
- `trader_id`: Foreign key to traders table
- `total_deposit`: Initial deposit amount (numeric)
- `current_balance`: Current account balance (numeric)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

### equity_history
- `id`: Unique identifier (UUID)
- `trader_id`: Foreign key to traders table
- `date`: Date of equity snapshot (date)
- `equity`: Equity amount at that date (numeric)
- `created_at`: Record creation timestamp

### trade_history
- `id`: Unique identifier (UUID)
- `trader_id`: Foreign key to traders table
- `symbol`: Trading symbol, e.g., 'XAUUSD' (text)
- `type`: Trade type - 'buy' or 'sell' (text)
- `lot`: Lot size (numeric)
- `entry_price`: Entry price (numeric)
- `exit_price`: Exit price (numeric)
- `profit`: Profit/loss from trade (numeric)
- `date`: Trade execution date (timestamptz)
- `created_at`: Record creation timestamp

### Database Features
- **Row Level Security (RLS)**: Public read access, authenticated write access
- **Indexes**: Optimized queries on `trader_id`, `date`, and `symbol`
- **Foreign Keys**: Cascade delete on trader removal

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Environment variables are pre-configured in `.env`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
npm run start
```

## Deployment

The application is ready for deployment on:
- **Vercel**: Zero-config deployment
- **Railway**: Full-stack deployment with database

## Features in Detail

### Auto-Ranking
Rankings are automatically calculated based on growth percentage in descending order.

### Sorting System
Click on any column header (Growth %, Drawdown %, Current Equity) to sort the leaderboard.

### Color Coding
- **Growth %**: Green (positive) / Red (negative)
- **Drawdown %**: Red (>15%) / Orange (>10%) / Yellow (≤10%)

### Responsive Design
- Desktop: Full table view with sticky header
- Mobile: Card-based layout optimized for touch

## API Endpoints

### Leaderboard Endpoints

#### GET /api/traders
Fetches all traders with optional sorting.

**Query Parameters:**
- `sortBy`: Field to sort by (`growth_percentage`, `drawdown_percentage`, `current_equity`) - default: `growth_percentage`
- `order`: Sort order (`asc` or `desc`) - default: `desc`

**Example:**
```
/api/traders?sortBy=growth_percentage&order=desc
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "trader_name": "Alex Morgan",
      "growth_percentage": 156.75,
      "drawdown_percentage": 8.50,
      "current_equity": 256750.00,
      "created_at": "2024-02-22T...",
      "updated_at": "2024-02-22T..."
    }
  ]
}
```

### Trader Profile Endpoints

#### GET /api/trader/[id]
Fetches detailed information about a specific trader including rank.

**Response:**
```json
{
  "trader": {
    "id": "uuid",
    "trader_name": "Alex Morgan",
    "growth_percentage": 156.75,
    "drawdown_percentage": 8.50,
    "current_equity": 256750.00
  },
  "details": {
    "id": "uuid",
    "trader_id": "uuid",
    "total_deposit": 100000.00,
    "current_balance": 256750.00
  },
  "rank": 1
}
```

#### GET /api/trader/[id]/equity-history
Fetches 60-day equity progression data.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "trader_id": "uuid",
      "date": "2024-01-01",
      "equity": 100000.00,
      "created_at": "2024-02-22T..."
    }
  ]
}
```

#### GET /api/trader/[id]/trades
Fetches XAUUSD trade history with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "trader_id": "uuid",
      "symbol": "XAUUSD",
      "type": "buy",
      "lot": 1.5,
      "entry_price": 2000.50,
      "exit_price": 2050.75,
      "profit": 760.00,
      "date": "2024-02-12T..."
    }
  ],
  "pagination": {
    "current": 1,
    "total": 3,
    "perPage": 20,
    "count": 50
  }
}
```

## Routes

- `/` - Main leaderboard page
- `/trader/[id]` - Individual trader profile page

## Sample Data

The database is pre-populated with:
- 15 sample traders
- 60-day equity history for each trader
- 5-8 XAUUSD trades per trader

## Performance

- Optimized for fast loading
- Efficient database queries with indexes
- Static generation for leaderboard
- Dynamic rendering for trader profiles
- Pagination for trade history (20 trades per page)
- Production-ready build configuration

## Security

- Row Level Security (RLS) enabled on all tables
- Public read access for leaderboard and profile data
- Authenticated write access for data management
- No sensitive data exposed in API responses

## Deployment

Ready for deployment on:
- **Vercel**: Recommended, zero-config deployment
- **Railway**: Full-stack deployment with database
- **Any Node.js hosting**: Docker-compatible

## License

MIT
