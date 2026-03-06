'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpDown, Trophy, Medal, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { traders } from '@/lib/supabase';

type SortField = 'growth_percentage' | 'drawdown_percentage' | 'current_equity';
type SortOrder = 'asc' | 'desc';

export default function Home() {
  const [traders, setTraders] = useState<traders[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('growth_percentage');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchTraders();
  }, [sortField, sortOrder]);

  const fetchTraders = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/traders?sortBy=${sortField}&order=${sortOrder}`
      );
      const result = await response.json();
      setTraders(result.data || []);
    } catch (error) {
      console.error('Error fetching traders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-bold">1st</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-2">
            <Medal className="w-6 h-6 text-[#C0C0C0]" />
            <span className="text-[#C0C0C0] font-bold">2nd</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#CD7F32]" />
            <span className="text-[#CD7F32] font-bold">3rd</span>
          </div>
        );
      default:
        return <span className="text-gray-400 font-medium">{rank}th</span>;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }
// Jika tidak ada data trader
  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 bg-gradient-to-r from-[#D4AF37] via-[#F8E58C] to-[#D4AF37] bg-clip-text text-transparent">
            FTC Trading Competition
          </h1>
          <p className="text-gray-400 text-lg md:text-xl">
            Real-time leaderboard rankings
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="bg-[#14141A] rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1A1A24] sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Trader Name
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-[#D4AF37] transition-colors"
                      onClick={() => handleSort('growth_percentage')}
                    >
                      <div className="flex items-center gap-2">
                        Growth %
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-[#D4AF37] transition-colors"
                      onClick={() => handleSort('drawdown_percentage')}
                    >
                      <div className="flex items-center gap-2">
                        Drawdown %
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-[#D4AF37] transition-colors"
                      onClick={() => handleSort('current_equity')}
                    >
                      <div className="flex items-center gap-2">
                        Current Equity
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {traders.map((trader, index) => {
                    const rank = index + 1;
                    const isTopThree = rank <= 3;
                    return (
                      <tr
                        key={trader.id}
                        className={`border-t border-gray-800 hover:bg-[#1A1A24] transition-colors ${
                          isTopThree ? 'bg-[#1A1A24]/50' : ''
                        }`}
                      >
                        <td className="px-6 py-5">{getRankBadge(rank)}</td>
                        <td className="px-6 py-5">
                          <Link href={`/trader/${trader.id}`}>
                            <div className="font-medium text-[#D4AF37] hover:text-[#F8E58C] cursor-pointer transition-colors">
                              {trader.trader_name}
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className={`font-bold text-lg flex items-center gap-2 ${getGrowthColor(
                              Number(trader.growth_percentage)
                            )}`}
                          >
                            {Number(trader.growth_percentage) > 0 ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : (
                              <TrendingDown className="w-5 h-5" />
                            )}
                            {formatPercentage(Number(trader.growth_percentage))}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className={`font-semibold ${getDrawdownColor(
                              Number(trader.drawdown_percentage)
                            )}`}
                          >
                            {trader.drawdown_percentage}%
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-semibold text-gray-300">
                            {formatCurrency(Number(trader.current_equity))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {traders.map((trader, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;
            return (
              <Link href={`/trader/${trader.id}`}>
                <div
                  key={trader.id}
                  className={`bg-[#14141A] rounded-2xl p-5 border ${
                    isTopThree
                      ? 'border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20'
                      : 'border-gray-800'
                  } hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>{getRankBadge(rank)}</div>
                    <div className="text-[#D4AF37] text-sm hover:text-[#F8E58C] transition-colors font-medium">
                      {trader.trader_name}
                    </div>
                  </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Growth</span>
                    <span
                      className={`font-bold text-lg flex items-center gap-2 ${getGrowthColor(
                        Number(trader.growth_percentage)
                      )}`}
                    >
                      {Number(trader.growth_percentage) > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {formatPercentage(Number(trader.growth_percentage))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Drawdown</span>
                    <span
                      className={`font-semibold ${getDrawdownColor(
                        Number(trader.drawdown_percentage)
                      )}`}
                    >
                      {trader.drawdown_percentage}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                    <span className="text-gray-400 text-sm">Equity</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(Number(trader.current_equity))}
                    </span>
                  </div>
                </div>
              </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
