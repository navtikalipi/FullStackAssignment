import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, DashboardData, TotalInvestment, CurrentValue,
  TotalGain, PnLData, WinRateData, ReturnsData, PortfolioSummary
} from '../models';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = `${environment.apiUrl}/portfolio`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(`${this.apiUrl}/dashboard`);
  }

  getTotalInvestment(): Observable<ApiResponse<TotalInvestment>> {
    return this.http.get<ApiResponse<TotalInvestment>>(`${this.apiUrl}/total-investment`);
  }

  getCurrentValue(): Observable<ApiResponse<CurrentValue>> {
    return this.http.get<ApiResponse<CurrentValue>>(`${this.apiUrl}/current-value`);
  }

  getTotalGain(): Observable<ApiResponse<TotalGain>> {
    return this.http.get<ApiResponse<TotalGain>>(`${this.apiUrl}/total-gain`);
  }

  getPnL(period: string = 'monthly'): Observable<ApiResponse<PnLData>> {
    const params = new HttpParams().set('period', period);
    return this.http.get<ApiResponse<PnLData>>(`${this.apiUrl}/pnl`, { params });
  }

  getWinRate(): Observable<ApiResponse<WinRateData>> {
    return this.http.get<ApiResponse<WinRateData>>(`${this.apiUrl}/win-rate`);
  }

  getReturns(period: string = 'yearly'): Observable<ApiResponse<ReturnsData>> {
    const params = new HttpParams().set('period', period);
    return this.http.get<ApiResponse<ReturnsData>>(`${this.apiUrl}/returns`, { params });
  }

  getSummary(): Observable<ApiResponse<PortfolioSummary>> {
    return this.http.get<ApiResponse<PortfolioSummary>>(`${this.apiUrl}/summary`);
  }
}
