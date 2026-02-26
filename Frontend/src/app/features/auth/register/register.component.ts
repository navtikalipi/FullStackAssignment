import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
          <p class="subtitle">Create your investor account</p>
        </div>

        <form (ngSubmit)="onRegister()" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input id="firstName" type="text" [(ngModel)]="form.firstName" name="firstName" placeholder="First name" required />
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input id="lastName" type="text" [(ngModel)]="form.lastName" name="lastName" placeholder="Last name" required />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="form.email" name="email" placeholder="you@example.com" required />
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input id="username" type="text" [(ngModel)]="form.username" name="username" placeholder="Choose a username" required />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" [(ngModel)]="form.password" name="password" placeholder="Create a strong password" required />
          </div>

          @if (error) {
            <div class="error-msg">{{ error }}</div>
          }

          @if (success) {
            <div class="success-msg">{{ success }}</div>
          }

          <button type="submit" class="btn-primary" [disabled]="loading">
            @if (loading) {
              <span class="spinner"></span> Creating account...
            } @else {
              Create Account
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      align-items: center;
      justify-content: center;
    }
    .auth-card {
      width: 520px;
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
    .subtitle { color: #666; margin-top: 8px; font-size: 14px; }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .form-row .form-group { flex: 1; }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }
    .form-group input {
      width: 100%;
      padding: 12px 14px;
      background: #f7f8fa;
      border: 2px solid #e8ecf0;
      border-radius: 10px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-group input:focus {
      border-color: #3a7bd5;
      background: #fff;
    }
    .error-msg {
      background: #fff5f5;
      color: #e53e3e;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      border: 1px solid #fed7d7;
    }
    .success-msg {
      background: #f0fff4;
      color: #38a169;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      border: 1px solid #c6f6d5;
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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(58,123,213,0.4);
    }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .spinner {
      width: 16px; height: 16px;
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
  `]
})
export class RegisterComponent {
  form = {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'USER'
  };
  error = '';
  success = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    if (!this.form.username || !this.form.password || !this.form.email || !this.form.firstName || !this.form.lastName) {
      this.error = 'Please fill in all fields';
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';
    this.authService.register(this.form).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = res.message + ' Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
