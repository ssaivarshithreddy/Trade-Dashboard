import Dexie, { Table } from 'dexie';
import { Trade } from '../types/trade';

export class TradeJournalDB extends Dexie {
  trades!: Table<Trade, string>;

  constructor() {
    super('ApexEdgeTradingDB');
    this.version(1).stores({
      trades: 'id, serialNumber, date, instrument, session, outcome, direction, createdAt'
    });
  }
}

export const db = new TradeJournalDB();

const STORAGE_KEY = 'apexedge_trades_backup';

// Fallback to localStorage if IndexedDB is not supported or errors out
export const storageService = {
  async getAllTrades(): Promise<Trade[]> {
    try {
      const records = await db.trades.toArray();
      if (records && records.length > 0) {
        return records.sort((a, b) => b.createdAt - a.createdAt);
      }
      // Check localStorage backup
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        return parsed.sort((a: Trade, b: Trade) => b.createdAt - a.createdAt);
      }
      return [];
    } catch (err) {
      console.warn('IndexedDB unavailable, using localStorage fallback', err);
      const localData = localStorage.getItem(STORAGE_KEY);
      return localData ? JSON.parse(localData) : [];
    }
  },

  async addTrade(trade: Trade): Promise<string> {
    try {
      await db.trades.add(trade);
    } catch (err) {
      console.warn('IndexedDB add error, falling back to localStorage', err);
    }
    // Backup to localStorage
    const trades = await this.getAllTrades();
    if (!trades.some(t => t.id === trade.id)) {
      trades.unshift(trade);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    }
    return trade.id;
  },

  async updateTrade(trade: Trade): Promise<void> {
    try {
      await db.trades.put(trade);
    } catch (err) {
      console.warn('IndexedDB update error', err);
    }
    const trades = await this.getAllTrades();
    const index = trades.findIndex(t => t.id === trade.id);
    if (index !== -1) {
      trades[index] = trade;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    }
  },

  async deleteTrade(id: string): Promise<void> {
    try {
      await db.trades.delete(id);
    } catch (err) {
      console.warn('IndexedDB delete error', err);
    }
    const trades = await this.getAllTrades();
    const filtered = trades.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  async clearAllTrades(): Promise<void> {
    try {
      await db.trades.clear();
    } catch (err) {
      console.warn('IndexedDB clear error', err);
    }
    localStorage.removeItem(STORAGE_KEY);
  },

  async bulkAddTrades(newTrades: Trade[]): Promise<void> {
    try {
      await db.trades.bulkPut(newTrades);
    } catch (err) {
      console.warn('IndexedDB bulkAdd error', err);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTrades));
  },

  async getNextSerialNumber(): Promise<string> {
    const trades = await this.getAllTrades();
    const count = trades.length + 1;
    return `#TRD-${String(count).padStart(3, '0')}`;
  }
};
