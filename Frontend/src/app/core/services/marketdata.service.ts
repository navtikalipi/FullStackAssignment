import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiHttpClient } from '../api/http-client';
import { ENDPOINTS } from '../api/endpoints';
import { MarketStock } from '../models/stock.model';

@Injectable({ providedIn: 'root' })
export class MarketDataService {

  constructor(private api: ApiHttpClient) {}

  getAllStocks(): Observable<MarketStock[]> {
    return this.api.get<Map<string, number>>(ENDPOINTS.MARKET_STOCKS).pipe(
      map((payload) => {
        if (!payload) {
          return [];
        }

        return Object.entries(payload).map(([symbol, price]) => this.toMarketStock({
          symbol,
          name: symbol,
          price
        }));
      })
    );
  }

  getStockPrice(symbol: string): Observable<MarketStock> {
    return this.api.get<{ symbol: string; name: string; price: number }>(ENDPOINTS.MARKET_PRICE(symbol)).pipe(
      map((payload) => this.toMarketStock(payload))
    );
  }

  getTopGainers(): Observable<MarketStock[]> {
    return this.api.get<MarketStock[]>(`${ENDPOINTS.MARKET_STOCKS}/gainers`);
  }

  getTopLosers(): Observable<MarketStock[]> {
    return this.api.get<MarketStock[]>(`${ENDPOINTS.MARKET_STOCKS}/losers`);
  }

  searchStocks(query: string): Observable<MarketStock[]> {
    return this.api.get<MarketStock[]>(`${ENDPOINTS.MARKET_STOCKS}/search?q=${query}`);
  }

  private toMarketStock(payload: { symbol?: string; name?: string; price?: number }): MarketStock {
    const currentPrice = Number(payload.price ?? 0);
    return {
      symbol: (payload.symbol || '').toUpperCase(),
      companyName: payload.name || payload.symbol || 'Unknown',
      currentPrice,
      previousClose: currentPrice,
      change: 0,
      changePercent: 0,
      dayHigh: currentPrice,
      dayLow: currentPrice,
      volume: 0,
      marketCap: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}
