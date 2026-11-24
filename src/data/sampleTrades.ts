import { Trade } from '../types/trade';

export const sampleTrades: Trade[] = [
  {
    id: 'trd-101',
    serialNumber: '#TRD-001',
    date: '2026-10-02',
    instrument: 'NQ 100',
    session: 'New York AM',
    executionTime: '09:45',
    direction: 'Long',
    entryPrice: 20450.00,
    takeProfit: 20560.00,
    stopLoss: 20410.00,
    plannedRR: 2.75,
    exitPrice: 20560.00,
    positionSize: 2,
    riskAmount: 400.00,
    realizedPnL: 1100.00,
    realizedRR: 2.75,
    outcome: 'Win',
    generalNotes: 'Clean 15m liquidity sweep of London high during 9:30 open, followed by strong 1m displacement up through previous day high.',
    checkpoints: {
      marketStructure: {
        status: 'Bullish MSS',
        notes: 'Clear market structure shift with energetic displacement candle breaking internal swing high.'
      },
      fairValueGap: {
        status: 'Bullish FVG',
        notes: 'Consequent encroachment (50%) of the 5-minute FVG tapped precisely before expansion.'
      },
      liquidity: {
        status: 'Sell-Side Liquidity (SSL) Swept',
        notes: 'Opening drive swept Asia low SSL before reversing violently.'
      },
      inverseFairValueGap: {
        status: 'Confirmed Bullish IFVG',
        notes: 'Inversion of previous 15m bearish gap gave heavy institutional sponsorship.'
      },
      entryQuality: {
        rating: 'A+',
        notes: 'Met all model criteria: Time & Price, HTF bias, liquidity purge, and low-risk entry.'
      },
      confidenceLevel: {
        level: 'High (8-10)',
        notes: 'High conviction trade during the 09:50-10:10 Silver Bullet window.'
      }
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 30
  },
  {
    id: 'trd-102',
    serialNumber: '#TRD-002',
    date: '2026-10-05',
    instrument: 'EUR/USD',
    session: 'London',
    executionTime: '03:15',
    direction: 'Short',
    entryPrice: 1.0880,
    takeProfit: 1.0825,
    stopLoss: 1.0900,
    plannedRR: 2.75,
    exitPrice: 1.0825,
    positionSize: 5,
    riskAmount: 500.00,
    realizedPnL: 1375.00,
    realizedRR: 2.75,
    outcome: 'Win',
    generalNotes: 'Judas swing during London open took Asian session high. Immediate market structure shift lower on 5m.',
    checkpoints: {
      marketStructure: {
        status: 'Bearish BOS',
        notes: 'Break of structure lower confirmed trend continuation on 1H timeframe.'
      },
      fairValueGap: {
        status: 'Bearish FVG',
        notes: 'Re-entry into 15m Bearish FVG with institutional order flow.'
      },
      liquidity: {
        status: 'Buy-Side Liquidity (BSL) Swept',
        notes: 'Asian High BSL purged by 12 pips then immediate close back inside range.'
      },
      inverseFairValueGap: {
        status: 'Not Applicable',
        notes: 'Standard FVG retest, no IFVG required.'
      },
      entryQuality: {
        rating: 'A',
        notes: 'Tight stop above London high, targeted previous day low.'
      },
      confidenceLevel: {
        level: 'High (8-10)',
        notes: 'DXY showed strong bullish displacement confirming EUR weakness.'
      }
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 27,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 27
  },
  {
    id: 'trd-103',
    serialNumber: '#TRD-003',
    date: '2026-10-09',
    instrument: 'ES 500',
    session: 'New York PM',
    executionTime: '14:20',
    direction: 'Long',
    entryPrice: 5740.25,
    takeProfit: 5762.50,
    stopLoss: 5732.00,
    plannedRR: 2.70,
    exitPrice: 5732.00,
    positionSize: 2,
    riskAmount: 412.50,
    realizedPnL: -412.50,
    realizedRR: -1.00,
    outcome: 'Loss',
    generalNotes: 'Fed speaker commentary induced choppy price action. Stopped out before continuation higher.',
    checkpoints: {
      marketStructure: {
        status: 'Bullish BOS',
        notes: 'Appeared to be bullish BOS, but lacked sufficient displacement volume.'
      },
      fairValueGap: {
        status: 'Bullish FVG',
        notes: 'Entered on 3m FVG, but gap failed to hold.'
      },
      liquidity: {
        status: 'Internal Liquidity Taken',
        notes: 'Took minor internal liquidity, but major external low remained unpurged.'
      },
      inverseFairValueGap: {
        status: 'Failed IFVG',
        notes: 'The gap closed completely through without support.'
      },
      entryQuality: {
        rating: 'C',
        notes: 'Forced entry during high-volatility speaker event. Bad timing.'
      },
      confidenceLevel: {
        level: 'Low (1-4)',
        notes: 'Hesitant about macro sentiment, risk was taken anyway.'
      }
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 23,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 23
  },
  {
    id: 'trd-104',
    serialNumber: '#TRD-004',
    date: '2026-10-14',
    instrument: 'GBP/USD',
    session: 'London',
    executionTime: '03:45',
    direction: 'Long',
    entryPrice: 1.3040,
    takeProfit: 1.3120,
    stopLoss: 1.3015,
    plannedRR: 3.20,
    exitPrice: 1.3120,
    positionSize: 4,
    riskAmount: 500.00,
    realizedPnL: 1600.00,
    realizedRR: 3.20,
    outcome: 'Win',
    generalNotes: 'SMT divergence between GBP and EUR at 03:00 London open. Cable made a lower low while Fiber held high.',
    checkpoints: {
      marketStructure: {
        status: 'Bullish MSS',
        notes: 'Aggressive 5m MSS with displacement candle breaking previous 4H swing high.'
      },
      fairValueGap: {
        status: 'Bullish FVG',
        notes: 'Optimal trade entry into 62% fib retracement aligned with 15m FVG.'
      },
      liquidity: {
        status: 'Equal Lows (EQL) Swept',
        notes: 'Clear double bottoms purged with long wick rejection.'
      },
      inverseFairValueGap: {
        status: 'Confirmed Bullish IFVG',
        notes: 'Previous resistance FVG turned into support.'
      },
      entryQuality: {
        rating: 'A+',
        notes: 'Textbook ICT SMT setup at London killzone.'
      },
      confidenceLevel: {
        level: 'High (8-10)',
        notes: 'Very high conviction with confluence across 3 timeframes.'
      }
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 18
  },
  {
    id: 'trd-105',
    serialNumber: '#TRD-005',
    date: '2026-10-18',
    instrument: 'BTC/USD',
    session: 'Asian',
    executionTime: '21:15',
    direction: 'Long',
    entryPrice: 67200.00,
    takeProfit: 68800.00,
    stopLoss: 66700.00,
    plannedRR: 3.20,
    exitPrice: 67200.00,
    positionSize: 0.5,
    riskAmount: 250.00,
    realizedPnL: 0.00,
    realizedRR: 0.00,
    outcome: 'Break-even',
    generalNotes: 'Pushed up +1.8R, moved stop loss to break-even per trade plan. Weekend range expansion collapsed back to entry.',
    checkpoints: {
      marketStructure: {
        status: 'Bullish BOS',
        notes: 'Consolidation breakout on 1H chart.'
      },
      fairValueGap: {
        status: 'Bullish FVG',
        notes: 'Respecting 4H imbalance zone.'
      },
      liquidity: {
        status: 'Internal Liquidity Taken',
        notes: 'Sweep of internal liquidity inside weekly range.'
      },
      inverseFairValueGap: {
        status: 'Not Applicable',
        notes: 'Direct breakout retest.'
      },
      entryQuality: {
        rating: 'B',
        notes: 'Weekend liquidity was lower than standard weekday sessions.'
      },
      confidenceLevel: {
        level: 'Medium (5-7)',
        notes: 'Moderate confidence due to low Sunday volume.'
      }
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 14
  },
  {
    id: 'trd-106',
    serialNumber: '#TRD-006',
    date: '2026-10-22',
    instrument: 'NQ 100',
    session: 'New York AM',
    executionTime: '10:05',
    direction: 'Short',
    entryPrice: 20680.00,
    takeProfit: 20520.00,
    stopLoss: 20730.00,
    plannedRR: 3.20,
    exitPrice: 20520.00,
    positionSize: 2,
    riskAmount: 500.00,
    realizedPnL: 1600.00,
    realizedRR: 3.20,
    outcome: 'Win',
    generalNotes: 'Silver bullet 10:00 AM NY model. Bought side purged into previous week high, immediate aggressive selling.',
    checkpoints: {
      marketStructure: {
        status: 'Bearish MSS',
        notes: 'Heavy institutional volume candle closed well below key 5m low.'
      },
      fairValueGap: {
        status: 'Bearish FVG',
        notes: '5-minute FVG acted as dynamic resistance.'
      },
      liquidity: {
        status: 'Buy-Side Liquidity (BSL) Swept',
        notes: 'Clean sweep of previous week high BSL.'
      },
      inverseFairValueGap: {
        status: 'Confirmed Bearish IFVG',
        notes: 'Morning run-up FVG turned into rejection block.'
      },
      entryQuality: {
        rating: 'A+',
        notes: 'Direct execution at top of the session.'
      },
      confidenceLevel: {
        level: 'High (8-10)',
        notes: 'Highest confidence setup of the week.'
      }
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 10
  },
  {
    id: 'trd-107',
    serialNumber: '#TRD-007',
    date: '2026-10-24',
    instrument: 'XAU/USD',
    session: 'London',
    executionTime: '04:10',
    direction: 'Long',
    entryPrice: 2735.50,
    takeProfit: 2755.00,
    stopLoss: 2728.00,
    plannedRR: 2.60,
    exitPrice: 2728.00,
    positionSize: 50,
    riskAmount: 375.00,
    realizedPnL: -375.00,
    realizedRR: -1.00,
    outcome: 'Loss',
    generalNotes: 'Gold spiked downwards on unexpected bond yield surge, invalidating the 15m order block.',
    checkpoints: {
      marketStructure: {
        status: 'Range / Consolidation',
        notes: 'Premature entry inside a tightening symmetrical triangle.'
      },
      fairValueGap: {
        status: 'Bullish FVG',
        notes: 'Small 1m FVG that had very little HTF backing.'
      },
      liquidity: {
        status: 'None',
        notes: 'Did not wait for major London liquidity purge before entering.'
      },
      inverseFairValueGap: {
        status: 'Failed IFVG',
        notes: 'Invalidated within 2 candles.'
      },
      entryQuality: {
        rating: 'C',
        notes: 'Chased price too early without confirmation.'
      },
      confidenceLevel: {
        level: 'Low (1-4)',
        notes: 'Impatience led to sub-optimal entry.'
      }
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 8
  },
  {
    id: 'trd-108',
    serialNumber: '#TRD-008',
    date: '2026-10-27',
    instrument: 'EUR/USD',
    session: 'New York AM',
    executionTime: '08:35',
    direction: 'Short',
    entryPrice: 1.0820,
    takeProfit: 1.0760,
    stopLoss: 1.0840,
    plannedRR: 3.00,
    exitPrice: 1.0760,
    positionSize: 6,
    riskAmount: 600.00,
    realizedPnL: 1800.00,
    realizedRR: 3.00,
    outcome: 'Win',
    generalNotes: 'Post-CPI release retracement into premium discount array. Reached external SSL target cleanly.',
    checkpoints: {
      marketStructure: {
        status: 'Bearish BOS',
        notes: 'Clear continuation lower following macro rate expectations.'
      },
      fairValueGap: {
        status: 'Bearish FVG',
        notes: '15m gap completely respected to the pip.'
      },
      liquidity: {
        status: 'Sell-Side Liquidity (SSL) Swept',
        notes: 'Weekly lows taken at target level.'
      },
      inverseFairValueGap: {
        status: 'Confirmed Bearish IFVG',
        notes: 'Bullish 5m candle imbalance closed and inverted.'
      },
      entryQuality: {
        rating: 'A',
        notes: 'Waited 5 mins after news print to enter on calm retest.'
      },
      confidenceLevel: {
        level: 'High (8-10)',
        notes: 'Clear macro trend and technical order block.'
      }
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5
  },
  {
    id: 'trd-109',
    serialNumber: '#TRD-009',
    date: '2026-10-29',
    instrument: 'NQ 100',
    session: 'New York PM',
    executionTime: '13:40',
    direction: 'Long',
    entryPrice: 20510.00,
    takeProfit: 20630.00,
    stopLoss: 20465.00,
    plannedRR: 2.67,
    exitPrice: 20630.00,
    positionSize: 2,
    riskAmount: 450.00,
    realizedPnL: 1200.00,
    realizedRR: 2.67,
    outcome: 'Win',
    generalNotes: 'Lunch hour consolidation swept equal lows at 13:30, giving afternoon leg higher to close gap.',
    checkpoints: {
      marketStructure: {
        status: 'Bullish MSS',
        notes: '13:35 candle broke 15m minor high with good momentum.'
      },
      fairValueGap: {
        status: 'Bullish FVG',
        notes: '15-minute bullish FVG aligned with previous day settlement.'
      },
      liquidity: {
        status: 'Equal Lows (EQL) Swept',
        notes: 'Lunch lows engineered and purged.'
      },
      inverseFairValueGap: {
        status: 'Confirmed Bullish IFVG',
        notes: 'Morning sell gap reclaimed as dynamic support.'
      },
      entryQuality: {
        rating: 'A',
        notes: 'Patience paid off waiting through noon lull.'
      },
      confidenceLevel: {
        level: 'High (8-10)',
        notes: 'Clean alignment between indices.'
      }
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3
  },
  {
    id: 'trd-110',
    serialNumber: '#TRD-010',
    date: '2026-10-31',
    instrument: 'BTC/USD',
    session: 'New York AM',
    executionTime: '10:30',
    direction: 'Short',
    entryPrice: 71200.00,
    takeProfit: 69400.00,
    stopLoss: 71800.00,
    plannedRR: 3.00,
    exitPrice: 71800.00,
    positionSize: 0.5,
    riskAmount: 300.00,
    realizedPnL: -300.00,
    realizedRR: -1.00,
    outcome: 'Loss',
    generalNotes: 'Attempted to short all-time high retest, but strong institutional spot buying blew past stop.',
    checkpoints: {
      marketStructure: {
        status: 'Range / Consolidation',
        notes: 'Falsely assumed upper range boundary would hold.'
      },
      fairValueGap: {
        status: 'Bearish FVG',
        notes: '1h gap was invalidated upon next candle open.'
      },
      liquidity: {
        status: 'Buy-Side Liquidity (BSL) Swept',
        notes: 'Swept BSL but did not reject, continued ascending.'
      },
      inverseFairValueGap: {
        status: 'Failed IFVG',
        notes: 'No inversion occurred.'
      },
      entryQuality: {
        rating: 'B',
        notes: 'Fighting HTF parabolic momentum.'
      },
      confidenceLevel: {
        level: 'Medium (5-7)',
        notes: 'Should have waited for 15m close below structure.'
      }
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1
  }
];
