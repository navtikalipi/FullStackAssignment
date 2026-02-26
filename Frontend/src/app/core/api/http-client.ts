import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiHttpClient {

  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> {
    return this.http.get<unknown>(`${this.baseUrl}${url}`).pipe(
      map((response) => this.unwrapResponse<T>(response))
    );
  }

  post<T>(url: string, body: any, options?: any): Observable<T> {
    if (options && options.responseType === 'blob') {
      return this.http.post(`${this.baseUrl}${url}`, body, { 
        ...options, 
        responseType: 'blob' 
      }) as Observable<T>;
    }
    return this.http.post<unknown>(`${this.baseUrl}${url}`, body).pipe(
      map((response) => this.unwrapResponse<T>(response))
    );
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<unknown>(`${this.baseUrl}${url}`, body).pipe(
      map((response) => this.unwrapResponse<T>(response))
    );
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<unknown>(`${this.baseUrl}${url}`).pipe(
      map((response) => this.unwrapResponse<T>(response))
    );
  }

  getBlob(url: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${url}`, { responseType: 'blob' });
  }

  private unwrapResponse<T>(response: unknown): T {
    if (response === null || response === undefined) {
      return response as T;
    }

    if (typeof response === 'object' && response !== null && 'data' in response) {
      const wrapped = response as { data: T };
      return wrapped.data;
    }

    return response as T;
  }
}
