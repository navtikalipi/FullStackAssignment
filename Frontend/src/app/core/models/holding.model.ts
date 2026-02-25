export interface Holding {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  investmentAmount: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  status: string; // PROFIT, LOSS, NEUTRAL
}
