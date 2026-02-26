import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <span class="logo-icon">📈</span>
            <h1>StockFolio</h1>
          </div>
          <p class="subtitle">Indian Stock Portfolio Manager</p>
          <div class="market-badges">
            <span class="badge">NSE</span>
            <span class="badge">BSE</span>
          </div>
        </div>

        <form (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label for="username">Username</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input
                id="username"
                type="text"
                [(ngModel)]="username"
                name="username"
                placeholder="Enter your username"
                required />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="Enter your password"
                required />
              <button type="button" class="toggle-pwd" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          @if (error) {
            <div class="error-msg">{{ error }}</div>
          }

          <button type="submit" class="btn-primary" [disabled]="loading">
            @if (loading) {
              <span class="spinner"></span> Logging in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Register here</a></p>
        </div>
      </div>

      <div class="auth-info">
        <h2>Track Your Investments</h2>
        <ul>
          <li>📊 Real-time portfolio tracking</li>
          <li>💹 P&L analytics & insights</li>
          <li>📋 Transaction history management</li>
          <li>📈 Indian stock market (NSE/BSE)</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
    }
    .auth-card {
      width: 480px;
      margin: auto;
      padding: 48px;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .logo-icon { font-size: 36px; }
    .logo h1 {
      font-size: 28px;
      margin: 0;
      background: linear-gradient(135deg, #1a1a2e, #3a7bd5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: #666;
      margin-top: 8px;
      font-size: 14px;
    }
    .market-badges {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-top: 12px;
    }
    .badge {
      background: linear-gradient(135deg, #00d2ff, #3a7bd5);
      color: #fff;
      padding: 4px 14px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }
    .input-wrapper {
      display: flex;
      align-items: center;
      background: #f7f8fa;
      border: 2px solid #e8ecf0;
      border-radius: 12px;
      padding: 0 14px;
      transition: border-color 0.2s;
    }
    .input-wrapper:focus-within {
      border-color: #3a7bd5;
      background: #fff;
    }
    .input-icon { font-size: 16px; margin-right: 10px; }
    .input-wrapper input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 14px 0;
      font-size: 14px;
      outline: none;
      color: #333;
    }
    .toggle-pwd {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
    }
    .error-msg {
      background: #fff5f5;
      color: #e53e3e;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      border: 1px solid #fed7d7;
    }
    .btn-primary {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(58,123,213,0.4);
    }
    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: #666;
    }
    .auth-footer a {
      color: #3a7bd5;
      text-decoration: none;
      font-weight: 600;
    }
    .auth-footer a:hover { text-decoration: underline; }
    .auth-info {
      display: none;
    }
    @media (min-width: 1024px) {
      .auth-card { margin: auto 0; margin-left: 10%; }
      .auth-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 48px 64px;
        color: #fff;
        flex: 1;
      }
      .auth-info h2 {
        font-size: 32px;
        margin-bottom: 24px;
        background: linear-gradient(135deg, #00d2ff, #fff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .auth-info ul {
        list-style: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .auth-info li {
        font-size: 16px;
        color: #b0bec5;
      }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password';
      return;
    }
    this.loading = true;
    this.error = '';
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid credentials. Please try again.';
      }
    });
  }
}
