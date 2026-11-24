import React from 'react';
import { Trade } from '../types/trade';
import { formatCurrency } from '../utils/calculations';
import {
  X,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Layers,
  Award,
  Zap,
  Target,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface TradeDetailModalProps {
  trade: Trade | null;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!trade) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto">
      <div className="relative glass-panel-master border border-white/20 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 sticky top-0 bg-[#080d1a]/95 backdrop-blur-xl z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 font-mono text-xs font-semibold">
              {trade.serialNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100 font-mono">
                  {trade.instrument}
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono font-semibold flex items-center gap-1 ${
                    trade.direction === 'Long'
                      ? 'bg-emerald-950/70 border border-emerald-800/60 text-emerald-300'
                      : 'bg-rose-950/70 border border-rose-800/60 text-rose-300'
                  }`}
                >
                  {trade.direction === 'Long' ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {trade.direction.toUpperCase()}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    trade.outcome === 'Win'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : trade.outcome === 'Loss'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-700/40 text-slate-300 border border-slate-600/40'
                  }`}
                >
                  {trade.outcome.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {trade.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {trade.executionTime} ({trade.session})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(trade)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this trade record?')) {
                  onDelete(trade.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-medium transition-colors"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Key Execution Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#111827] border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Entry Price
              </span>
              <span className="text-base font-mono font-semibold text-slate-200">
                {trade.entryPrice.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-400 uppercase tracking-wider block mb-1">
                Take Profit
              </span>
              <span className="text-base font-mono font-semibold text-emerald-300">
                {trade.takeProfit.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-rose-400 uppercase tracking-wider block mb-1">
                Stop Loss
              </span>
              <span className="text-base font-mono font-semibold text-rose-300">
                {trade.stopLoss.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-cyan-400 uppercase tracking-wider block mb-1">
                Planned R:R
              </span>
              <span className="text-base font-mono font-semibold text-cyan-300">
                1 : {trade.plannedRR}
              </span>
            </div>
          </div>

          {/* Realized Profit & Outcome Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0e1626] border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Realized Net P&L</span>
              <span
                className={`text-2xl font-mono font-bold ${
                  trade.realizedPnL > 0
                    ? 'text-emerald-400'
                    : trade.realizedPnL < 0
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {formatCurrency(trade.realizedPnL)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#0e1626] border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Realized R-Multiple</span>
              <span className="text-2xl font-mono font-bold text-slate-200">
                {trade.realizedRR ? `${trade.realizedRR > 0 ? '+' : ''}${trade.realizedRR}R` : '—'}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#0e1626] border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Position / Risk</span>
              <span className="text-sm font-mono text-slate-300 block mt-1">
                Size: {trade.positionSize || 1} units
              </span>
              <span className="text-xs font-mono text-slate-500">
                Risk: {trade.riskAmount ? `$${trade.riskAmount}` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Trade Screenshot */}
          {trade.screenshot && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Trade Chart Execution Screenshot</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group relative">
                <img
                  src={trade.screenshot}
                  alt={`Screenshot for ${trade.instrument}`}
                  className="w-full max-h-[480px] object-contain bg-black/40"
                />
                <a
                  href={trade.screenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 backdrop-blur transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Full Resolution
                </a>
              </div>
            </div>
          )}

          {/* Technical Analysis Checkpoints (SMC/Institutional Grid) */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Technical Analysis Checkpoints</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Market Structure */}
              <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">Market Structure</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-medium">
                    {trade.checkpoints.marketStructure.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 whitespace-pre-wrap leading-relaxed">
                  {trade.checkpoints.marketStructure.notes || 'No description logged.'}
                </p>
              </div>

              {/* Fair Value Gap */}
              <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">Fair Value Gap (FVG)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-medium">
                    {trade.checkpoints.fairValueGap.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 whitespace-pre-wrap leading-relaxed">
                  {trade.checkpoints.fairValueGap.notes || 'No description logged.'}
                </p>
              </div>

              {/* Liquidity */}
              <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">Liquidity Purge / Pool</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-medium">
                    {trade.checkpoints.liquidity.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 whitespace-pre-wrap leading-relaxed">
                  {trade.checkpoints.liquidity.notes || 'No description logged.'}
                </p>
              </div>

              {/* Inverse Fair Value Gap */}
              <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">Inverse FVG (IFVG)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-medium">
                    {trade.checkpoints.inverseFairValueGap.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 whitespace-pre-wrap leading-relaxed">
                  {trade.checkpoints.inverseFairValueGap.notes || 'No description logged.'}
                </p>
              </div>

              {/* Entry Quality */}
              <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">Entry Quality Grade</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold">
                    Grade {trade.checkpoints.entryQuality.rating}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 whitespace-pre-wrap leading-relaxed">
                  {trade.checkpoints.entryQuality.notes || 'No description logged.'}
                </p>
              </div>

              {/* Confidence Level */}
              <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">Confidence Level</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60 font-medium">
                    {trade.checkpoints.confidenceLevel.level}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 whitespace-pre-wrap leading-relaxed">
                  {trade.checkpoints.confidenceLevel.notes || 'No description logged.'}
                </p>
              </div>
            </div>
          </div>

          {/* General Notes & Reflection */}
          {trade.generalNotes && (
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Trade Narrative & Execution Review
              </span>
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {trade.generalNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
