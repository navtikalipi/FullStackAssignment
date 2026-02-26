import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav">
        @for (item of navItems; track item.route) {
          <a class="nav-item"
             [routerLink]="item.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        }
      </nav>
      <div class="sidebar-footer">
        <div class="market-status">
          <span class="status-dot"></span>
          <span class="status-text">Market Open</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      height: calc(100vh - 64px);
      position: fixed;
      top: 64px;
      left: 0;
      background: linear-gradient(180deg, #1a1a2e 0%, #0f0f23 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 16px 0;
      z-index: 999;
      border-right: 1px solid rgba(255,255,255,0.05);
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 0 12px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #8892b0;
      text-decoration: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .nav-item:hover {
      background: rgba(0,210,255,0.08);
      color: #ccd6f6;
    }
    .nav-item.active {
      background: linear-gradient(135deg, rgba(0,210,255,0.15), rgba(58,123,213,0.15));
      color: #00d2ff;
      font-weight: 600;
    }
    .nav-item.active .nav-icon {
      transform: scale(1.1);
    }
    .nav-icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
      transition: transform 0.2s;
    }
    .nav-label { letter-spacing: 0.3px; }
    .sidebar-footer {
      padding: 16px 24px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .market-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #00e676;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .status-text {
      font-size: 12px;
      color: #8892b0;
    }
  `]
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Holdings', icon: '💼', route: '/holdings' },
    { label: 'Transactions', icon: '🔄', route: '/transactions' },
    { label: 'Market Data', icon: '📈', route: '/market' },
    { label: 'Analytics', icon: '📉', route: '/analytics' },
    { label: 'Reports', icon: '📋', route: '/reports' },
  ];
}
