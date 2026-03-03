'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Target, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trader } from '@/lib/supabase';

type TraderDetail = {
  trader: Trader;
  details: {
    id: string;
    trader_id: string;
    total_deposit: number;
    current_balance: number;
  } | null;
  rank: number;
};

type EquityData = {
  date: string;
  equity: number;
};

type TradeRecord = {
  id: string;
  trader_id: string;
  symbol: string;
  type: string;
  lot: number;
  entry_price: number;
  exit_price: number;
  profit: number;
  date: string;
};

export default function TraderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [trader, setTrader] = useState<TraderDetail | null>(null);
  const [equityData, setEquityData] = useState<EquityData[]>([]);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTraderData();
    fetchEquityHistory();
    fetchTrades();
  }, [params.id]);

  useEffect(() => {
    fetchTrades();
  }, [currentPage]);

  const fetchTraderData = async () => {
    try {
      const response = await fetch(`/api/trader/${params.id}`);
      const data = await response.json();
      setTrader(data);
    } catch (error) {
      console.error('Error fetching trader:', error);
    }
  };

  const fetchEquityHistory = async () => {
    try {
      const response = await fetch(`/api/trader/${params.id}/equity-history`);
      const data = await response.json();
      setEquityData(data.data || []);
    } catch (error) {
      console.error('Error fetching equity history:', error);
    }
  };

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/trader/${params.id}/trades?page=${currentPage}`
      );
      const data = await response.json();
      setTrades(data.data || []);
      setTotalPages(data.pagination.total);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-[#D4AF37] font-bold">1st Place</span>;
    if (rank === 2) return <span className="text-[#C0C0C0] font-bold">2nd Place</span>;
    if (rank === 3) return <span className="text-[#CD7F32] font-bold">3rd Place</span>;
    return <span className="text-gray-400 font-medium">{rank}th Place</span>;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  const getDrawdownColor = (value: number) => {
    if (value > 15) return 'text-red-500';
    if (value > 10) return 'text-orange-500';
    return 'text-yellow-500';
  };

  if (!trader) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F8E58C] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Rankings
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {trader.trader.trader_name}
              </h1>
              <p className="text-[#D4AF37] text-lg font-semibold">
                {getRankBadge(trader.rank)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Card 1: Total Deposit */}
          <div className="bg-[#14141A] rounded-2xl p-6 border border-gray-800 hover:border-[#D4AF37]/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Deposit</span>
              <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(Number(trader.details?.total_deposit || 0))}
            </div>
          </div>

          {/* Card 2: Current Balance */}
          <div className="bg-[#14141A] rounded-2xl p-6 border border-gray-800 hover:border-[#D4AF37]/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Current Balance</span>
              <Target className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(Number(trader.details?.current_balance || 0))}
            </div>
          </div>

          {/* Card 3: Current Equity */}
          <div className="bg-[#14141A] rounded-2xl p-6 border border-gray-800 hover:border-[#D4AF37]/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Current Equity</span>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-500">
              {formatCurrency(Number(trader.trader.current_equity))}
            </div>
          </div>

          {/* Card 4: Growth % */}
          <div className="bg-[#14141A] rounded-2xl p-6 border border-gray-800 hover:border-[#D4AF37]/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Growth %</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className={`text-3xl font-bold ${getGrowthColor(Number(trader.trader.growth_percentage))}`}>
              {formatPercentage(Number(trader.trader.growth_percentage))}
            </div>
          </div>

          {/* Card 5: Max Drawdown % */}
          <div className="bg-[#14141A] rounded-2xl p-6 border border-gray-800 hover:border-[#D4AF37]/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Max Drawdown %</span>
              <TrendingDown className="w-5 h-5 text-orange-500" />
            </div>
            <div className={`text-3xl font-bold ${getDrawdownColor(Number(trader.trader.drawdown_percentage))}`}>
              {trader.trader.drawdown_percentage}%
            </div>
          </div>

          {/* Card 6: Rank */}
          <div className="bg-[#14141A] rounded-2xl p-6 border border-gray-800 hover:border-[#D4AF37]/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Current Rank</span>
              <AlertCircle className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-bold text-[#D4AF37]">#{trader.rank}</div>
          </div>
        </div>

        {/* Equity Growth Chart */}
        <div className="bg-[#14141A] rounded-2xl p-6 border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Equity Growth</h2>
          {equityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2f" />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#888"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A24',
                    border: '1px solid #D4AF37',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#D4AF37' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Line
                  type="monotone"
                  dataKey="equity"
                  stroke="#D4AF37"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No equity history data available
            </div>
          )}
        </div>

        {/* Trade History */}
        <div className="bg-[#14141A] rounded-2xl p-6 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">XAUUSD Trade History</h2>

          {trades.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1A1A24]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Lot</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Entry</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Exit</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id} className="border-t border-gray-800 hover:bg-[#1A1A24]/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-300">
                          <div>{formatDate(trade.date)}</div>
                          <div className="text-xs text-gray-500">{formatTime(trade.date)}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-semibold px-2 py-1 rounded text-xs ${
                            trade.type === 'buy'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{trade.lot}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{trade.entry_price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{trade.exit_price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          <span className={trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {formatCurrency(trade.profit)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-[#1A1A24] rounded text-sm text-gray-300 hover:bg-[#D4AF37]/20 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded text-sm transition-colors ${
                          currentPage === page
                            ? 'bg-[#D4AF37] text-black font-semibold'
                            : 'bg-[#1A1A24] text-gray-300 hover:bg-[#D4AF37]/20'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-[#1A1A24] rounded text-sm text-gray-300 hover:bg-[#D4AF37]/20 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400">
              No XAUUSD trades found
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
