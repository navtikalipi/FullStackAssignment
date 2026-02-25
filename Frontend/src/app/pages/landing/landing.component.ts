import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-container">
      <nav class="navbar">
        <div class="logo">
          <span class="logo-icon">📈</span>
          <span class="logo-text">Portfolio Tracker</span>
        </div>
        <div class="nav-links">
          <a routerLink="/login" class="btn btn-outline">Sign In</a>
          <a routerLink="/signup" class="btn btn-primary">Get Started</a>
        </div>
      </nav>

      <main class="hero">
        <div class="hero-content">
          <h1>Track Your Investments with <span class="highlight">Precision</span></h1>
          <p class="subtitle">
            Monitor your stock portfolio, analyze performance, and make data-driven investment decisions all in one place.
          </p>
          <div class="cta-buttons">
            <a routerLink="/signup" class="btn btn-primary btn-large">Start Free Today</a>
            <a routerLink="/login" class="btn btn-outline btn-large">Sign In</a>
          </div>
        </div>

        <div class="hero-features">
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Real-time Analytics</h3>
            <p>Track your portfolio performance with detailed analytics and charts</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>Profit & Loss</h3>
            <p>Monitor your gains and losses with comprehensive P&L reports</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h3>Holdings Overview</h3>
            <p>View all your holdings at a glance with allocation breakdowns</p>
          </div>
        </div>
      </main>

      <footer class="footer">
        <p>&copy; 2024 Portfolio Tracker. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      color: white;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 40px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 24px;
      font-weight: 700;
    }

    .logo-icon {
      font-size: 28px;
    }

    .nav-links {
      display: flex;
      gap: 16px;
    }

    .btn {
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-outline {
      background: transparent;
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .btn-outline:hover {
      border-color: white;
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-large {
      padding: 14px 32px;
      font-size: 18px;
    }

    .hero {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 40px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .hero-content {
      text-align: center;
      margin-bottom: 60px;
    }

    .hero-content h1 {
      font-size: 56px;
      font-weight: 800;
      margin: 0 0 24px 0;
      line-height: 1.2;
    }

    .highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.7);
      max-width: 600px;
      margin: 0 auto 40px;
      line-height: 1.6;
    }

    .cta-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
    }

    .hero-features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      width: 100%;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .feature-card h3 {
      font-size: 20px;
      margin: 0 0 12px 0;
      font-weight: 600;
    }

    .feature-card p {
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      line-height: 1.5;
    }

    .footer {
      padding: 20px;
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 36px;
      }

      .hero-features {
        grid-template-columns: 1fr;
      }

      .cta-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class LandingComponent {}
