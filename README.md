# ApexEdge — Trading Journal & Performance Analytics Dashboard

A modern, institutional-grade trading terminal application built for active discretionary and quantitative traders to manually record trades, document Smart Money Concepts (SMC) technical checkpoints, upload trade screenshots, and analyze trading performance through interactive charts and reports.

---

## 1. Specification: Profit Calculation Inputs & Formulas

In this dashboard, profit calculation is designed to accommodate various asset classes (Forex, Indices/Futures, Crypto, Equities) with zero ambiguity:

### Input Parameters:
1. **Trade Direction**: `Long` or `Short`
2. **Entry Price**: Numerical price at execution
3. **Take Profit (TP)**: Planned profit target level
4. **Stop Loss (SL)**: Defined risk invalidation level
5. **Planned Risk-to-Reward Ratio (Planned R:R)**: Automatically calculated live:
   $$\text{Planned R:R} = \frac{|\text{Take Profit} - \text{Entry Price}|}{|\text{Entry Price} - \text{Stop Loss}|}$$
6. **Execution Outcome Modes**:
   - **Direct Realized P&L ($)**: Traders can directly enter net profit/loss (e.g. `+$1,250.00`, `-$400.00`, `$0.00`).
   - **Exit Price & Position Size Mode**: Auto-computes net P&L based on:
     - For Long: $\text{Realized P&L} = (\text{Exit Price} - \text{Entry Price}) \times \text{Position Size}$
     - For Short: $\text{Realized P&L} = (\text{Entry Price} - \text{Exit Price}) \times \text{Position Size}$
7. **Realized R-Multiple**:
   $$\text{Realized R} = \frac{\text{Realized P&L}}{\text{Risk Amount (\$)}} \quad \text{or} \quad \frac{\text{Exit} - \text{Entry}}{\text{Entry} - \text{SL}}$$
8. **Trade Outcome**: `Win` ($\text{P&L} > 0$), `Loss` ($\text{P&L} < 0$), or `Break-even` ($\text{P&L} = 0$).

---

## 2. Specification: Application Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **React 19 + TypeScript + Vite 6** | Modern component architecture, strict type-safety, instant Hot Module Replacement (HMR), sub-second bundling. |
| **Styling** | **Tailwind CSS (Dark Trading Terminal)** | Custom trading palette (`#070B14`, `#0B0F19`, `#111827`, `#10B981` Emerald, `#F43F5E` Rose, `#38BDF8` Cyan) styled for low eye strain. |
| **Data Visualization** | **Chart.js + react-chartjs-2** | Responsive HTML5 canvas-rendered financial charts with dark tooltips, gradients, and crosshair responsiveness. |
| **Persistence** | **Dexie.js (IndexedDB) + LocalStorage Fallback** | Secure client-side database supporting high-resolution chart screenshots without the 5MB browser LocalStorage quota limit. |
| **Icons** | **Lucide React** | Crisp, lightweight SVG vector iconography for trading metrics and navigation. |
| **Export Engine** | **Native CSV Serialization** | One-click export of full trade logs, price levels, R:R, and SMC checkpoint notes to CSV format. |

---

## 3. Core Features & Capabilities

### 1. Manual Trade Entry Form
- Auto-generated serial numbers (e.g., `#TRD-001`, `#TRD-002`).
- Date & execution time pickers.
- Quick asset chips (NQ 100, ES 500, EUR/USD, GBP/USD, BTC/USD, XAU/USD).
- Session tags (London, New York AM, New York PM, Asian, Pre-Market, After-Hours).
- Direction selection (`Long` vs `Short`).
- Real-time planned R:R calculation.
- Live price boundary validation (e.g. SL above Entry for shorts, below Entry for longs).
- Chart screenshot upload with automatic client-side canvas compression.

### 2. Technical Analysis Checkpoints (SMC / Institutional Framework)
Every trade records dedicated fields and comprehensive notes for:
- **Market Structure**: Bullish/Bearish MSS, Bullish/Bearish BOS, Range/Consolidation, Neutral.
- **Fair Value Gap (FVG)**: Bullish FVG, Bearish FVG, Balanced Price Range (BPR), Volume Imbalance, None.
- **Liquidity**: Buy-Side Liquidity (BSL) Swept, Sell-Side Liquidity (SSL) Swept, Internal Range Liquidity, Equal Highs/Lows, None.
- **Inverse Fair Value Gap (IFVG)**: Confirmed Bullish IFVG, Confirmed Bearish IFVG, Failed IFVG, N/A.
- **Entry Quality Grade**: A+ (Flawless), A (Standard setup), B (Moderate), C (Forced execution).
- **Confidence Level**: High (8-10), Medium (5-7), Low (1-4).

### 3. Dashboard Overview & Performance Metrics
Zero hardcoded stats. Every KPI is computed dynamically:
- **Total Trades**, **Winning Trades**, **Losing Trades**, **Break-even Trades**
- **Win Rate (%)** & **Loss Rate (%)** with progress bars
- **Net Profit & Loss ($)**
- **Maximum Drawdown ($ and %)**
- **Average Planned Risk-to-Reward Ratio**
- **Profit Factor** ($\text{Gross Profit} / \text{Gross Loss}$)
- **Directional Edge**: Separate Long vs Short win rates and P&L
- **Trade Expectancy**: Expected mathematical return per trade execution

### 4. Visual Analytics
- **Equity Curve**: Chronological cumulative P&L area chart.
- **Underwater Drawdown Chart**: Peak-to-trough drawdown depth.
- **Outcome Distribution**: Donut chart with centered win rate percentage.
- **Session Performance**: Comparative bar chart of P&L and win rate by session.
- **Instrument Performance**: P&L ranked by asset.
- **Monthly Performance**: P&L aggregated by calendar month.
- **Checkpoint Performance**: Statistical win rate broken down by Market Structure, FVG, Liquidity sweeps, and Entry Quality grades.
- **Confidence vs Performance**: Win rate and average payoff across confidence tiers.

### 5. Trade Journal
- Search across instruments, serial numbers, trade narratives, and SMC notes.
- Multi-criteria filtering by Date range, Instrument, Session, Outcome, Direction, and Checkpoints.
- Sortable table columns with visual thumbnails of screenshots.
- Full-screen trade detail modal with high-res screenshot lightbox.
- CSV export for spreadsheets.

---

## 4. Running the Application Locally

```bash
# 1. Install dependencies (already completed)
npm install

# 2. Start the local development server
npm run dev

# 3. Build for production
npm run build
```

Once running, navigate to `http://localhost:3000` (or the port indicated by Vite). You can start recording trades manually or click **"Load Demo Data"** to immediately test all analytics with 10 realistic SMC trades.
