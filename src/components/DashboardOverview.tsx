import React from 'react';
import { Trade, PerformanceMetrics } from '../types/trade';
import { formatCurrency } from '../utils/calculations';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  ShieldAlert,
  Percent,
  DollarSign,
  BarChart3,
  Scale,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DashboardOverviewProps {
  trades: Trade[];
  metrics: PerformanceMetrics;
  onNewTrade: () => void;
  onLoadSampleData: () => void;
  onViewJournal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  trades,
  metrics,
  onNewTrade,
  onLoadSampleData,
  onViewJournal,
}) => {
  const isProfitable = metrics.netPnL >= 0;

  // Breakdown by direction
  const longTrades = trades.filter((t) => t.direction === 'Long');
  const shortTrades = trades.filter((t) => t.direction === 'Short');

  const longWins = longTrades.filter((t) => t.outcome === 'Win').length;
  const longWinRate =
    longTrades.length > 0 ? ((longWins / longTrades.length) * 100).toFixed(1) : '0';
  const longPnL = longTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);

  const shortWins = shortTrades.filter((t) => t.outcome === 'Win').length;
  const shortWinRate =
    shortTrades.length > 0 ? ((shortWins / shortTrades.length) * 100).toFixed(1) : '0';
  const shortPnL = shortTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);

  // Recent 5 trades
  const recentTrades = trades.slice(0, 5);

  if (trades.length === 0) {
    return (
      <div className="glass-panel-master rounded-3xl p-12 text-center max-w-3xl mx-auto shadow-2xl my-8 border border-white/15">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-lime-400 to-cyan-500 p-0.5 mx-auto mb-6 shadow-xl shadow-cyan-950/80">
          <div className="w-full h-full bg-[#080d1a] rounded-[22px] flex items-center justify-center">
            <Activity className="w-10 h-10 text-lime-400" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          ApexEdge Glass Trading Journal
        </h2>
        <p className="text-slate-300 text-sm mt-2 max-w-md mx-auto leading-relaxed">
          No trade records found yet. Begin by manually recording your first trade execution,
          or load 10 realistic SMC (Smart Money Concepts) sample trades to test the analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={onNewTrade}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-lime-950 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Record First Trade</span>
          </button>
          <button
            onClick={onLoadSampleData}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl glass-card-master hover:border-white/30 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Load Sample SMC Data</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Hero Glass Banner: Net P&L & Status */}
      <div className="glass-panel-master rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-white/15">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span>Cumulative Trading Performance</span>
          </div>
          <div className="flex items-baseline gap-4 flex-wrap">
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-mono font-black tracking-tight ${
                isProfitable ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(metrics.netPnL)}
            </h1>
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-lg ${
                isProfitable
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-emerald-500/20'
                  : 'bg-rose-500/25 text-rose-300 border border-rose-400/50 shadow-rose-500/20'
              }`}
            >
              {isProfitable ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {isProfitable ? 'Net Profitable' : 'Net Drawdown'}
            </span>
          </div>
          <p className="text-xs text-slate-300/80 mt-2">
            Calculated across <strong className="text-white font-bold">{metrics.totalTrades}</strong> logged executions
            with an overall profit factor of{' '}
            <strong className="text-cyan-300 font-mono font-bold">{metrics.profitFactor}</strong>.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
          <button
            onClick={onNewTrade}
            className="flex-1 md:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-xl shadow-lime-950 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Log Trade</span>
          </button>
          <button
            onClick={onViewJournal}
            className="flex-1 md:flex-initial px-5 py-3 rounded-2xl glass-card-master hover:border-white/30 text-white font-bold text-xs transition-colors"
          >
            Open Journal
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (10 Required Performance Metrics with Master Glassmorphism) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Trades */}
        <div className="glass-card-master rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Total Trades</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{metrics.totalTrades}</div>
          <p className="text-[11px] text-slate-400 mt-1">Logged executions</p>
        </div>

        {/* 2. Winning Trades */}
        <div className="glass-card-master rounded-2xl p-4.5 hover:border-emerald-500/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Winning Trades</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {metrics.winningTrades}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {metrics.winRate}% of total
          </p>
        </div>

        {/* 3. Losing Trades */}
        <div className="glass-card-master rounded-2xl p-4.5 hover:border-rose-500/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Losing Trades</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">
            {metrics.losingTrades}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {metrics.lossRate}% of total
          </p>
        </div>

        {/* 4. Break-even Trades */}
        <div className="glass-card-master rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Break-Even</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300">
            {metrics.breakEvenTrades}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Capital preserved</p>
        </div>

        {/* 5. Win Rate */}
        <div className="glass-card-master rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Win Rate</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {metrics.winRate}%
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-lime-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.winRate}%` }}
            />
          </div>
        </div>

        {/* 6. Loss Rate */}
        <div className="glass-card-master rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Loss Rate</span>
            <Percent className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">
            {metrics.lossRate}%
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.lossRate}%` }}
            />
          </div>
        </div>

        {/* 7. Max Drawdown */}
        <div className="glass-card-master rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Max Drawdown</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-300">
            ${metrics.maxDrawdown.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Peak-to-trough drop</p>
        </div>

        {/* 8. Net Profit & Loss */}
        <div className="glass-card-master rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Net P&L</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              metrics.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(metrics.netPnL)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gross: {formatCurrency(metrics.grossProfit)}</p>
        </div>

        {/* 9. Average Risk-to-Reward */}
        <div className="glass-card-master rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Avg Planned R:R</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300">
            1 : {metrics.averageRR}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Reward to risk multiple</p>
        </div>

        {/* 10. Profit Factor */}
        <div className="glass-card-master rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Profit Factor</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300">
            {metrics.profitFactor}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gross Win / Gross Loss</p>
        </div>
      </div>

      {/* Secondary Performance Widgets: Order Direction & Institutional Expectancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Direction Breakdown (Long vs Short) */}
        <div className="glass-panel-master rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Directional Edge
            </h3>
            <span className="text-xs text-slate-400">Long vs Short</span>
          </div>

          <div className="space-y-4">
            {/* Longs */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  LONG TRADES ({longTrades.length})
                </span>
                <span
                  className={`text-xs font-mono font-black ${
                    longPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(longPnL)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                <span>Win Rate: {longWinRate}%</span>
                <span>{longWins}W / {longTrades.length - longWins}L</span>
              </div>
            </div>

            {/* Shorts */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  SHORT TRADES ({shortTrades.length})
                </span>
                <span
                  className={`text-xs font-mono font-black ${
                    shortPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(shortPnL)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                <span>Win Rate: {shortWinRate}%</span>
                <span>{shortWins}W / {shortTrades.length - shortWins}L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expectancy & Trade Distribution Details */}
        <div className="glass-panel-master rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              Expectancy & Payoff
            </h3>
            <span className="text-xs text-slate-400">Edge Metrics</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Avg Win</span>
              <p className="text-lg font-mono font-black text-emerald-400 mt-1">
                +${metrics.averageWin.toLocaleString()}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Avg Loss</span>
              <p className="text-lg font-mono font-black text-rose-400 mt-1">
                -${metrics.averageLoss.toLocaleString()}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Best Trade</span>
              <p className="text-lg font-mono font-black text-emerald-300 mt-1">
                {formatCurrency(metrics.bestTrade)}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Worst Trade</span>
              <p className="text-lg font-mono font-black text-rose-300 mt-1">
                {formatCurrency(metrics.worstTrade)}
              </p>
            </div>
          </div>

          <div className="mt-3.5 p-3 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-center">
            <span className="text-xs text-cyan-200">
              Mathematical Expectancy: <strong className="font-mono text-white font-extrabold">{formatCurrency(metrics.expectancy)}</strong> / trade
            </span>
          </div>
        </div>

        {/* Recent Executions Stream with Frosted Glass */}
        <div className="glass-panel-master rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Latest Trades
            </h3>
            <button
              onClick={onViewJournal}
              className="text-xs text-cyan-300 hover:text-cyan-200 font-bold transition-colors"
            >
              View all
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTrades.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/10 hover:border-white/25 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      t.outcome === 'Win'
                        ? 'bg-emerald-400 shadow-md shadow-emerald-400/80'
                        : t.outcome === 'Loss'
                        ? 'bg-rose-400 shadow-md shadow-rose-400/80'
                        : 'bg-slate-400'
                    }`}
                  />
                  <div>
                    <span className="font-mono font-extrabold text-white mr-1.5">
                      {t.instrument}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        t.direction === 'Long'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {t.direction}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-black ${
                      t.realizedPnL > 0
                        ? 'text-emerald-400'
                        : t.realizedPnL < 0
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {formatCurrency(t.realizedPnL)}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {t.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
