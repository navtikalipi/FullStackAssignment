import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Holding, CreateHoldingRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class HoldingsService {
  private apiUrl = `${environment.apiUrl}/holdings`;

  constructor(private http: HttpClient) {}

  getHoldings(): Observable<ApiResponse<Holding[]>> {
    return this.http.get<ApiResponse<Holding[]>>(this.apiUrl);
  }

  getHoldingById(id: number): Observable<ApiResponse<Holding>> {
    return this.http.get<ApiResponse<Holding>>(`${this.apiUrl}/${id}`);
  }

  createHolding(holding: CreateHoldingRequest): Observable<ApiResponse<Holding>> {
    return this.http.post<ApiResponse<Holding>>(this.apiUrl, holding);
  }
}
