import React, { useState } from 'react';
import { Trade, TradeOutcome, EntryQualityRating } from '../types/trade';
import { formatCurrency } from '../utils/calculations';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ChevronRight,
  GripVertical,
  PlusCircle,
  Sparkles,
  MousePointer,
  CheckCircle2,
  XCircle,
  Scale,
  Activity,
  Zap,
} from 'lucide-react';

interface TradeKanbanBoardProps {
  trades: Trade[];
  onUpdateTrade: (trade: Trade) => Promise<void>;
  onViewTrade: (trade: Trade) => void;
  onNewTrade: () => void;
}

type GroupByMode = 'outcome' | 'quality';

export const TradeKanbanBoard: React.FC<TradeKanbanBoardProps> = ({
  trades,
  onUpdateTrade,
  onViewTrade,
  onNewTrade,
}) => {
  const [groupBy, setGroupBy] = useState<GroupByMode>('outcome');
  const [draggedTradeId, setDraggedTradeId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, tradeId: string) => {
    setDraggedTradeId(tradeId);
    e.dataTransfer.setData('text/plain', tradeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const tradeId = e.dataTransfer.getData('text/plain') || draggedTradeId;
    if (!tradeId) return;

    const trade = trades.find((t) => t.id === tradeId);
    if (!trade) return;

    if (groupBy === 'outcome') {
      const targetOutcome = targetKey as TradeOutcome;
      if (trade.outcome === targetOutcome) return;

      let newPnL = trade.realizedPnL;
      let newRR = trade.realizedRR;

      if (targetOutcome === 'Win') {
        newPnL = Math.abs(trade.realizedPnL) || (trade.riskAmount ? trade.riskAmount * 2 : 500);
        newRR = trade.plannedRR || 2;
      } else if (targetOutcome === 'Loss') {
        newPnL = -Math.abs(trade.realizedPnL) || (trade.riskAmount ? -trade.riskAmount : -500);
        newRR = -1;
      } else if (targetOutcome === 'Break-even') {
        newPnL = 0;
        newRR = 0;
      }

      const updated: Trade = {
        ...trade,
        outcome: targetOutcome,
        realizedPnL: newPnL,
        realizedRR: newRR,
        updatedAt: Date.now(),
      };

      await onUpdateTrade(updated);
    } else {
      const targetRating = targetKey as EntryQualityRating;
      if (trade.checkpoints.entryQuality.rating === targetRating) return;

      const updated: Trade = {
        ...trade,
        checkpoints: {
          ...trade.checkpoints,
          entryQuality: {
            ...trade.checkpoints.entryQuality,
            rating: targetRating,
          },
        },
        updatedAt: Date.now(),
      };

      await onUpdateTrade(updated);
    }

    setDraggedTradeId(null);
  };

  // Outcome columns definition (4 columns matching the Instagram reel layout)
  const outcomeColumns = [
    {
      key: 'Watchlist' as any,
      title: 'Setup / Watchlist',
      subtitle: 'Forming SMC Confluences',
      tintClass: 'glass-tint-blue',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
      headerGlow: 'text-cyan-400',
      icon: Activity,
    },
    {
      key: 'Win' as TradeOutcome,
      title: 'Target Hit / Profit',
      subtitle: 'Winning Realized Trades',
      tintClass: 'glass-tint-emerald',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      headerGlow: 'text-emerald-400',
      icon: TrendingUp,
    },
    {
      key: 'InPlay' as any,
      title: 'Negotiation / In-Play',
      subtitle: 'Active Risk & Runners',
      tintClass: 'glass-tint-orange',
      badgeClass: 'bg-amber-500/25 text-amber-300 border-amber-400/50',
      headerGlow: 'text-amber-400',
      icon: Zap,
    },
    {
      key: 'Loss' as TradeOutcome,
      title: 'Stop Hit / Defended',
      subtitle: 'Invalided Trades & Losses',
      tintClass: 'glass-tint-rose',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
      headerGlow: 'text-rose-400',
      icon: TrendingDown,
    },
  ];

  // Quality columns definition
  const qualityColumns = [
    {
      key: 'A+' as EntryQualityRating,
      title: 'Grade A+ Playbook',
      subtitle: 'Flawless HTF & LTF Alignment',
      tintClass: 'glass-tint-emerald',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      headerGlow: 'text-emerald-400',
      icon: Sparkles,
    },
    {
      key: 'A' as EntryQualityRating,
      title: 'Grade A Standard',
      subtitle: 'High Conviction Setup',
      tintClass: 'glass-tint-blue',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
      headerGlow: 'text-cyan-400',
      icon: CheckCircle2,
    },
    {
      key: 'B' as EntryQualityRating,
      title: 'Grade B Moderate',
      subtitle: 'Acceptable Confluence',
      tintClass: 'glass-tint-slate',
      badgeClass: 'bg-slate-500/25 text-slate-300 border-slate-400/40',
      headerGlow: 'text-slate-300',
      icon: Layers,
    },
    {
      key: 'C' as EntryQualityRating,
      title: 'Grade C Sub-optimal',
      subtitle: 'Low Quality / Forced Trade',
      tintClass: 'glass-tint-rose',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
      headerGlow: 'text-rose-400',
      icon: XCircle,
    },
  ];

  // Helper to filter trades into the 4 columns
  const getTradesForColumn = (key: string) => {
    if (groupBy === 'outcome') {
      if (key === 'Watchlist') {
        // Break-even or open trades
        return trades.filter((t) => t.outcome === 'Break-even');
      }
      if (key === 'InPlay') {
        // High RR or active long runners (for demo/visual display)
        return trades.filter((t) => t.outcome === 'Win' && (t.realizedRR || 0) >= 3.0);
      }
      if (key === 'Win') {
        return trades.filter((t) => t.outcome === 'Win' && (t.realizedRR || 0) < 3.0);
      }
      if (key === 'Loss') {
        return trades.filter((t) => t.outcome === 'Loss');
      }
      return [];
    } else {
      return trades.filter((t) => t.checkpoints.entryQuality.rating === key);
    }
  };

  const columns = groupBy === 'outcome' ? outcomeColumns : qualityColumns;

  return (
    <div className="space-y-6 relative z-10">
      {/* Top Banner Toolbar */}
      <div className="glass-panel-master rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lime-400 via-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-950/60 flex items-center justify-center">
            <div className="w-full h-full bg-[#080d1a] rounded-[14px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-lime-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Trade Pipeline Terminal
              </h2>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-lime-400/20 text-lime-300 border border-lime-400/40 shadow-sm shadow-lime-400/20">
                FROSTED GLASS CANVAS
              </span>
            </div>
            <p className="text-xs text-slate-300/80 mt-1 max-w-xl">
              Fluid multi-stage Kanban inspired by elite sales & trading terminals. Drag and drop trade
              cards across pipeline stages to trigger live recalculations.
            </p>
          </div>
        </div>

        {/* Pipeline Toggle and Action */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center glass-panel-master p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setGroupBy('outcome')}
              className={`text-xs px-4 py-2 rounded-xl font-bold transition-all ${
                groupBy === 'outcome'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-lg shadow-cyan-950 font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Outcome Pipeline
            </button>
            <button
              onClick={() => setGroupBy('quality')}
              className={`text-xs px-4 py-2 rounded-xl font-bold transition-all ${
                groupBy === 'quality'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-lg shadow-cyan-950 font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Quality Playbook
            </button>
          </div>

          <button
            onClick={onNewTrade}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-lime-950 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>+ Log Trade</span>
          </button>
        </div>
      </div>

      {/* Floating Callout Bubble Matching the Reel's "Drag the deal!" speech bubble */}
      <div className="relative flex items-center justify-end pr-8 sm:pr-24 -mb-3 z-20">
        <div className="floating-deal-bubble relative bg-white text-slate-950 font-black text-xs px-4 py-2 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center gap-2 border border-slate-200 select-none cursor-default">
          <MousePointer className="w-4 h-4 text-slate-900 fill-slate-900" />
          <span className="tracking-wide">Drag the deal!</span>
          {/* Triangular Tail pointing down at the card */}
          <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-white drop-shadow-sm" />
        </div>
      </div>

      {/* Main Glassmorphic Device Chassis (Tablet Bezel from the Reel) */}
      <div className="tablet-device-chassis rounded-[2.5rem] p-5 sm:p-7 relative overflow-hidden">
        {/* Subtle glass reflection highlight across the tablet */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* 4 Pipeline Columns in Frosted Glass */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {columns.map((col) => {
            const columnTrades = getTradesForColumn(col.key);
            const totalPnL = columnTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);
            const isDropTarget = dragOverColumn === col.key;
            const Icon = col.icon;

            return (
              <div
                key={col.key}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.key)}
                className={`rounded-3xl p-4 flex flex-col transition-all duration-300 min-h-[520px] ${
                  col.tintClass
                } ${
                  isDropTarget
                    ? 'ring-2 ring-lime-400/80 scale-[1.01] shadow-[0_0_30px_rgba(163,230,53,0.3)]'
                    : ''
                }`}
              >
                {/* Column Frosted Glass Header */}
                <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 mb-4 flex items-center justify-between backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${col.headerGlow}`} />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-white tracking-wider uppercase">
                        {col.title}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-300 font-medium">
                        {columnTrades.length} trades •{' '}
                        <span
                          className={
                            totalPnL > 0
                              ? 'text-emerald-400 font-bold'
                              : totalPnL < 0
                              ? 'text-rose-400 font-bold'
                              : 'text-slate-400'
                          }
                        >
                          {formatCurrency(totalPnL)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold border ${col.badgeClass}`}>
                    {columnTrades.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[640px] pr-1">
                  {columnTrades.length === 0 ? (
                    <div className="h-44 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                      <p className="font-bold text-slate-300">Empty Stage</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Drop any trade card here to move it to this stage
                      </p>
                    </div>
                  ) : (
                    columnTrades.map((trade, idx) => {
                      const isPositive = trade.realizedPnL > 0;
                      const isNegative = trade.realizedPnL < 0;

                      // Highlight hero card like the orange $51,350 card in the reel!
                      const isHeroCard = col.key === 'InPlay' || (idx === 0 && col.key === 'Win');

                      return (
                        <div
                          key={trade.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, trade.id)}
                          onClick={() => onViewTrade(trade)}
                          className={`rounded-2xl p-4.5 cursor-grab active:cursor-grabbing group relative select-none glass-shimmer transition-all duration-200 ${
                            isHeroCard
                              ? 'glass-tint-orange border-orange-400/50 hover:border-orange-300 shadow-[0_15px_35px_rgba(234,88,12,0.4)]'
                              : 'glass-card-master hover:border-white/30'
                          }`}
                        >
                          {/* Card Top: Serial, Direction pill, and Drag handle */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-cyan-300">
                                {trade.serialNumber}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider flex items-center gap-1 ${
                                  trade.direction === 'Long'
                                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50'
                                    : 'bg-rose-500/25 text-rose-300 border border-rose-400/50'
                                }`}
                              >
                                {trade.direction === 'Long' ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {trade.direction.toUpperCase()}
                              </span>
                            </div>

                            <div className="flex items-center text-slate-400 group-hover:text-white transition-colors">
                              <GripVertical className="w-4 h-4 opacity-75" />
                            </div>
                          </div>

                          {/* Hero Monetary Display (Inspired by $51,350 in the reel) */}
                          <div className="p-3 rounded-xl bg-black/40 border border-white/10 my-2.5 flex items-center justify-between backdrop-blur-md">
                            <div>
                              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-300 block">
                                Realized P&L
                              </span>
                              <span
                                className={`text-2xl font-mono font-black tracking-tight ${
                                  isPositive
                                    ? 'text-emerald-400'
                                    : isNegative
                                    ? 'text-rose-400'
                                    : 'text-slate-200'
                                }`}
                              >
                                {formatCurrency(trade.realizedPnL)}
                              </span>
                            </div>

                            {/* Triple Chevrons indicator from reel (lime green) */}
                            <div className="flex items-center -space-x-1 text-lime-400 group-hover:translate-x-1.5 transition-transform duration-200">
                              <ChevronRight className="w-5 h-5 font-black" />
                              <ChevronRight className="w-5 h-5 opacity-70" />
                              <ChevronRight className="w-5 h-5 opacity-40" />
                            </div>
                          </div>

                          {/* Instrument & Session info */}
                          <div className="flex items-center justify-between text-xs my-2 font-mono">
                            <span className="font-bold text-white text-sm">
                              {trade.instrument}
                            </span>
                            <span className="text-slate-300 text-xs px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                              {trade.session}
                            </span>
                          </div>

                          {/* SMC Technical Checkpoints Badges */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-2.5 border-t border-white/10 text-[10px]">
                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-cyan-200 border border-white/15 font-mono font-medium">
                              {trade.checkpoints.marketStructure.status.replace(' (MSS)', '')}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-emerald-200 border border-white/15 font-mono font-medium">
                              {trade.checkpoints.fairValueGap.status.replace(' (Imbalance)', '')}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-lime-400/20 text-lime-300 border border-lime-400/40 font-mono font-bold ml-auto">
                              Grade {trade.checkpoints.entryQuality.rating}
                            </span>
                          </div>

                          {/* R:R Details */}
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2.5">
                            <span>Target: 1:{trade.plannedRR}</span>
                            {trade.realizedRR !== undefined && (
                              <span className="text-emerald-300 font-extrabold">
                                {trade.realizedRR > 0 ? '+' : ''}{trade.realizedRR}R
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
