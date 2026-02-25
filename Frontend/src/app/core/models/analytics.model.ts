export interface AnalyticsModel {
  pnl: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  high: number;
  low: number;
  volume?: number;
  marketCap?: number;
}
