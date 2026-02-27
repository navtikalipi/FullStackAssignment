import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, StockPrice, StockInfo, MarketDataPoint, ChartDataPoint } from '../models';

export interface StockListItem {
  symbol: string;
  name: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class MarketService {
  private apiUrl = `${environment.apiUrl}/market`;

  constructor(private http: HttpClient) {}

  getAllStocks(): Observable<ApiResponse<StockListItem[]>> {
    return this.http.get<ApiResponse<StockListItem[]>>(`${this.apiUrl}/stocks`);
  }

  searchStocks(query: string): Observable<ApiResponse<StockListItem[]>> {
    return this.http.get<ApiResponse<StockListItem[]>>(`${this.apiUrl}/search?query=${query}`);
  }

  getStockPrice(symbol: string): Observable<ApiResponse<StockPrice>> {
    return this.http.get<ApiResponse<StockPrice>>(`${this.apiUrl}/price/${symbol}`);
  }

  getStockInfo(symbol: string): Observable<ApiResponse<StockInfo>> {
    return this.http.get<ApiResponse<StockInfo>>(`${this.apiUrl}/info/${symbol}`);
  }

  getStockHistory(symbol: string, limit: number = 60): Observable<ApiResponse<MarketDataPoint[]>> {
    return this.http.get<ApiResponse<MarketDataPoint[]>>(`${this.apiUrl}/history/${symbol}?limit=${limit}`);
  }

  getChartData(symbol: string, limit: number = 60): Observable<ApiResponse<ChartDataPoint[]>> {
    return this.http.get<ApiResponse<ChartDataPoint[]>>(`${this.apiUrl}/chart/${symbol}?limit=${limit}`);
  }
}
