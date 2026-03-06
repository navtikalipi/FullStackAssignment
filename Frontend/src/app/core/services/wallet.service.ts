import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WalletResponse {
  success: boolean;
  message: string;
  data: {
    userId: number;
    balance: number;
    amount?: number;
    newBalance?: number;
  };
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private apiUrl = environment.apiUrl;
  private paymentApiUrl = (environment as any).paymentApiUrl || environment.apiUrl;
  private balanceSubject = new BehaviorSubject<number>(0);
  balance$ = this.balanceSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getUserId(): number {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId, 10) : 0;
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-User-Id': this.getUserId().toString()
    });
  }

  getBalance(): Observable<WalletResponse> {
    return this.http.get<WalletResponse>(`${this.paymentApiUrl}/api/wallet/balance`, {
      headers: this.getHeaders()
    });
  }

  deposit(amount: number): Observable<WalletResponse> {
    return this.http.post<WalletResponse>(`${this.paymentApiUrl}/api/wallet/deposit`, 
      { amount },
      { headers: this.getHeaders() }
    );
  }

  withdraw(amount: number): Observable<WalletResponse> {
    return this.http.post<WalletResponse>(`${this.paymentApiUrl}/api/wallet/withdraw`, 
      { amount },
      { headers: this.getHeaders() }
    );
  }

  initWallet(): Observable<WalletResponse> {
    return this.http.post<WalletResponse>(`${this.paymentApiUrl}/api/wallet/init`, 
      {},
      { headers: this.getHeaders() }
    );
  }

  updateBalance(balance: number): void {
    this.balanceSubject.next(balance);
  }
}

