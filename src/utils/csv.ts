import { Trade } from '../types/trade';

export function exportTradesToCSV(trades: Trade[]): void {
  if (trades.length === 0) return;

  const headers = [
    'Serial Number',
    'Date',
    'Execution Time',
    'Instrument',
    'Session',
    'Direction',
    'Entry Price',
    'Take Profit',
    'Stop Loss',
    'Planned RR',
    'Exit Price',
    'Position Size',
    'Risk Amount ($)',
    'Realized PnL ($)',
    'Realized RR',
    'Outcome',
    'Market Structure',
    'Market Structure Notes',
    'Fair Value Gap',
    'FVG Notes',
    'Liquidity',
    'Liquidity Notes',
    'Inverse FVG',
    'Inverse FVG Notes',
    'Entry Quality',
    'Entry Quality Notes',
    'Confidence Level',
    'Confidence Notes',
    'General Notes'
  ];

  const escapeCSV = (str: string | number | undefined) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = trades.map(t => [
    escapeCSV(t.serialNumber),
    escapeCSV(t.date),
    escapeCSV(t.executionTime),
    escapeCSV(t.instrument),
    escapeCSV(t.session),
    escapeCSV(t.direction),
    escapeCSV(t.entryPrice),
    escapeCSV(t.takeProfit),
    escapeCSV(t.stopLoss),
    escapeCSV(t.plannedRR),
    escapeCSV(t.exitPrice ?? ''),
    escapeCSV(t.positionSize ?? ''),
    escapeCSV(t.riskAmount ?? ''),
    escapeCSV(t.realizedPnL),
    escapeCSV(t.realizedRR ?? ''),
    escapeCSV(t.outcome),
    escapeCSV(t.checkpoints.marketStructure.status),
    escapeCSV(t.checkpoints.marketStructure.notes),
    escapeCSV(t.checkpoints.fairValueGap.status),
    escapeCSV(t.checkpoints.fairValueGap.notes),
    escapeCSV(t.checkpoints.liquidity.status),
    escapeCSV(t.checkpoints.liquidity.notes),
    escapeCSV(t.checkpoints.inverseFairValueGap.status),
    escapeCSV(t.checkpoints.inverseFairValueGap.notes),
    escapeCSV(t.checkpoints.entryQuality.rating),
    escapeCSV(t.checkpoints.entryQuality.notes),
    escapeCSV(t.checkpoints.confidenceLevel.level),
    escapeCSV(t.checkpoints.confidenceLevel.notes),
    escapeCSV(t.generalNotes ?? '')
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `apexedge_trades_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
