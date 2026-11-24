import React, { useState, useMemo } from 'react';
import { Trade, TradeFilterCriteria } from '../types/trade';
import { formatCurrency } from '../utils/calculations';
import { exportTradesToCSV } from '../utils/csv';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  X,
  XCircle,
  RotateCcw,
} from 'lucide-react';

interface TradeJournalProps {
  trades: Trade[];
  onViewTrade: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
  onNewTrade: () => void;
}

type SortField = 'date' | 'serialNumber' | 'instrument' | 'realizedPnL' | 'plannedRR' | 'outcome';
type SortOrder = 'asc' | 'desc';

export const TradeJournal: React.FC<TradeJournalProps> = ({
  trades,
  onViewTrade,
  onEditTrade,
  onDeleteTrade,
  onNewTrade,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter criteria state
  const [filters, setFilters] = useState<TradeFilterCriteria>({
    searchQuery: '',
    dateFrom: '',
    dateTo: '',
    instrument: '',
    session: '',
    outcome: '',
    direction: '',
    marketStructure: '',
    fvg: '',
    entryQuality: '',
    confidence: '',
  });

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
      instrument: '',
      session: '',
      outcome: '',
      direction: '',
      marketStructure: '',
      fvg: '',
      entryQuality: '',
      confidence: '',
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Distinct list of instruments and sessions for filter dropdowns
  const availableInstruments = useMemo(() => {
    const set = new Set<string>();
    trades.forEach((t) => {
      if (t.instrument) set.add(t.instrument);
    });
    return Array.from(set).sort();
  }, [trades]);

  // Filtered and Sorted Trades
  const filteredTrades = useMemo(() => {
    return trades
      .filter((t) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchSerial = t.serialNumber?.toLowerCase().includes(q);
          const matchInst = t.instrument?.toLowerCase().includes(q);
          const matchNotes = t.generalNotes?.toLowerCase().includes(q);
          const matchMS = t.checkpoints?.marketStructure?.notes?.toLowerCase().includes(q);
          const matchFVG = t.checkpoints?.fairValueGap?.notes?.toLowerCase().includes(q);
          if (!matchSerial && !matchInst && !matchNotes && !matchMS && !matchFVG) {
            return false;
          }
        }

        // Date range
        if (filters.dateFrom && t.date < filters.dateFrom) return false;
        if (filters.dateTo && t.date > filters.dateTo) return false;

        // Instrument
        if (filters.instrument && t.instrument !== filters.instrument) return false;

        // Session
        if (filters.session && t.session !== filters.session) return false;

        // Outcome
        if (filters.outcome && t.outcome !== filters.outcome) return false;

        // Direction
        if (filters.direction && t.direction !== filters.direction) return false;

        // Technical Checkpoints
        if (
          filters.marketStructure &&
          t.checkpoints.marketStructure.status !== filters.marketStructure
        ) {
          return false;
        }

        if (filters.fvg && t.checkpoints.fairValueGap.status !== filters.fvg) {
          return false;
        }

        if (
          filters.entryQuality &&
          t.checkpoints.entryQuality.rating !== filters.entryQuality
        ) {
          return false;
        }

        if (
          filters.confidence &&
          t.checkpoints.confidenceLevel.level !== filters.confidence
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'date') {
          valA = new Date(`${a.date}T${a.executionTime || '00:00'}`).getTime();
          valB = new Date(`${b.date}T${b.executionTime || '00:00'}`).getTime();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [trades, filters, sortField, sortOrder]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Search, Action Toolbar & Filter Toggle in Frosted Glass */}
      <div className="glass-panel-master rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border border-white/15">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by instrument, serial #, analysis notes..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors backdrop-blur-md"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters({ ...filters, searchQuery: '' })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-cyan-500/25 border-cyan-400/50 text-cyan-200 shadow-md shadow-cyan-950/60'
                : 'glass-card-master text-slate-200 hover:border-white/30'
            }`}
          >
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 text-[10px] flex items-center justify-center font-mono font-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={() => exportTradesToCSV(filteredTrades)}
            disabled={filteredTrades.length === 0}
            className="px-4 py-3 rounded-2xl glass-card-master hover:border-white/30 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Export filtered trades to CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onNewTrade}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-lime-950 transition-all flex items-center gap-2"
          >
            <span>+ Log Trade</span>
          </button>
        </div>
      </div>

      {/* Expanded Filter Drawer */}
      {showFilters && (
        <div className="glass-panel-master rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200 border border-white/15">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              Multi-Criteria Trade Filtering
            </h4>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Instrument */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Instrument
              </label>
              <select
                value={filters.instrument}
                onChange={(e) => setFilters({ ...filters, instrument: e.target.value })}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Instruments</option>
                {availableInstruments.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>

            {/* Session */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Session
              </label>
              <select
                value={filters.session}
                onChange={(e) => setFilters({ ...filters, session: e.target.value })}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Sessions</option>
                <option value="London">London</option>
                <option value="New York AM">New York AM</option>
                <option value="New York PM">New York PM</option>
                <option value="Asian">Asian</option>
              </select>
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Outcome
              </label>
              <select
                value={filters.outcome}
                onChange={(e) => setFilters({ ...filters, outcome: e.target.value })}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Outcomes</option>
                <option value="Win">Wins Only</option>
                <option value="Loss">Losses Only</option>
                <option value="Break-even">Break-Even</option>
              </select>
            </div>

            {/* Direction */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Direction
              </label>
              <select
                value={filters.direction}
                onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Directions</option>
                <option value="Long">Long</option>
                <option value="Short">Short</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Market Structure */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Market Structure
              </label>
              <select
                value={filters.marketStructure}
                onChange={(e) =>
                  setFilters({ ...filters, marketStructure: e.target.value })
                }
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Structures</option>
                <option value="Bullish MSS">Bullish MSS</option>
                <option value="Bearish MSS">Bearish MSS</option>
                <option value="Bullish BOS">Bullish BOS</option>
                <option value="Bearish BOS">Bearish BOS</option>
                <option value="Range / Consolidation">Range / Consolidation</option>
              </select>
            </div>

            {/* FVG Status */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Fair Value Gap
              </label>
              <select
                value={filters.fvg}
                onChange={(e) => setFilters({ ...filters, fvg: e.target.value })}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All FVG Types</option>
                <option value="Bullish FVG">Bullish FVG</option>
                <option value="Bearish FVG">Bearish FVG</option>
                <option value="Balanced Price Range (BPR)">BPR</option>
                <option value="None">None</option>
              </select>
            </div>

            {/* Entry Quality */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Quality Grade
              </label>
              <select
                value={filters.entryQuality}
                onChange={(e) => setFilters({ ...filters, entryQuality: e.target.value })}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Grades</option>
                <option value="A+">Grade A+</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>

            {/* Confidence Level */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Confidence
              </label>
              <select
                value={filters.confidence}
                onChange={(e) => setFilters({ ...filters, confidence: e.target.value })}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Levels</option>
                <option value="High (8-10)">High (8-10)</option>
                <option value="Medium (5-7)">Medium (5-7)</option>
                <option value="Low (1-4)">Low (1-4)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Trades Table with Glassmorphism */}
      <div className="glass-panel-master rounded-3xl shadow-2xl overflow-hidden border border-white/15">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-slate-300 uppercase font-mono tracking-wider border-b border-white/10 backdrop-blur-md">
              <tr>
                <th
                  onClick={() => handleSort('serialNumber')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Trade #</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Date / Time</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('instrument')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Instrument</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Dir</th>
                <th className="py-3 px-4 text-right">Entry / Target / SL</th>
                <th
                  onClick={() => handleSort('plannedRR')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Planned R:R</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('realizedPnL')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Realized P&L</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('outcome')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Outcome</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-center">Chart</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium text-slate-400">
                      No trade records match the current criteria.
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Try adjusting search or filter options, or log a new trade.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="hover:bg-[#0e1626]/60 transition-colors group"
                  >
                    {/* Serial Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {trade.serialNumber}
                    </td>

                    {/* Date / Time */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-200">{trade.date}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {trade.executionTime}
                      </div>
                    </td>

                    {/* Instrument */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-100">
                      {trade.instrument}
                    </td>

                    {/* Session */}
                    <td className="py-3.5 px-4 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800/80 text-[11px]">
                        {trade.session}
                      </span>
                    </td>

                    {/* Direction */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-semibold text-[11px] flex items-center gap-1 w-fit ${
                          trade.direction === 'Long'
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
                            : 'bg-rose-950/70 text-rose-300 border border-rose-800/50'
                        }`}
                      >
                        {trade.direction === 'Long' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {trade.direction}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="text-slate-200">{trade.entryPrice.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">
                        TP: {trade.takeProfit} | SL: {trade.stopLoss}
                      </div>
                    </td>

                    {/* Planned R:R */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-cyan-300">
                      1 : {trade.plannedRR}
                    </td>

                    {/* Realized P&L */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                      <span
                        className={
                          trade.realizedPnL > 0
                            ? 'text-emerald-400'
                            : trade.realizedPnL < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }
                      >
                        {formatCurrency(trade.realizedPnL)}
                      </span>
                      {trade.realizedRR !== undefined && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          {trade.realizedRR > 0 ? '+' : ''}
                          {trade.realizedRR}R
                        </div>
                      )}
                    </td>

                    {/* Outcome Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          trade.outcome === 'Win'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : trade.outcome === 'Loss'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
                        }`}
                      >
                        {trade.outcome}
                      </span>
                    </td>

                    {/* Quality Grade */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        {trade.checkpoints?.entryQuality?.rating || '—'}
                      </span>
                    </td>

                    {/* Screenshot thumbnail */}
                    <td className="py-3.5 px-4 text-center">
                      {trade.screenshot ? (
                        <button
                          onClick={() => onViewTrade(trade)}
                          className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-400 transition-colors inline-block"
                          title="Click to view chart screenshot"
                        >
                          <img
                            src={trade.screenshot}
                            alt="thumb"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewTrade(trade)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditTrade(trade)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          title="Edit Trade"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete trade ${trade.serialNumber}?`)) {
                              onDeleteTrade(trade.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Trade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="py-3 px-5 border-t border-slate-800 bg-[#0e1626] flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-slate-200">{filteredTrades.length}</strong> of{' '}
            <strong className="text-slate-200">{trades.length}</strong> recorded trades
          </span>
          <span className="font-mono">ApexEdge Institutional Journal</span>
        </div>
      </div>
    </div>
  );
};
