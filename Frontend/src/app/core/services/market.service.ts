import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, StockPrice, StockInfo } from '../models';

@Injectable({ providedIn: 'root' })
export class MarketService {
  private apiUrl = `${environment.apiUrl}/market`;

  constructor(private http: HttpClient) {}

  getStockPrice(symbol: string): Observable<ApiResponse<StockPrice>> {
    return this.http.get<ApiResponse<StockPrice>>(`${this.apiUrl}/price/${symbol}`);
  }

  getStockInfo(symbol: string): Observable<ApiResponse<StockInfo>> {
    return this.http.get<ApiResponse<StockInfo>>(`${this.apiUrl}/info/${symbol}`);
  }
}
