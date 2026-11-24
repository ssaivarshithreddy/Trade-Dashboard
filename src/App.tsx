import React, { useState, useEffect, useMemo } from 'react';
import { Trade } from './types/trade';
import { storageService } from './services/db';
import { sampleTrades } from './data/sampleTrades';
import { calculatePerformanceMetrics, formatCurrency } from './utils/calculations';
import { DashboardOverview } from './components/DashboardOverview';
import { VisualAnalytics } from './components/VisualAnalytics';
import { TradeJournal } from './components/TradeJournal';
import { TradeKanbanBoard } from './components/TradeKanbanBoard';
import { TradeForm } from './components/TradeForm';
import { TradeDetailModal } from './components/TradeDetailModal';
import {
  LayoutDashboard,
  LineChart,
  BookOpen,
  PlusCircle,
  Sparkles,
  Trash2,
  Activity,
  CheckCircle2,
  X,
  Kanban,
  Zap,
} from 'lucide-react';

export const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'kanban' | 'analytics' | 'journal'>('overview');
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [tradeToView, setTradeToView] = useState<Trade | null>(null);
  const [nextSerialNumber, setNextSerialNumber] = useState<string>('#TRD-001');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load trades from storage on mount
  useEffect(() => {
    const loadData = async () => {
      const records = await storageService.getAllTrades();
      setTrades(records);
      const nextSerial = await storageService.getNextSerialNumber();
      setNextSerialNumber(nextSerial);
    };
    loadData();
  }, []);

  // Performance metrics computed dynamically from current trades
  const metrics = useMemo(() => {
    return calculatePerformanceMetrics(trades);
  }, [trades]);

  // Handle Save (Add or Update)
  const handleSaveTrade = async (trade: Trade) => {
    if (tradeToEdit) {
      await storageService.updateTrade(trade);
      setTrades((prev) => prev.map((t) => (t.id === trade.id ? trade : t)));
      showToast(`Updated trade ${trade.serialNumber} successfully.`);
    } else {
      await storageService.addTrade(trade);
      setTrades((prev) => [trade, ...prev]);
      const nextSerial = await storageService.getNextSerialNumber();
      setNextSerialNumber(nextSerial);
      showToast(`Recorded trade ${trade.serialNumber} successfully.`);
    }

    setShowFormModal(false);
    setTradeToEdit(null);
  };

  // Handle In-Place Update (e.g. from Kanban Drag and Drop)
  const handleUpdateTrade = async (updatedTrade: Trade) => {
    await storageService.updateTrade(updatedTrade);
    setTrades((prev) => prev.map((t) => (t.id === updatedTrade.id ? updatedTrade : t)));
    showToast(`Reclassified ${updatedTrade.serialNumber} to ${updatedTrade.outcome} (${formatCurrency(updatedTrade.realizedPnL)})`);
  };

  // Handle Delete
  const handleDeleteTrade = async (id: string) => {
    await storageService.deleteTrade(id);
    setTrades((prev) => prev.filter((t) => t.id !== id));
    const nextSerial = await storageService.getNextSerialNumber();
    setNextSerialNumber(nextSerial);
    showToast('Trade record removed.');
  };

  // Handle Load Sample Data
  const handleLoadSampleData = async () => {
    await storageService.bulkAddTrades(sampleTrades);
    setTrades(sampleTrades);
    const nextSerial = await storageService.getNextSerialNumber();
    setNextSerialNumber(nextSerial);
    showToast('Loaded 10 realistic SMC trades with full analysis checkpoints!');
  };

  // Handle Clear All Data
  const handleClearAllData = async () => {
    if (confirm('Clear all trade journal records? This cannot be undone.')) {
      await storageService.clearAllTrades();
      setTrades([]);
      setNextSerialNumber('#TRD-001');
      showToast('All journal records cleared.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden bg-dot-grid">
      {/* Cinematic Ambient Background Light Spheres */}
      <div className="ambient-glow-cyan" />
      <div className="ambient-glow-emerald" />
      <div className="ambient-glow-purple" />

      {/* Floating Toast Notification with Frosted Glass */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`px-5 py-3.5 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-bold backdrop-blur-2xl ${
              toastMessage.type === 'success'
                ? 'glass-tint-emerald text-emerald-200 border-emerald-400/50 shadow-emerald-950/60'
                : toastMessage.type === 'error'
                ? 'glass-tint-rose text-rose-200 border-rose-400/50 shadow-rose-950/60'
                : 'glass-tint-blue text-cyan-200 border-cyan-400/50 shadow-cyan-950/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 hover:opacity-75 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Frosted Glass Header */}
      <header className="sticky top-3 z-40 max-w-7xl mx-auto w-[96%] sm:w-full px-2 sm:px-6 my-2">
        <div className="glass-panel-master rounded-2xl sm:rounded-3xl px-4 sm:px-6 h-18 flex items-center justify-between gap-4 py-3 border border-white/15">
          {/* Logo & Terminal Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lime-400 via-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-950/80 flex items-center justify-center">
              <div className="w-full h-full bg-[#080d1a] rounded-[14px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-lime-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-white text-base sm:text-lg font-mono">
                  APEX<span className="text-cyan-400">EDGE</span>
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold shadow-sm shadow-emerald-500/20">
                  GLASS TERMINAL
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
                Smart Money Concepts & Performance Analytics
              </p>
            </div>
          </div>

          {/* Frosted Glass Navigation Pill Dock */}
          <nav className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                activeTab === 'kanban'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-lime-400" />
              <span>Pipeline</span>
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse ml-0.5" />
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'journal'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Journal</span>
              {trades.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-white font-mono font-bold">
                  {trades.length}
                </span>
              )}
            </button>
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setTradeToEdit(null);
                setShowFormModal(true);
              }}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Log Trade</span>
            </button>

            {trades.length === 0 ? (
              <button
                onClick={handleLoadSampleData}
                className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Load 10 sample SMC trades"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Demo Data</span>
              </button>
            ) : (
              <button
                onClick={handleClearAllData}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/50 text-slate-400 hover:text-rose-300 text-xs transition-colors"
                title="Clear all trades"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeTab === 'overview' && (
          <DashboardOverview
            trades={trades}
            metrics={metrics}
            onNewTrade={() => {
              setTradeToEdit(null);
              setShowFormModal(true);
            }}
            onLoadSampleData={handleLoadSampleData}
            onViewJournal={() => setActiveTab('journal')}
          />
        )}

        {activeTab === 'kanban' && (
          <TradeKanbanBoard
            trades={trades}
            onUpdateTrade={handleUpdateTrade}
            onViewTrade={(trade) => setTradeToView(trade)}
            onNewTrade={() => {
              setTradeToEdit(null);
              setShowFormModal(true);
            }}
          />
        )}

        {activeTab === 'analytics' && <VisualAnalytics trades={trades} />}

        {activeTab === 'journal' && (
          <TradeJournal
            trades={trades}
            onViewTrade={(trade) => setTradeToView(trade)}
            onEditTrade={(trade) => {
              setTradeToEdit(trade);
              setShowFormModal(true);
            }}
            onDeleteTrade={handleDeleteTrade}
            onNewTrade={() => {
              setTradeToEdit(null);
              setShowFormModal(true);
            }}
          />
        )}
      </main>

      {/* Trade Entry / Edit Modal Form with Ultra Glass */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl overflow-y-auto">
          <div className="max-w-5xl w-full max-h-[94vh] overflow-y-auto">
            <TradeForm
              initialTrade={tradeToEdit}
              nextSerialNumber={nextSerialNumber}
              onSave={handleSaveTrade}
              onCancel={() => {
                setShowFormModal(false);
                setTradeToEdit(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Trade Detail Modal with Ultra Glass */}
      <TradeDetailModal
        trade={tradeToView}
        onClose={() => setTradeToView(null)}
        onEdit={(trade) => {
          setTradeToView(null);
          setTradeToEdit(trade);
          setShowFormModal(true);
        }}
        onDelete={handleDeleteTrade}
      />

      {/* Terminal Footer with Frosted Glass */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-400 font-mono relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ApexEdge Institutional Journal © 2026 • Premium Glassmorphic Terminal Engine</span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-semibold">● Frosted Glass Glassmorphism</span>
            <span>SMC / ICT Checkpoint Analysis</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
