import { Trade, PerformanceMetrics } from '../types/trade';

/**
 * Calculates planned Risk-to-Reward Ratio from Entry, TP, and SL.
 */
export function calculatePlannedRR(
  entryPrice: number,
  takeProfit: number,
  stopLoss: number,
  direction: 'Long' | 'Short' = 'Long'
): number {
  if (!entryPrice || !takeProfit || !stopLoss) return 0;
  
  let risk = 0;
  let reward = 0;

  if (direction === 'Long') {
    risk = entryPrice - stopLoss;
    reward = takeProfit - entryPrice;
  } else {
    risk = stopLoss - entryPrice;
    reward = entryPrice - takeProfit;
  }

  // Handle potential negative distances if user hasn't finished typing or placed SL wrong
  if (risk <= 0 || reward <= 0) {
    // Fallback to absolute difference if direction isn't strictly aligned yet
    const absRisk = Math.abs(entryPrice - stopLoss);
    const absReward = Math.abs(takeProfit - entryPrice);
    if (absRisk === 0) return 0;
    return Number((absReward / absRisk).toFixed(2));
  }

  return Number((reward / risk).toFixed(2));
}

/**
 * Validates whether SL & TP prices are valid for the selected direction.
 */
export function validateTradePrices(
  entryPrice: number,
  takeProfit: number,
  stopLoss: number,
  direction: 'Long' | 'Short'
): { isValid: boolean; error?: string } {
  if (direction === 'Long') {
    if (stopLoss >= entryPrice) {
      return { isValid: false, error: 'For a Long trade, Stop Loss must be below Entry Price.' };
    }
    if (takeProfit <= entryPrice) {
      return { isValid: false, error: 'For a Long trade, Take Profit must be above Entry Price.' };
    }
  } else {
    if (stopLoss <= entryPrice) {
      return { isValid: false, error: 'For a Short trade, Stop Loss must be above Entry Price.' };
    }
    if (takeProfit >= entryPrice) {
      return { isValid: false, error: 'For a Short trade, Take Profit must be below Entry Price.' };
    }
  }
  return { isValid: true };
}

/**
 * Calculates comprehensive trading performance metrics from a collection of trades.
 */
export function calculatePerformanceMetrics(trades: Trade[]): PerformanceMetrics {
  const totalTrades = trades.length;

  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0,
      winRate: 0,
      lossRate: 0,
      netPnL: 0,
      grossProfit: 0,
      grossLoss: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      averageRR: 0,
      averageWin: 0,
      averageLoss: 0,
      expectancy: 0,
      bestTrade: 0,
      worstTrade: 0,
    };
  }

  let winningTrades = 0;
  let losingTrades = 0;
  let breakEvenTrades = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let netPnL = 0;
  let totalRR = 0;
  let validRRCount = 0;
  let bestTrade = -Infinity;
  let worstTrade = Infinity;

  // Chronologically sort trades for equity curve and drawdown analysis
  const sortedTrades = [...trades].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.executionTime || '00:00'}`).getTime();
    const timeB = new Date(`${b.date}T${b.executionTime || '00:00'}`).getTime();
    return timeA - timeB;
  });

  let runningEquity = 0;
  let peakEquity = 0;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;

  for (const trade of sortedTrades) {
    const pnl = trade.realizedPnL || 0;
    netPnL += pnl;
    runningEquity += pnl;

    if (pnl > 0 || trade.outcome === 'Win') {
      winningTrades++;
      grossProfit += Math.max(0, pnl);
    } else if (pnl < 0 || trade.outcome === 'Loss') {
      losingTrades++;
      grossLoss += Math.abs(Math.min(0, pnl));
    } else {
      breakEvenTrades++;
    }

    if (pnl > bestTrade) bestTrade = pnl;
    if (pnl < worstTrade) worstTrade = pnl;

    if (trade.plannedRR && trade.plannedRR > 0) {
      totalRR += trade.plannedRR;
      validRRCount++;
    }

    // Drawdown Calculation
    if (runningEquity > peakEquity) {
      peakEquity = runningEquity;
    }
    const currentDrawdown = peakEquity - runningEquity;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
      const base = peakEquity > 0 ? peakEquity : 10000; // Baseline reference
      maxDrawdownPercent = (maxDrawdown / base) * 100;
    }
  }

  const winRate = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;
  const lossRate = totalTrades > 0 ? Number(((losingTrades / totalTrades) * 100).toFixed(1)) : 0;
  
  let profitFactor = 0;
  if (grossLoss === 0) {
    profitFactor = grossProfit > 0 ? 99.99 : 0;
  } else {
    profitFactor = Number((grossProfit / grossLoss).toFixed(2));
  }

  const averageRR = validRRCount > 0 ? Number((totalRR / validRRCount).toFixed(2)) : 0;
  const averageWin = winningTrades > 0 ? Number((grossProfit / winningTrades).toFixed(2)) : 0;
  const averageLoss = losingTrades > 0 ? Number((grossLoss / losingTrades).toFixed(2)) : 0;

  // Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss)
  const expectancy = Number(
    ((winRate / 100) * averageWin - (lossRate / 100) * averageLoss).toFixed(2)
  );

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    breakEvenTrades,
    winRate,
    lossRate,
    netPnL: Number(netPnL.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    grossLoss: Number(grossLoss.toFixed(2)),
    profitFactor,
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(1)),
    averageRR,
    averageWin,
    averageLoss,
    expectancy,
    bestTrade: bestTrade === -Infinity ? 0 : Number(bestTrade.toFixed(2)),
    worstTrade: worstTrade === Infinity ? 0 : Number(worstTrade.toFixed(2)),
  };
}

/**
 * Format currency with sign, e.g. +$1,250.00 or -$340.50
 */
export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return `$0.00`;
}
