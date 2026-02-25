import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthResponse, SignupRequest, SigninRequest, ApiResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  signup(request: SignupRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/api/auth/signup`, request)
      .pipe(map(response => response.data));
  }

  signin(request: SigninRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/api/auth/signin`, request)
      .pipe(map(response => response.data));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  setUser(user: AuthResponse): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
