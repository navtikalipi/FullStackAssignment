import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <nav class="navbar">
        <div class="logo">
          <span class="logo-icon">📈</span>
          <span class="logo-text">Portfolio Tracker</span>
        </div>
        <div class="user-menu">
          <span class="user-name">{{ userName }}</span>
          <button (click)="logout()" class="btn btn-outline">Logout</button>
        </div>
      </nav>

      <main class="dashboard-content">
        <h1>Dashboard</h1>
        <p class="welcome-text">Welcome to your portfolio dashboard!</p>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">💵</div>
            <div class="stat-info">
              <span class="stat-label">Total Value</span>
              <span class="stat-value">$0.00</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-info">
              <span class="stat-label">Total Gain/Loss</span>
              <span class="stat-value">$0.00</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <span class="stat-label">Holdings</span>
              <span class="stat-value">0</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <span class="stat-label">Transactions</span>
              <span class="stat-value">0</span>
            </div>
          </div>
        </div>

        <div class="dashboard-sections">
          <div class="section-card">
            <h2>Holdings</h2>
            <p class="placeholder-text">No holdings yet. Add your first transaction to get started.</p>
          </div>
          
          <div class="section-card">
            <h2>Recent Transactions</h2>
            <p class="placeholder-text">No transactions yet. Add your first transaction to get started.</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f5f7fa;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 40px;
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 700;
      color: #333;
    }

    .logo-icon {
      font-size: 24px;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-name {
      color: #666;
      font-weight: 500;
    }

    .btn {
      padding: 8px 20px;
      border-radius: 6px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      border: none;
    }

    .btn-outline {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-outline:hover {
      background: #667eea;
      color: white;
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px;
    }

    .dashboard-content h1 {
      color: #333;
      margin: 0 0 8px 0;
      font-size: 32px;
    }

    .welcome-text {
      color: #666;
      margin: 0 0 32px 0;
      font-size: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .stat-icon {
      font-size: 36px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      color: #666;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .stat-value {
      color: #333;
      font-size: 24px;
      font-weight: 700;
    }

    .dashboard-sections {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .section-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .section-card h2 {
      color: #333;
      margin: 0 0 16px 0;
      font-size: 20px;
    }

    .placeholder-text {
      color: #999;
      text-align: center;
      padding: 40px 20px;
      margin: 0;
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-sections {
        grid-template-columns: 1fr;
      }

      .navbar {
        padding: 16px 20px;
      }

      .dashboard-content {
        padding: 20px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  userName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.firstName || user.email || 'User';
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
