import React, { useState, useEffect, useRef } from 'react';
import {
  Trade,
  TradeDirection,
  TradeOutcome,
  TradingSession,
  MarketStructureStatus,
  FVGStatus,
  LiquidityStatus,
  IFVGStatus,
  EntryQualityRating,
  ConfidenceLevel,
  TechnicalCheckpoints,
} from '../types/trade';
import { calculatePlannedRR, validateTradePrices } from '../utils/calculations';
import {
  Upload,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Award,
  Zap,
} from 'lucide-react';

interface TradeFormProps {
  initialTrade?: Trade | null;
  nextSerialNumber: string;
  onSave: (trade: Trade) => Promise<void>;
  onCancel: () => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({
  initialTrade,
  nextSerialNumber,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(initialTrade);

  // Basic Details
  const [serialNumber, setSerialNumber] = useState(
    initialTrade?.serialNumber || nextSerialNumber
  );
  const [date, setDate] = useState(
    initialTrade?.date || new Date().toISOString().slice(0, 10)
  );
  const [executionTime, setExecutionTime] = useState(
    initialTrade?.executionTime ||
      new Date().toTimeString().slice(0, 5)
  );
  const [instrument, setInstrument] = useState(initialTrade?.instrument || '');
  const [session, setSession] = useState<TradingSession>(
    initialTrade?.session || 'New York AM'
  );
  const [direction, setDirection] = useState<TradeDirection>(
    initialTrade?.direction || 'Long'
  );

  // Price & Risk Inputs
  const [entryPrice, setEntryPrice] = useState<string>(
    initialTrade?.entryPrice !== undefined ? String(initialTrade.entryPrice) : ''
  );
  const [takeProfit, setTakeProfit] = useState<string>(
    initialTrade?.takeProfit !== undefined ? String(initialTrade.takeProfit) : ''
  );
  const [stopLoss, setStopLoss] = useState<string>(
    initialTrade?.stopLoss !== undefined ? String(initialTrade.stopLoss) : ''
  );
  const [plannedRR, setPlannedRR] = useState<number>(initialTrade?.plannedRR || 0);

  // Profit Calculation Inputs
  const [calcMode, setCalcMode] = useState<'direct' | 'exitPrice'>('direct');
  const [exitPrice, setExitPrice] = useState<string>(
    initialTrade?.exitPrice !== undefined ? String(initialTrade.exitPrice) : ''
  );
  const [positionSize, setPositionSize] = useState<string>(
    initialTrade?.positionSize !== undefined ? String(initialTrade.positionSize) : '1'
  );
  const [riskAmount, setRiskAmount] = useState<string>(
    initialTrade?.riskAmount !== undefined ? String(initialTrade.riskAmount) : ''
  );
  const [realizedPnL, setRealizedPnL] = useState<string>(
    initialTrade?.realizedPnL !== undefined ? String(initialTrade.realizedPnL) : ''
  );
  const [realizedRR, setRealizedRR] = useState<string>(
    initialTrade?.realizedRR !== undefined ? String(initialTrade.realizedRR) : ''
  );
  const [outcome, setOutcome] = useState<TradeOutcome>(
    initialTrade?.outcome || 'Win'
  );

  // Screenshot & Notes
  const [screenshot, setScreenshot] = useState<string | undefined>(
    initialTrade?.screenshot
  );
  const [generalNotes, setGeneralNotes] = useState(initialTrade?.generalNotes || '');

  // Technical Analysis Checkpoints
  const [checkpoints, setCheckpoints] = useState<TechnicalCheckpoints>(
    initialTrade?.checkpoints || {
      marketStructure: { status: 'Bullish MSS', notes: '' },
      fairValueGap: { status: 'Bullish FVG', notes: '' },
      liquidity: { status: 'Sell-Side Liquidity (SSL) Swept', notes: '' },
      inverseFairValueGap: { status: 'Confirmed Bullish IFVG', notes: '' },
      entryQuality: { rating: 'A+', notes: '' },
      confidenceLevel: { level: 'High (8-10)', notes: '' },
    }
  );

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common quick instruments
  const quickInstruments = ['NQ 100', 'ES 500', 'EUR/USD', 'GBP/USD', 'BTC/USD', 'XAU/USD'];

  // Recalculate Planned R:R whenever Entry, TP, SL, or Direction change
  useEffect(() => {
    const entry = parseFloat(entryPrice);
    const tp = parseFloat(takeProfit);
    const sl = parseFloat(stopLoss);

    if (!isNaN(entry) && !isNaN(tp) && !isNaN(sl)) {
      const rr = calculatePlannedRR(entry, tp, sl, direction);
      setPlannedRR(rr);
    } else {
      setPlannedRR(0);
    }
  }, [entryPrice, takeProfit, stopLoss, direction]);

  // Recalculate Realized PnL when in Exit Price mode
  useEffect(() => {
    if (calcMode === 'exitPrice') {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const size = parseFloat(positionSize) || 1;

      if (!isNaN(entry) && !isNaN(exit)) {
        let pnl = 0;
        if (direction === 'Long') {
          pnl = (exit - entry) * size;
        } else {
          pnl = (entry - exit) * size;
        }
        setRealizedPnL(pnl.toFixed(2));

        // Auto-suggest outcome
        if (pnl > 0.01) setOutcome('Win');
        else if (pnl < -0.01) setOutcome('Loss');
        else setOutcome('Break-even');

        // Calculate Realized R
        const risk = parseFloat(riskAmount);
        if (!isNaN(risk) && risk > 0) {
          setRealizedRR((pnl / risk).toFixed(2));
        } else {
          const sl = parseFloat(stopLoss);
          if (!isNaN(sl)) {
            const riskDist = Math.abs(entry - sl) * size;
            if (riskDist > 0) {
              setRealizedRR((pnl / riskDist).toFixed(2));
            }
          }
        }
      }
    }
  }, [calcMode, exitPrice, entryPrice, positionSize, direction, riskAmount, stopLoss]);

  // Handle direct PnL changes to automatically adjust outcome
  const handlePnLChange = (val: string) => {
    setRealizedPnL(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (num > 0) setOutcome('Win');
      else if (num < 0) setOutcome('Loss');
      else setOutcome('Break-even');

      const risk = parseFloat(riskAmount);
      if (!isNaN(risk) && risk > 0) {
        setRealizedRR((num / risk).toFixed(2));
      }
    }
  };

  // Image Upload and Compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setScreenshot(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCheckpointChange = (
    key: keyof TechnicalCheckpoints,
    field: 'status' | 'notes' | 'rating' | 'level',
    value: string
  ) => {
    setCheckpoints(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!instrument.trim()) errors.instrument = 'Trading instrument is required';
    if (!entryPrice || isNaN(parseFloat(entryPrice))) errors.entryPrice = 'Valid Entry Price is required';
    if (!takeProfit || isNaN(parseFloat(takeProfit))) errors.takeProfit = 'Valid Take Profit is required';
    if (!stopLoss || isNaN(parseFloat(stopLoss))) errors.stopLoss = 'Valid Stop Loss is required';
    if (realizedPnL === '' || isNaN(parseFloat(realizedPnL))) errors.realizedPnL = 'Realized P&L is required';

    const entry = parseFloat(entryPrice);
    const tp = parseFloat(takeProfit);
    const sl = parseFloat(stopLoss);

    if (!errors.entryPrice && !errors.takeProfit && !errors.stopLoss) {
      const priceValidation = validateTradePrices(entry, tp, sl, direction);
      if (!priceValidation.isValid) {
        errors.priceValidation = priceValidation.error || 'Invalid TP or SL for selected direction';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const tradeData: Trade = {
        id: initialTrade?.id || `trd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        serialNumber: serialNumber || nextSerialNumber,
        date,
        instrument: instrument.trim().toUpperCase(),
        session,
        executionTime,
        direction,
        entryPrice: entry,
        takeProfit: tp,
        stopLoss: sl,
        plannedRR: plannedRR || calculatePlannedRR(entry, tp, sl, direction),
        exitPrice: exitPrice ? parseFloat(exitPrice) : undefined,
        positionSize: positionSize ? parseFloat(positionSize) : 1,
        riskAmount: riskAmount ? parseFloat(riskAmount) : undefined,
        realizedPnL: parseFloat(realizedPnL),
        realizedRR: realizedRR ? parseFloat(realizedRR) : undefined,
        outcome,
        screenshot,
        generalNotes: generalNotes.trim(),
        checkpoints,
        createdAt: initialTrade?.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await onSave(tradeData);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save trade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel-master rounded-3xl shadow-2xl p-6 lg:p-8 max-w-5xl mx-auto border border-white/20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-400 font-mono text-xs font-semibold tracking-wider">
              {serialNumber}
            </span>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-100 flex items-center gap-2">
              {isEditing ? 'Edit Trade Record' : 'Log New Execution'}
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Record trade execution parameters, technical checkpoints, and profit calculations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Global Validation Alert */}
      {formErrors.priceValidation && (
        <div className="mt-6 p-4 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold">Price Boundary Warning</p>
            <p className="text-rose-200/90 text-xs mt-0.5">{formErrors.priceValidation}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* SECTION 1: EXECUTION IDENTIFICATION & TIMING */}
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Calendar className="w-4 h-4" />
            <span>1. Trade Identification & Session</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Serial Number */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Serial Number
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-3.5 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-cyan-500"
                placeholder="#TRD-001"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Execution Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-3.5 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Execution Time */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Execution Time (Local) *
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={executionTime}
                  onChange={(e) => setExecutionTime(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-3.5 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            {/* Trading Session */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Trading Session *
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as TradingSession)}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-3.5 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="London">London (02:00 - 05:00 EST)</option>
                <option value="New York AM">New York AM (08:00 - 11:30 EST)</option>
                <option value="New York PM">New York PM (13:30 - 16:00 EST)</option>
                <option value="Asian">Asian (19:00 - 00:00 EST)</option>
                <option value="Pre-Market">Pre-Market</option>
                <option value="After-Hours">After-Hours</option>
              </select>
            </div>
          </div>

          {/* Instrument & Quick Chips */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">
                Entity / Trading Instrument *
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Quick:</span>
                {quickInstruments.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setInstrument(item)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              className={`w-full bg-[#111827] border ${
                formErrors.instrument ? 'border-rose-500' : 'border-slate-700/80'
              } rounded-lg px-3.5 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-cyan-500`}
              placeholder="e.g. NQ 100, EUR/USD, ES 500, BTC/USD, AAPL"
              required
            />
            {formErrors.instrument && (
              <p className="text-rose-400 text-xs mt-1">{formErrors.instrument}</p>
            )}
          </div>
        </div>

        {/* SECTION 2: TRADE DIRECTION, PRICING & RISK */}
        <div className="pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-4 h-4" />
            <span>2. Direction, Price Levels & Planned Risk-to-Reward</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Direction Selector */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Order Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('Long')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    direction === 'Long'
                      ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 glow-green'
                      : 'bg-[#111827] border border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('Short')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    direction === 'Short'
                      ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-300 glow-red'
                      : 'bg-[#111827] border border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  SHORT
                </button>
              </div>
            </div>

            {/* Entry, TP, SL */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Entry Price *
                </label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className={`w-full bg-[#111827] border ${
                    formErrors.entryPrice ? 'border-rose-500' : 'border-slate-700/80'
                  } rounded-lg px-3.5 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500`}
                  placeholder="0.00"
                  required
                />
                {formErrors.entryPrice && (
                  <p className="text-rose-400 text-xs mt-1">{formErrors.entryPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1.5 flex items-center justify-between">
                  <span>Take Profit (TP) *</span>
                  <span className="text-[10px] text-slate-500">Target</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className={`w-full bg-[#111827] border ${
                    formErrors.takeProfit ? 'border-rose-500' : 'border-emerald-600/60'
                  } rounded-lg px-3.5 py-2 text-emerald-300 font-mono text-sm focus:outline-none focus:border-emerald-500`}
                  placeholder="0.00"
                  required
                />
                {formErrors.takeProfit && (
                  <p className="text-rose-400 text-xs mt-1">{formErrors.takeProfit}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-rose-400 mb-1.5 flex items-center justify-between">
                  <span>Stop Loss (SL) *</span>
                  <span className="text-[10px] text-slate-500">Risk boundary</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className={`w-full bg-[#111827] border ${
                    formErrors.stopLoss ? 'border-rose-500' : 'border-rose-600/60'
                  } rounded-lg px-3.5 py-2 text-rose-300 font-mono text-sm focus:outline-none focus:border-rose-500`}
                  placeholder="0.00"
                  required
                />
                {formErrors.stopLoss && (
                  <p className="text-rose-400 text-xs mt-1">{formErrors.stopLoss}</p>
                )}
              </div>
            </div>
          </div>

          {/* Planned R:R Display Banner */}
          <div className="mt-4 p-4 rounded-lg bg-[#0e172a] border border-cyan-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs text-slate-400">Automatically Computed Risk-to-Reward</p>
                <p className="text-xs text-slate-500">Formula: |TP - Entry| / |Entry - SL|</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider mr-2">Planned R:R:</span>
              <span className={`text-xl font-mono font-bold ${plannedRR >= 2 ? 'text-emerald-400' : plannedRR > 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                {plannedRR > 0 ? `1 : ${plannedRR.toFixed(2)}` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: PROFIT CALCULATION & OUTCOME */}
        <div className="pt-6 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              <span>3. Profit Calculation & Trade Outcome</span>
            </div>

            <div className="flex items-center bg-[#111827] p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setCalcMode('direct')}
                className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                  calcMode === 'direct'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Direct P&L ($)
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('exitPrice')}
                className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                  calcMode === 'exitPrice'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Exit Price & Position Size
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {calcMode === 'exitPrice' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Exit Price</span>
                    <button
                      type="button"
                      onClick={() => setExitPrice(takeProfit)}
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      Fill TP
                    </button>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-3.5 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="Executed exit"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Position Size / Lots / Contracts
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                    className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-3.5 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="1"
                  />
                </div>
              </>
            ) : null}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Risk Amount ($) (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={riskAmount}
                onChange={(e) => setRiskAmount(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-3.5 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                placeholder="e.g. 500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Realized Net P&L ($) *</span>
                <span className="text-[10px] text-slate-500">+ Win / - Loss</span>
              </label>
              <input
                type="number"
                step="any"
                value={realizedPnL}
                onChange={(e) => handlePnLChange(e.target.value)}
                readOnly={calcMode === 'exitPrice'}
                className={`w-full bg-[#111827] border ${
                  formErrors.realizedPnL ? 'border-rose-500' : 'border-slate-700/80'
                } rounded-lg px-3.5 py-2 font-mono text-sm font-semibold focus:outline-none ${
                  parseFloat(realizedPnL) > 0
                    ? 'text-emerald-400'
                    : parseFloat(realizedPnL) < 0
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
                placeholder="e.g. +1250 or -400"
                required
              />
              {formErrors.realizedPnL && (
                <p className="text-rose-400 text-xs mt-1">{formErrors.realizedPnL}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Realized R-Multiple
              </label>
              <input
                type="number"
                step="0.01"
                value={realizedRR}
                onChange={(e) => setRealizedRR(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-3.5 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                placeholder="e.g. 2.50R or -1.00R"
              />
            </div>
          </div>

          {/* Outcome Buttons */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Trade Outcome *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setOutcome('Win')}
                className={`py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  outcome === 'Win'
                    ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 shadow-lg glow-green'
                    : 'bg-[#111827] border border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                WIN
              </button>
              <button
                type="button"
                onClick={() => setOutcome('Loss')}
                className={`py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  outcome === 'Loss'
                    ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-300 shadow-lg glow-red'
                    : 'bg-[#111827] border border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <X className="w-4 h-4 text-rose-400" />
                LOSS
              </button>
              <button
                type="button"
                onClick={() => setOutcome('Break-even')}
                className={`py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  outcome === 'Break-even'
                    ? 'bg-slate-700/50 border-2 border-slate-400 text-slate-200'
                    : 'bg-[#111827] border border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                BREAK-EVEN
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: TECHNICAL ANALYSIS CHECKPOINTS */}
        <div className="pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4" />
            <span>4. Technical Analysis Checkpoints (SMC / Institutional Framework)</span>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Document each checkpoint with the appropriate structural tag and analysis rationale.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Market Structure */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4">
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                1. Market Structure
              </label>
              <select
                value={checkpoints.marketStructure.status}
                onChange={(e) =>
                  handleCheckpointChange('marketStructure', 'status', e.target.value)
                }
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-500 mb-2.5"
              >
                <option value="Bullish MSS">Bullish MSS (Market Structure Shift)</option>
                <option value="Bearish MSS">Bearish MSS (Market Structure Shift)</option>
                <option value="Bullish BOS">Bullish BOS (Break of Structure)</option>
                <option value="Bearish BOS">Bearish BOS (Break of Structure)</option>
                <option value="Range / Consolidation">Range / Consolidation</option>
                <option value="Neutral">Neutral / Choppy</option>
              </select>
              <textarea
                value={checkpoints.marketStructure.notes}
                onChange={(e) =>
                  handleCheckpointChange('marketStructure', 'notes', e.target.value)
                }
                rows={2}
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded-lg p-2.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                placeholder="Market structure shift timeframe, displacement candle, swing points broken..."
              />
            </div>

            {/* 2. Fair Value Gap */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4">
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                2. Fair Value Gap (FVG)
              </label>
              <select
                value={checkpoints.fairValueGap.status}
                onChange={(e) =>
                  handleCheckpointChange('fairValueGap', 'status', e.target.value)
                }
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-500 mb-2.5"
              >
                <option value="Bullish FVG">Bullish FVG (Imbalance)</option>
                <option value="Bearish FVG">Bearish FVG (Imbalance)</option>
                <option value="Balanced Price Range (BPR)">Balanced Price Range (BPR)</option>
                <option value="Volume Imbalance">Volume Imbalance</option>
                <option value="None">None</option>
              </select>
              <textarea
                value={checkpoints.fairValueGap.notes}
                onChange={(e) =>
                  handleCheckpointChange('fairValueGap', 'notes', e.target.value)
                }
                rows={2}
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded-lg p-2.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                placeholder="FVG timeframe (e.g. 5m / 15m), Consequent Encroachment (50%) tap, reaction..."
              />
            </div>

            {/* 3. Liquidity */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4">
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                3. Liquidity Sweep / Draw on Liquidity
              </label>
              <select
                value={checkpoints.liquidity.status}
                onChange={(e) =>
                  handleCheckpointChange('liquidity', 'status', e.target.value)
                }
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-500 mb-2.5"
              >
                <option value="Buy-Side Liquidity (BSL) Swept">Buy-Side Liquidity (BSL) Swept</option>
                <option value="Sell-Side Liquidity (SSL) Swept">Sell-Side Liquidity (SSL) Swept</option>
                <option value="Internal Liquidity Taken">Internal Range Liquidity Taken</option>
                <option value="Equal Highs (EQH) Swept">Equal Highs (EQH) Swept</option>
                <option value="Equal Lows (EQL) Swept">Equal Lows (EQL) Swept</option>
                <option value="None">None</option>
              </select>
              <textarea
                value={checkpoints.liquidity.notes}
                onChange={(e) =>
                  handleCheckpointChange('liquidity', 'notes', e.target.value)
                }
                rows={2}
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded-lg p-2.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                placeholder="Session high/low purged, previous day high/low, wick rejection..."
              />
            </div>

            {/* 4. Inverse Fair Value Gap (IFVG) */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4">
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                4. Inverse Fair Value Gap (IFVG)
              </label>
              <select
                value={checkpoints.inverseFairValueGap.status}
                onChange={(e) =>
                  handleCheckpointChange('inverseFairValueGap', 'status', e.target.value)
                }
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-500 mb-2.5"
              >
                <option value="Confirmed Bullish IFVG">Confirmed Bullish IFVG</option>
                <option value="Confirmed Bearish IFVG">Confirmed Bearish IFVG</option>
                <option value="Failed IFVG">Failed IFVG</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
              <textarea
                value={checkpoints.inverseFairValueGap.notes}
                onChange={(e) =>
                  handleCheckpointChange('inverseFairValueGap', 'notes', e.target.value)
                }
                rows={2}
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded-lg p-2.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                placeholder="Inversion confirmation, close through opposing gap, retest support..."
              />
            </div>

            {/* 5. Entry Quality */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4">
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                5. Entry Quality (Execution Grade)
              </label>
              <select
                value={checkpoints.entryQuality.rating}
                onChange={(e) =>
                  handleCheckpointChange('entryQuality', 'rating', e.target.value)
                }
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-500 mb-2.5"
              >
                <option value="A+">A+ (Perfect Model Alignment & Time/Price)</option>
                <option value="A">A (High Quality Standard Setup)</option>
                <option value="B">B (Acceptable / Minor Confluence Missing)</option>
                <option value="C">C (Low Quality / Forced Execution)</option>
              </select>
              <textarea
                value={checkpoints.entryQuality.notes}
                onChange={(e) =>
                  handleCheckpointChange('entryQuality', 'notes', e.target.value)
                }
                rows={2}
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded-lg p-2.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                placeholder="Checklist compliance, discipline, spread/slippage, execution timing..."
              />
            </div>

            {/* 6. Confidence Level */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4">
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                6. Confidence Level
              </label>
              <select
                value={checkpoints.confidenceLevel.level}
                onChange={(e) =>
                  handleCheckpointChange('confidenceLevel', 'level', e.target.value)
                }
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-500 mb-2.5"
              >
                <option value="High (8-10)">High Conviction (8-10)</option>
                <option value="Medium (5-7)">Medium Conviction (5-7)</option>
                <option value="Low (1-4)">Low Conviction (1-4)</option>
              </select>
              <textarea
                value={checkpoints.confidenceLevel.notes}
                onChange={(e) =>
                  handleCheckpointChange('confidenceLevel', 'notes', e.target.value)
                }
                rows={2}
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded-lg p-2.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                placeholder="Psychological state, emotional discipline, macro news bias conviction..."
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: SCREENSHOT UPLOAD & GENERAL NOTES */}
        <div className="pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ImageIcon className="w-4 h-4" />
            <span>5. Trade Screenshot & General Notes</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Screenshot Upload Dropzone */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Trade Chart Screenshot (PNG, JPG, WebP)
              </label>

              {screenshot ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 group bg-slate-900">
                  <img
                    src={screenshot}
                    alt="Trade Execution Screenshot"
                    className="w-full h-52 object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg border border-slate-600 transition-colors"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setScreenshot(undefined)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#0e1626]/40 hover:bg-[#0e1626]/80"
                >
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  <p className="text-sm font-medium text-slate-300">
                    Click or drag & drop trade chart
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports high-resolution screenshots (compressed automatically)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* General Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                General Trade Narrative & Post-Execution Review
              </label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                rows={8}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-xl p-3.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 resize-none"
                placeholder="What went well? Did you manage the trade according to your rules? Any emotional triggers or lessons learned?..."
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold shadow-lg shadow-cyan-950 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEditing ? 'Update Trade Record' : 'Record Trade'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
