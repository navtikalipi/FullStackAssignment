import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Create Account</h2>
          <p>Start building your portfolio</p>
        </div>
        
        <form (ngSubmit)="onSignup()" class="auth-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              [(ngModel)]="firstName" 
              name="firstName" 
              required
              placeholder="Enter your first name"
            >
          </div>
          
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              [(ngModel)]="lastName" 
              name="lastName" 
              required
              placeholder="Enter your last name"
            >
          </div>
          
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
              minlength="6"
              placeholder="Enter your password (min 6 characters)"
            >
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              [(ngModel)]="confirmPassword" 
              name="confirmPassword" 
              required
              placeholder="Confirm your password"
            >
          </div>
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          
          <button type="submit" class="btn-primary" [disabled]="isLoading">
            {{ isLoading ? 'Creating account...' : 'Sign Up' }}
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Sign In</a></p>
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
      gap: 16px;
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
      margin-top: 8px;
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
    
    .success-message {
      color: #27ae60;
      font-size: 14px;
      text-align: center;
      padding: 10px;
      background: #e8f8f0;
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
export class SignupComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSignup(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;

    this.authService.signup({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.successMessage = 'Account created successfully! Redirecting to login...';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create account';
      }
    });
  }
}
