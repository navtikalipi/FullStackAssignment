import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your portfolio</p>
        </div>
        
        <form (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="email" 
              name="email" 
              required
              placeholder="Enter your email"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="password" 
              name="password" 
              required
              placeholder="Enter your password"
            >
          </div>
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn-primary" [disabled]="isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/signup">Sign Up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .auth-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
    
    .auth-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .auth-header h2 {
      color: #333;
      margin: 0 0 8px 0;
      font-size: 28px;
    }
    
    .auth-header p {
      color: #666;
      margin: 0;
    }
    
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .form-group label {
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }
    
    .form-group input {
      padding: 12px 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .btn-primary {
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
    }
    
    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .error-message {
      color: #e74c3c;
      font-size: 14px;
      text-align: center;
      padding: 10px;
      background: #fdeaea;
      border-radius: 8px;
    }
    
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      color: #666;
    }
    
    .auth-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    
    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.signin({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.authService.setToken(response.token);
        this.authService.setUser(response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid email or password';
      }
    });
  }
}
