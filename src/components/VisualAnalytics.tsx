import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Trade } from '../types/trade';
import { formatCurrency } from '../utils/calculations';
import {
  TrendingUp,
  ShieldAlert,
  PieChart,
  Clock,
  Layers,
  Award,
  Zap,
  Calendar,
  Compass,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VisualAnalyticsProps {
  trades: Trade[];
}

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({ trades }) => {
  const [selectedCheckpointTab, setSelectedCheckpointTab] = useState<
    'marketStructure' | 'fairValueGap' | 'liquidity' | 'entryQuality'
  >('marketStructure');

  // Chronologically sorted trades
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.executionTime || '00:00'}`).getTime();
      const timeB = new Date(`${b.date}T${b.executionTime || '00:00'}`).getTime();
      return timeA - timeB;
    });
  }, [trades]);

  // 1. EQUITY CURVE & DRAWDOWN DATA
  const { equityLabels, equityData, drawdownData } = useMemo(() => {
    let running = 0;
    let peak = 0;
    const labels: string[] = ['Start'];
    const eqPoints: number[] = [0];
    const ddPoints: number[] = [0];

    sortedTrades.forEach((t, idx) => {
      running += t.realizedPnL || 0;
      if (running > peak) peak = running;
      const dd = running - peak; // negative or 0

      labels.push(`${t.serialNumber} (${t.instrument})`);
      eqPoints.push(Number(running.toFixed(2)));
      ddPoints.push(Number(dd.toFixed(2)));
    });

    return {
      equityLabels: labels,
      equityData: eqPoints,
      drawdownData: ddPoints,
    };
  }, [sortedTrades]);

  // 2. WIN / LOSS / BREAK-EVEN DISTRIBUTION
  const winLossData = useMemo(() => {
    const wins = trades.filter((t) => t.outcome === 'Win').length;
    const losses = trades.filter((t) => t.outcome === 'Loss').length;
    const bes = trades.filter((t) => t.outcome === 'Break-even').length;
    return { wins, losses, bes };
  }, [trades]);

  // 3. PERFORMANCE BY TRADING SESSION
  const sessionPerformance = useMemo(() => {
    const sessions = ['London', 'New York AM', 'New York PM', 'Asian', 'Pre-Market', 'After-Hours'];
    const stats: { [key: string]: { trades: number; wins: number; pnl: number } } = {};

    sessions.forEach((s) => {
      stats[s] = { trades: 0, wins: 0, pnl: 0 };
    });

    trades.forEach((t) => {
      const s = t.session || 'Other';
      if (!stats[s]) stats[s] = { trades: 0, wins: 0, pnl: 0 };
      stats[s].trades++;
      if (t.outcome === 'Win') stats[s].wins++;
      stats[s].pnl += t.realizedPnL || 0;
    });

    const activeSessions = Object.keys(stats).filter((s) => stats[s].trades > 0);
    return {
      labels: activeSessions,
      pnl: activeSessions.map((s) => stats[s].pnl),
      winRates: activeSessions.map((s) =>
        stats[s].trades > 0 ? Number(((stats[s].wins / stats[s].trades) * 100).toFixed(1)) : 0
      ),
      counts: activeSessions.map((s) => stats[s].trades),
    };
  }, [trades]);

  // 4. PERFORMANCE BY TRADING INSTRUMENT
  const instrumentPerformance = useMemo(() => {
    const map: { [key: string]: { trades: number; wins: number; pnl: number } } = {};

    trades.forEach((t) => {
      const inst = t.instrument || 'Unknown';
      if (!map[inst]) map[inst] = { trades: 0, wins: 0, pnl: 0 };
      map[inst].trades++;
      if (t.outcome === 'Win') map[inst].wins++;
      map[inst].pnl += t.realizedPnL || 0;
    });

    const instruments = Object.keys(map).sort((a, b) => map[b].pnl - map[a].pnl);
    return {
      labels: instruments,
      pnl: instruments.map((k) => map[k].pnl),
      winRates: instruments.map((k) =>
        Number(((map[k].wins / map[k].trades) * 100).toFixed(1))
      ),
      counts: instruments.map((k) => map[k].trades),
    };
  }, [trades]);

  // 5. MONTHLY PERFORMANCE
  const monthlyPerformance = useMemo(() => {
    const map: { [key: string]: number } = {};

    sortedTrades.forEach((t) => {
      const monthKey = t.date.slice(0, 7); // YYYY-MM
      map[monthKey] = (map[monthKey] || 0) + (t.realizedPnL || 0);
    });

    const months = Object.keys(map).sort();
    return {
      labels: months,
      pnl: months.map((m) => Number(map[m].toFixed(2))),
    };
  }, [sortedTrades]);

  // 6. WIN RATE BY TECHNICAL ANALYSIS CHECKPOINT
  const checkpointWinRates = useMemo(() => {
    const calcGroup = (extractor: (t: Trade) => string) => {
      const group: { [key: string]: { total: number; wins: number; pnl: number } } = {};
      trades.forEach((t) => {
        const val = extractor(t) || 'None';
        if (!group[val]) group[val] = { total: 0, wins: 0, pnl: 0 };
        group[val].total++;
        if (t.outcome === 'Win') group[val].wins++;
        group[val].pnl += t.realizedPnL || 0;
      });
      const keys = Object.keys(group);
      return {
        labels: keys,
        winRates: keys.map((k) =>
          Number(((group[k].wins / group[k].total) * 100).toFixed(1))
        ),
        pnl: keys.map((k) => group[k].pnl),
        counts: keys.map((k) => group[k].total),
      };
    };

    return {
      marketStructure: calcGroup((t) => t.checkpoints.marketStructure.status),
      fairValueGap: calcGroup((t) => t.checkpoints.fairValueGap.status),
      liquidity: calcGroup((t) => t.checkpoints.liquidity.status),
      entryQuality: calcGroup((t) => t.checkpoints.entryQuality.rating),
    };
  }, [trades]);

  // 7. CONFIDENCE LEVEL VS TRADING PERFORMANCE
  const confidencePerformance = useMemo(() => {
    const levels = ['High (8-10)', 'Medium (5-7)', 'Low (1-4)'];
    const map: { [key: string]: { total: number; wins: number; pnl: number } } = {};

    levels.forEach((l) => {
      map[l] = { total: 0, wins: 0, pnl: 0 };
    });

    trades.forEach((t) => {
      const lvl = t.checkpoints?.confidenceLevel?.level || 'Medium (5-7)';
      if (!map[lvl]) map[lvl] = { total: 0, wins: 0, pnl: 0 };
      map[lvl].total++;
      if (t.outcome === 'Win') map[lvl].wins++;
      map[lvl].pnl += t.realizedPnL || 0;
    });

    return {
      labels: levels,
      winRates: levels.map((l) =>
        map[l].total > 0 ? Number(((map[l].wins / map[l].total) * 100).toFixed(1)) : 0
      ),
      avgPnL: levels.map((l) =>
        map[l].total > 0 ? Number((map[l].pnl / map[l].total).toFixed(2)) : 0
      ),
      totalPnL: levels.map((l) => Number(map[l].pnl.toFixed(2))),
      counts: levels.map((l) => map[l].total),
    };
  }, [trades]);

  // Common Chart Dark Theme Options
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
        },
      },
      tooltip: {
        backgroundColor: '#0e1626',
        borderColor: '#1e293b',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
      },
    },
  };

  if (trades.length === 0) {
    return (
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">No Visual Analytics Available</h3>
        <p className="text-sm text-slate-500 mt-1">
          Record trade executions to populate interactive equity curves, session heatmaps, and SMC checkpoint analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SECTION A: EQUITY CURVE & UNDERWATER DRAWDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve (2 cols) */}
        <div className="lg:col-span-2 glass-panel-master rounded-3xl p-6 shadow-2xl flex flex-col justify-between border border-white/15">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Equity Curve (Cumulative P&L)
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Chronological equity growth across trades
              </p>
            </div>
            <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-3 py-1.5 rounded-full shadow-lg shadow-emerald-950">
              Current: {formatCurrency(equityData[equityData.length - 1] || 0)}
            </span>
          </div>

          <div className="h-72 w-full">
            <Line
              data={{
                labels: equityLabels,
                datasets: [
                  {
                    label: 'Cumulative P&L ($)',
                    data: equityData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    fill: true,
                    tension: 0.25,
                    borderWidth: 2.5,
                    pointRadius: equityData.length > 30 ? 1 : 3,
                    pointBackgroundColor: '#10b981',
                  },
                ],
              }}
              options={{
                ...baseChartOptions,
                plugins: {
                  ...baseChartOptions.plugins,
                  tooltip: {
                    ...baseChartOptions.plugins.tooltip,
                    callbacks: {
                      label: (context) => `Equity: ${formatCurrency(context.parsed.y ?? 0)}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Win/Loss Distribution Donut (1 col) */}
        <div className="glass-panel-master rounded-3xl p-6 shadow-2xl flex flex-col justify-between border border-white/15">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Outcome Distribution
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">
              {trades.length} Total
            </span>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center">
            <Doughnut
              data={{
                labels: ['Wins', 'Losses', 'Break-even'],
                datasets: [
                  {
                    data: [winLossData.wins, winLossData.losses, winLossData.bes],
                    backgroundColor: ['#10b981', '#f43f5e', '#64748b'],
                    borderColor: '#0b0f19',
                    borderWidth: 3,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                  },
                },
              }}
            />
            {/* Center percentage label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {trades.length > 0
                  ? ((winLossData.wins / trades.length) * 100).toFixed(0)
                  : 0}
                %
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Win Rate
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-500">Wins</span>
              <p className="font-mono font-bold text-emerald-400">{winLossData.wins}</p>
            </div>
            <div>
              <span className="text-slate-500">Losses</span>
              <p className="font-mono font-bold text-rose-400">{winLossData.losses}</p>
            </div>
            <div>
              <span className="text-slate-500">B/E</span>
              <p className="font-mono font-bold text-slate-300">{winLossData.bes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Underwater Drawdown Chart */}
      <div className="glass-panel-master rounded-3xl p-6 shadow-2xl border border-white/15">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Underwater Drawdown Chart
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Quantifies depth and duration of equity drawdowns from all-time highs
              </p>
            </div>
          </div>
        </div>

        <div className="h-52 w-full">
          <Line
            data={{
              labels: equityLabels,
              datasets: [
                {
                  label: 'Drawdown ($)',
                  data: drawdownData,
                  borderColor: '#f43f5e',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  fill: true,
                  tension: 0.2,
                  borderWidth: 2,
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              ...baseChartOptions,
              plugins: {
                ...baseChartOptions.plugins,
                tooltip: {
                  ...baseChartOptions.plugins.tooltip,
                  callbacks: {
                    label: (context) => `Drawdown: -$${Math.abs(context.parsed.y ?? 0).toLocaleString()}`,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* SECTION B: SESSION & INSTRUMENT PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Trading Session */}
        <div className="glass-panel-master rounded-3xl p-6 shadow-2xl border border-white/15">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Performance by Trading Session
              </h3>
            </div>
            <span className="text-xs text-slate-300 font-mono">Net P&L ($)</span>
          </div>

          <div className="h-64 w-full">
            <Bar
              data={{
                labels: sessionPerformance.labels,
                datasets: [
                  {
                    label: 'Net P&L ($)',
                    data: sessionPerformance.pnl,
                    backgroundColor: sessionPerformance.pnl.map((v) =>
                      v >= 0 ? '#10b981' : '#f43f5e'
                    ),
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                ...baseChartOptions,
                plugins: {
                  ...baseChartOptions.plugins,
                  tooltip: {
                    ...baseChartOptions.plugins.tooltip,
                    callbacks: {
                      afterLabel: (context) => {
                        const idx = context.dataIndex;
                        return `Win Rate: ${sessionPerformance.winRates[idx]}% (${sessionPerformance.counts[idx]} trades)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Performance by Trading Instrument */}
        <div className="glass-panel-master rounded-3xl p-6 shadow-2xl border border-white/15">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Performance by Trading Instrument
              </h3>
            </div>
            <span className="text-xs text-slate-300 font-mono">Net Return</span>
          </div>

          <div className="h-64 w-full">
            <Bar
              data={{
                labels: instrumentPerformance.labels,
                datasets: [
                  {
                    label: 'Net P&L ($)',
                    data: instrumentPerformance.pnl,
                    backgroundColor: instrumentPerformance.pnl.map((v) =>
                      v >= 0 ? '#10b981' : '#f43f5e'
                    ),
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                ...baseChartOptions,
                plugins: {
                  ...baseChartOptions.plugins,
                  tooltip: {
                    ...baseChartOptions.plugins.tooltip,
                    callbacks: {
                      afterLabel: (context) => {
                        const idx = context.dataIndex;
                        return `Win Rate: ${instrumentPerformance.winRates[idx]}% (${instrumentPerformance.counts[idx]} trades)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* SECTION C: MONTHLY PERFORMANCE & CONFIDENCE LEVEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="glass-panel-master rounded-3xl p-6 shadow-2xl border border-white/15">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Monthly Performance Breakdown
              </h3>
            </div>
            <span className="text-xs text-slate-300 font-mono">Calendar Months</span>
          </div>

          <div className="h-64 w-full">
            <Bar
              data={{
                labels: monthlyPerformance.labels,
                datasets: [
                  {
                    label: 'Monthly Net P&L ($)',
                    data: monthlyPerformance.pnl,
                    backgroundColor: monthlyPerformance.pnl.map((v) =>
                      v >= 0 ? 'rgba(16, 185, 129, 0.85)' : 'rgba(244, 63, 94, 0.85)'
                    ),
                    borderRadius: 6,
                  },
                ],
              }}
              options={baseChartOptions}
            />
          </div>
        </div>

        {/* Confidence Level vs Trading Performance */}
        <div className="glass-panel-master rounded-3xl p-6 shadow-2xl border border-white/15">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Confidence Level vs Performance
              </h3>
            </div>
            <span className="text-xs text-slate-300 font-mono">Conviction Edge</span>
          </div>

          <div className="h-64 w-full">
            <Bar
              data={{
                labels: confidencePerformance.labels,
                datasets: [
                  {
                    label: 'Win Rate (%)',
                    data: confidencePerformance.winRates,
                    backgroundColor: '#38bdf8',
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                ...baseChartOptions,
                scales: {
                  ...baseChartOptions.scales,
                  y: {
                    ...baseChartOptions.scales.y,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`,
                      color: '#64748b',
                    },
                  },
                },
                plugins: {
                  ...baseChartOptions.plugins,
                  tooltip: {
                    ...baseChartOptions.plugins.tooltip,
                    callbacks: {
                      afterLabel: (context) => {
                        const idx = context.dataIndex;
                        return `Total Net: ${formatCurrency(confidencePerformance.totalPnL[idx])} (${confidencePerformance.counts[idx]} trades)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* SECTION D: WIN RATE BY TECHNICAL ANALYSIS CHECKPOINT */}
      <div className="glass-panel-master rounded-3xl p-6 shadow-2xl border border-white/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Win Rate by Technical-Analysis Checkpoint
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              Identifies which SMC concepts yield the highest statistical win probability
            </p>
          </div>

          <div className="flex items-center glass-card-master p-1 rounded-2xl border border-white/10 self-start sm:self-auto overflow-x-auto">
            <button
              onClick={() => setSelectedCheckpointTab('marketStructure')}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                selectedCheckpointTab === 'marketStructure'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Market Structure
            </button>
            <button
              onClick={() => setSelectedCheckpointTab('fairValueGap')}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                selectedCheckpointTab === 'fairValueGap'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Fair Value Gap
            </button>
            <button
              onClick={() => setSelectedCheckpointTab('liquidity')}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                selectedCheckpointTab === 'liquidity'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Liquidity
            </button>
            <button
              onClick={() => setSelectedCheckpointTab('entryQuality')}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                selectedCheckpointTab === 'entryQuality'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Entry Quality Grade
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <Bar
            data={{
              labels: checkpointWinRates[selectedCheckpointTab].labels,
              datasets: [
                {
                  label: 'Win Rate (%)',
                  data: checkpointWinRates[selectedCheckpointTab].winRates,
                  backgroundColor: '#10b981',
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              ...baseChartOptions,
              scales: {
                ...baseChartOptions.scales,
                y: {
                  ...baseChartOptions.scales.y,
                  max: 100,
                  ticks: {
                    callback: (value) => `${value}%`,
                    color: '#64748b',
                  },
                },
              },
              plugins: {
                ...baseChartOptions.plugins,
                tooltip: {
                  ...baseChartOptions.plugins.tooltip,
                  callbacks: {
                    afterLabel: (context) => {
                      const idx = context.dataIndex;
                      const active = checkpointWinRates[selectedCheckpointTab];
                      return `Net P&L: ${formatCurrency(active.pnl[idx])} (${active.counts[idx]} trades)`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
