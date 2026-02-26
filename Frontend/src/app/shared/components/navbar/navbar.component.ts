import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <div class="logo">
          <span class="logo-icon">📈</span>
          <span class="logo-text">StockFolio</span>
        </div>
        <span class="market-badge">NSE / BSE</span>
      </div>
      <div class="navbar-end">
        <div class="user-info">
          <span class="user-greeting">Welcome, <strong>{{ username }}</strong></span>
          <button class="btn-logout" (click)="logout()">
            <span>⏻</span> Logout
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 64px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-icon { font-size: 24px; }
    .logo-text {
      font-size: 22px;
      font-weight: 700;
      background: linear-gradient(135deg, #00d2ff, #3a7bd5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .market-badge {
      background: rgba(0,210,255,0.15);
      color: #00d2ff;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .navbar-end {
      display: flex;
      align-items: center;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-greeting {
      font-size: 14px;
      color: #b0bec5;
    }
    .user-greeting strong { color: #fff; }
    .btn-logout {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,82,82,0.15);
      color: #ff5252;
      border: 1px solid rgba(255,82,82,0.3);
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      background: rgba(255,82,82,0.25);
      border-color: #ff5252;
    }
  `]
})
export class NavbarComponent {
  username: string;

  constructor(private authService: AuthService, private router: Router) {
    this.username = this.authService.getUsername() || 'Investor';
  }

  logout(): void {
    this.authService.logout();
  }
}
