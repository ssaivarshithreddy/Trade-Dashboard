export type TradeOutcome = 'Win' | 'Loss' | 'Break-even';
export type TradeDirection = 'Long' | 'Short';
export type TradingSession = 'London' | 'New York AM' | 'New York PM' | 'Asian' | 'Pre-Market' | 'After-Hours';

export type MarketStructureStatus = 
  | 'Bullish BOS' 
  | 'Bearish BOS' 
  | 'Bullish MSS' 
  | 'Bearish MSS' 
  | 'Range / Consolidation' 
  | 'Neutral';

export type FVGStatus = 
  | 'Bullish FVG' 
  | 'Bearish FVG' 
  | 'Balanced Price Range (BPR)' 
  | 'Volume Imbalance' 
  | 'None';

export type LiquidityStatus = 
  | 'Buy-Side Liquidity (BSL) Swept' 
  | 'Sell-Side Liquidity (SSL) Swept' 
  | 'Internal Liquidity Taken' 
  | 'Equal Highs (EQH) Swept' 
  | 'Equal Lows (EQL) Swept' 
  | 'None';

export type IFVGStatus = 
  | 'Confirmed Bullish IFVG' 
  | 'Confirmed Bearish IFVG' 
  | 'Failed IFVG' 
  | 'Not Applicable';

export type EntryQualityRating = 'A+' | 'A' | 'B' | 'C';

export type ConfidenceLevel = 'High (8-10)' | 'Medium (5-7)' | 'Low (1-4)';

export interface TechnicalCheckpoints {
  marketStructure: {
    status: MarketStructureStatus;
    notes: string;
  };
  fairValueGap: {
    status: FVGStatus;
    notes: string;
  };
  liquidity: {
    status: LiquidityStatus;
    notes: string;
  };
  inverseFairValueGap: {
    status: IFVGStatus;
    notes: string;
  };
  entryQuality: {
    rating: EntryQualityRating;
    notes: string;
  };
  confidenceLevel: {
    level: ConfidenceLevel;
    notes: string;
  };
}

export interface Trade {
  id: string;
  serialNumber: string;
  date: string; // YYYY-MM-DD
  instrument: string; // e.g. EUR/USD, NQ, ES, BTC/USD, AAPL
  session: TradingSession;
  executionTime: string; // HH:MM
  direction: TradeDirection;
  entryPrice: number;
  takeProfit: number;
  stopLoss: number;
  plannedRR: number; // |TP - Entry| / |Entry - SL|
  exitPrice?: number;
  positionSize?: number;
  riskAmount?: number; // In $
  realizedPnL: number; // Realized P&L in $ (+ for win, - for loss, 0 for BE)
  realizedRR?: number; // Realized R-Multiple
  outcome: TradeOutcome;
  screenshot?: string; // Data URL or base64
  generalNotes?: string;
  checkpoints: TechnicalCheckpoints;
  createdAt: number;
  updatedAt: number;
}

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number; // 0 - 100%
  lossRate: number; // 0 - 100%
  netPnL: number; // $
  grossProfit: number; // $
  grossLoss: number; // $
  profitFactor: number;
  maxDrawdown: number; // $ (peak-to-trough drop)
  maxDrawdownPercent: number; // %
  averageRR: number; // Mean planned or realized RR
  averageWin: number;
  averageLoss: number;
  expectancy: number; // Net expected profit per trade
  bestTrade: number;
  worstTrade: number;
}

export interface TradeFilterCriteria {
  searchQuery: string;
  dateFrom: string;
  dateTo: string;
  instrument: string;
  session: string;
  outcome: string;
  direction: string;
  marketStructure: string;
  fvg: string;
  entryQuality: string;
  confidence: string;
}
