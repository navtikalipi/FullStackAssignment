import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AssetAllocation } from '../models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getAssetAllocation(): Observable<ApiResponse<AssetAllocation>> {
    return this.http.get<ApiResponse<AssetAllocation>>(`${this.apiUrl}/allocation`);
  }
}
