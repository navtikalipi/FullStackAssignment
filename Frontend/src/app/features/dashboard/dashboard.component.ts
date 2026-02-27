import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { forkJoin, interval, Subscription } from 'rxjs';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { PortfolioService } from '../../core/services/portfolio.service';
import { HoldingsService } from '../../core/services/holdings.service';
import { DashboardData, PnLData, WinRateData, ReturnsData, Holding } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgChartsModule, InrPipe],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div class="header-left">
          <h2>Portfolio Dashboard</h2>
          <p class="subtitle">Your investment overview at a glance</p>
        </div>
        <div class="header-right">
          <div class="live-indicator">
            <span class="live-dot"></span> Live
          </div>
          <button class="refresh-btn" (click)="refreshData()" [disabled]="loading">
            <span class="refresh-icon" [class.spinning]="loading">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="loader"></div>
          <p>Loading your portfolio...</p>
        </div>
      } @else {
        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="card card-invested">
            <div class="card-icon">💰</div>
            <div class="card-body">
              <span class="card-label">Total Invested</span>
              <span class="card-value">{{ dashboard?.totalInvestment | inr }}</span>
            </div>
          </div>

          <div class="card card-value">
            <div class="card-icon">📊</div>
            <div class="card-body">
              <span class="card-label">Current Value</span>
              <span class="card-value">{{ dashboard?.currentValue | inr }}</span>
            </div>
          </div>

          <div class="card" [class.card-profit]="(dashboard?.totalPnL || 0) >= 0" [class.card-loss]="(dashboard?.totalPnL || 0) < 0">
            <div class="card-icon">{{ (dashboard?.totalPnL || 0) >= 0 ? '📈' : '📉' }}</div>
            <div class="card-body">
              <span class="card-label">Total P&L</span>
              <span class="card-value">{{ dashboard?.totalPnL | inr }}</span>
              @if (pnlData) {
                <span class="card-change" [class.positive]="pnlData.pnlPercentage >= 0" [class.negative]="pnlData.pnlPercentage < 0">
                  {{ pnlData.pnlPercentage >= 0 ? '+' : '' }}{{ pnlData.pnlPercentage | number:'1.2-2' }}%
                </span>
              }
            </div>
          </div>

          <div class="card card-returns">
            <div class="card-icon">🏆</div>
            <div class="card-body">
              <span class="card-label">Win Rate</span>
              <span class="card-value">{{ winRate?.winRate | number:'1.1-1' }}%</span>
              <span class="card-sub">{{ winRate?.winningTrades }}/{{ winRate?.totalTrades }} trades</span>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <div class="chart-card">
            <h3>Holdings Distribution</h3>
            @if (holdingsPieData.labels && holdingsPieData.labels.length > 0) {
              <div class="chart-wrapper">
                <canvas baseChart
                  [data]="holdingsPieData"
                  [options]="pieOptions"
                  type="doughnut">
                </canvas>
              </div>
            } @else {
              <div class="empty-chart">
                <span>💼</span>
                <p>No holdings yet</p>
              </div>
            }
          </div>

          <div class="chart-card">
            <h3>P&L Breakdown</h3>
            @if (pnlData) {
              <div class="pnl-breakdown">
                <div class="pnl-item">
                  <div class="pnl-bar-label">
                    <span>Realized P&L</span>
                    <span class="pnl-val" [class.positive]="pnlData.realizedPnL >= 0" [class.negative]="pnlData.realizedPnL < 0">
                      {{ pnlData.realizedPnL | inr }}
                    </span>
                  </div>
                  <div class="pnl-bar">
                    <div class="pnl-bar-fill realized" [style.width.%]="getPnlBarWidth(pnlData.realizedPnL)"></div>
                  </div>
                </div>
                <div class="pnl-item">
                  <div class="pnl-bar-label">
                    <span>Unrealized P&L</span>
                    <span class="pnl-val" [class.positive]="pnlData.unrealizedPnL >= 0" [class.negative]="pnlData.unrealizedPnL < 0">
                      {{ pnlData.unrealizedPnL | inr }}
                    </span>
                  </div>
                  <div class="pnl-bar">
                    <div class="pnl-bar-fill unrealized" [style.width.%]="getPnlBarWidth(pnlData.unrealizedPnL)"></div>
                  </div>
                </div>
                <div class="pnl-total">
                  <span>Total P&L</span>
                  <span class="pnl-val" [class.positive]="pnlData.totalPnL >= 0" [class.negative]="pnlData.totalPnL < 0">
                    {{ pnlData.totalPnL | inr }}
                  </span>
                </div>
              </div>
            } @else {
              <div class="empty-chart">
                <span>📉</span>
                <p>No P&L data available</p>
              </div>
            }
          </div>
        </div>

        <!-- Returns & Holdings Table Row -->
        <div class="bottom-row">
          <div class="chart-card returns-card">
            <h3>Returns Overview</h3>
            @if (returns) {
              <div class="returns-grid">
                <div class="return-item">
                  <span class="return-label">Total Return</span>
                  <span class="return-value" [class.positive]="returns.totalReturn >= 0" [class.negative]="returns.totalReturn < 0">
                    {{ returns.totalReturn >= 0 ? '+' : '' }}{{ returns.totalReturn | number:'1.2-2' }}%
                  </span>
                </div>
                <div class="return-item">
                  <span class="return-label">Annualized</span>
                  <span class="return-value" [class.positive]="returns.annualizedReturn >= 0" [class.negative]="returns.annualizedReturn < 0">
                    {{ returns.annualizedReturn >= 0 ? '+' : '' }}{{ returns.annualizedReturn | number:'1.2-2' }}%
                  </span>
                </div>
                <div class="return-item">
                  <span class="return-label">YTD Return</span>
                  <span class="return-value" [class.positive]="returns.ytdReturn >= 0" [class.negative]="returns.ytdReturn < 0">
                    {{ returns.ytdReturn >= 0 ? '+' : '' }}{{ returns.ytdReturn | number:'1.2-2' }}%
                  </span>
                </div>
                <div class="return-item">
                  <span class="return-label">Monthly</span>
                  <span class="return-value" [class.positive]="returns.monthlyReturn >= 0" [class.negative]="returns.monthlyReturn < 0">
                    {{ returns.monthlyReturn >= 0 ? '+' : '' }}{{ returns.monthlyReturn | number:'1.2-2' }}%
                  </span>
                </div>
              </div>
            }
          </div>

          <div class="chart-card holdings-table-card">
            <div class="card-header-row">
              <h3>Top Holdings</h3>
              <a routerLink="/holdings" class="view-all">View All →</a>
            </div>
            @if (holdings.length > 0) {
              <table class="holdings-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Qty</th>
                    <th>Current</th>
                    <th>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  @for (h of holdings.slice(0, 5); track h.id) {
                    <tr>
                      <td><span class="symbol-tag">{{ h.symbol }}</span></td>
                      <td>{{ h.quantity }}</td>
                      <td>{{ h.currentPrice | inr }}</td>
                      <td>
                        <span [class.positive]="h.pnL >= 0" [class.negative]="h.pnL < 0">
                          {{ h.pnL | inr }}
                          <small>({{ h.pnLPercentage >= 0 ? '+' : '' }}{{ h.pnLPercentage | number:'1.2-2' }}%)</small>
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="empty-chart">
                <span>💼</span>
                <p>No holdings to display</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; margin: 0 auto; }
    .page-header { 
      margin-bottom: 24px; 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
    }
    .header-left h2 { font-size: 24px; color: #1a1a2e; margin: 0; }
    .header-left .subtitle { color: #666; font-size: 14px; margin-top: 4px; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    
    .live-indicator { 
      display: flex; 
      align-items: center; 
      gap: 6px; 
      color: #00c853; 
      font-weight: 600; 
      font-size: 12px; 
    }
    .live-dot { 
      width: 8px; 
      height: 8px; 
      background: #00c853; 
      border-radius: 50%; 
      animation: pulse 1.5s infinite; 
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    
    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #555;
      cursor: pointer;
      transition: all 0.2s;
    }
    .refresh-btn:hover:not(:disabled) {
      background: #f7f8fa;
      border-color: #3a7bd5;
      color: #3a7bd5;
    }
    .refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .refresh-icon { font-size: 14px; display: inline-block; }
    .refresh-icon.spinning { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .loading-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 80px 0; color: #666;
    }
    .loader {
      width: 40px; height: 40px;
      border: 4px solid #e8ecf0; border-top-color: #3a7bd5;
      border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .summary-cards {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
    }
    .card {
      background: #fff; border-radius: 16px; padding: 20px;
      display: flex; align-items: flex-start; gap: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border: 1px solid #f0f0f0;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }
    .card-icon { font-size: 28px; margin-top: 2px; }
    .card-body { display: flex; flex-direction: column; gap: 4px; }
    .card-label { font-size: 12px; color: #888; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .card-value { font-size: 20px; font-weight: 700; color: #1a1a2e; }
    .card-change {
      font-size: 13px; font-weight: 600;
      padding: 2px 8px; border-radius: 6px; width: fit-content;
    }
    .card-sub { font-size: 12px; color: #888; }
    .card-profit { border-left: 4px solid #00c853; }
    .card-loss { border-left: 4px solid #ff5252; }
    .card-invested { border-left: 4px solid #3a7bd5; }
    .card-value-card { border-left: 4px solid #7c4dff; }
    .card-returns { border-left: 4px solid #ff9800; }

    .positive { color: #00c853 !important; }
    .negative { color: #ff5252 !important; }
    .positive.card-change { background: rgba(0,200,83,0.1); }
    .negative.card-change { background: rgba(255,82,82,0.1); }

    .charts-row, .bottom-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;
    }
    .chart-card {
      background: #fff; border-radius: 16px; padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #f0f0f0;
    }
    .chart-card h3 { font-size: 16px; color: #1a1a2e; margin: 0 0 16px 0; }
    .chart-wrapper { max-height: 260px; display: flex; justify-content: center; }
    .empty-chart {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 40px 0; color: #888;
    }
    .empty-chart span { font-size: 40px; margin-bottom: 8px; }

    .pnl-breakdown { display: flex; flex-direction: column; gap: 20px; }
    .pnl-item { display: flex; flex-direction: column; gap: 8px; }
    .pnl-bar-label { display: flex; justify-content: space-between; font-size: 13px; color: #555; }
    .pnl-val { font-weight: 600; }
    .pnl-bar {
      height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden;
    }
    .pnl-bar-fill {
      height: 100%; border-radius: 4px; transition: width 0.6s ease;
    }
    .pnl-bar-fill.realized { background: linear-gradient(90deg, #00c853, #69f0ae); }
    .pnl-bar-fill.unrealized { background: linear-gradient(90deg, #3a7bd5, #00d2ff); }
    .pnl-total {
      display: flex; justify-content: space-between; font-size: 15px; font-weight: 600;
      padding-top: 12px; border-top: 1px solid #f0f0f0; color: #1a1a2e;
    }

    .returns-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
    .return-item {
      background: #f7f8fa; padding: 16px; border-radius: 12px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .return-label { font-size: 12px; color: #888; font-weight: 500; }
    .return-value { font-size: 22px; font-weight: 700; }

    .card-header-row {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
    }
    .card-header-row h3 { margin-bottom: 0; }
    .view-all {
      font-size: 13px; color: #3a7bd5; text-decoration: none; font-weight: 600;
    }
    .view-all:hover { text-decoration: underline; }

    .holdings-table {
      width: 100%; border-collapse: collapse;
    }
    .holdings-table th {
      text-align: left; padding: 8px 12px; font-size: 11px; color: #888;
      text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f0f0f0;
    }
    .holdings-table td {
      padding: 10px 12px; font-size: 13px; color: #333; border-bottom: 1px solid #f8f8f8;
    }
    .holdings-table tr:hover td { background: #f7f8fa; }
    .symbol-tag {
      background: #e8f4fd; color: #3a7bd5; padding: 3px 10px;
      border-radius: 6px; font-weight: 600; font-size: 12px;
    }
    .holdings-table small { display: block; font-size: 11px; }

    @media (max-width: 900px) {
      .summary-cards { grid-template-columns: repeat(2, 1fr); }
      .charts-row, .bottom-row { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  dashboard: DashboardData | null = null;
  pnlData: PnLData | null = null;
  winRate: WinRateData | null = null;
  returns: ReturnsData | null = null;
  holdings: Holding[] = [];

  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 1000; // 1 second

  holdingsPieData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  pieOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { padding: 16, usePointStyle: true, font: { size: 12 } } }
    }
  };

  constructor(
    private portfolioService: PortfolioService,
    private holdingsService: HoldingsService
  ) {}

  ngOnInit(): void {
    this.loadData();
    
    // Auto-refresh every 1 second for live data
    this.refreshSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  loadData(): void {
    forkJoin({
      dashboard: this.portfolioService.getDashboard(),
      pnl: this.portfolioService.getPnL(),
      winRate: this.portfolioService.getWinRate(),
      returns: this.portfolioService.getReturns(),
      holdings: this.holdingsService.getHoldings(),
    }).subscribe({
      next: (res) => {
        this.dashboard = res.dashboard.data;
        this.pnlData = res.pnl.data;
        this.winRate = res.winRate.data;
        this.returns = res.returns.data;
        this.holdings = res.holdings.data || [];
        this.buildPieChart();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  refreshData(): void {
    this.loading = true;
    this.loadData();
  }

  buildPieChart(): void {
    if (!this.holdings.length) return;
    const colors = ['#3a7bd5','#00d2ff','#00c853','#ff9800','#7c4dff','#ff5252','#26c6da','#ab47bc','#ef5350','#66bb6a'];
    this.holdingsPieData = {
      labels: this.holdings.map(h => h.symbol),
      datasets: [{
        data: this.holdings.map(h => h.currentValue),
        backgroundColor: colors.slice(0, this.holdings.length),
        borderWidth: 2,
        borderColor: '#fff',
      }]
    };
  }

  getPnlBarWidth(value: number): number {
    if (!this.pnlData) return 0;
    const max = Math.max(Math.abs(this.pnlData.realizedPnL), Math.abs(this.pnlData.unrealizedPnL), 1);
    return (Math.abs(value) / max) * 100;
  }
}
