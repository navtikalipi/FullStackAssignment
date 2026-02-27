import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { forkJoin, interval, Subscription } from 'rxjs';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { PortfolioService } from '../../core/services/portfolio.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { HoldingsService } from '../../core/services/holdings.service';
import { PnLData, WinRateData, Holding, AllocationItem } from '../../core/models';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, InrPipe],
  template: `
    <div class="analytics-page">
      <div class="page-header">
        <div class="header-left">
          <h2>Profit & Loss Analytics</h2>
          <p class="subtitle">Deep insights into your portfolio performance</p>
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
          <p>Analyzing your portfolio...</p>
        </div>
      } @else {
        <!-- P&L Period Selector -->
        <div class="section-card">
          <div class="section-header">
            <h3>Profit & Loss Analysis</h3>
            <div class="period-selector">
              @for (p of periods; track p) {
                <button class="period-btn" [class.active]="selectedPeriod === p" (click)="changePeriod(p)">
                  {{ p | titlecase }}
                </button>
              }
            </div>
          </div>

          @if (pnlData) {
            <div class="pnl-cards">
              <div class="pnl-card">
                <span class="pnl-card-label">Total P&L</span>
                <span class="pnl-card-value" [class.positive]="pnlData.totalPnL >= 0" [class.negative]="pnlData.totalPnL < 0">
                  {{ pnlData.totalPnL | inr }}
                </span>
                <span class="pnl-card-pct" [class.positive]="pnlData.pnlPercentage >= 0" [class.negative]="pnlData.pnlPercentage < 0">
                  {{ pnlData.pnlPercentage >= 0 ? '+' : '' }}{{ pnlData.pnlPercentage | number:'1.2-2' }}%
                </span>
              </div>
              <div class="pnl-card">
                <span class="pnl-card-label">Realized Gains</span>
                <span class="pnl-card-value" [class.positive]="pnlData.realizedPnL >= 0" [class.negative]="pnlData.realizedPnL < 0">
                  {{ pnlData.realizedPnL | inr }}
                </span>
                <span class="pnl-card-sub">From closed positions</span>
              </div>
              <div class="pnl-card">
                <span class="pnl-card-label">Unrealized Gains</span>
                <span class="pnl-card-value" [class.positive]="pnlData.unrealizedPnL >= 0" [class.negative]="pnlData.unrealizedPnL < 0">
                  {{ pnlData.unrealizedPnL | inr }}
                </span>
                <span class="pnl-card-sub">From open positions</span>
              </div>
            </div>
          }
        </div>

        <!-- Win Rate & Top/Bottom Stocks -->
        <div class="two-col">
          <!-- Win Rate -->
          <div class="section-card">
            <h3>Win Rate</h3>
            @if (winRate) {
              <div class="win-rate-display">
                <div class="win-rate-circle">
                  <svg viewBox="0 0 100 100" class="circle-chart">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f0" stroke-width="8"/>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#00c853" stroke-width="8"
                            stroke-linecap="round"
                            [attr.stroke-dasharray]="getCircleDash(winRate.winRate)"
                            stroke-dashoffset="0"
                            transform="rotate(-90 50 50)"/>
                    <text x="50" y="50" text-anchor="middle" dominant-baseline="central"
                          font-size="18" font-weight="700" fill="#1a1a2e">
                      {{ winRate.winRate | number:'1.1-1' }}%
                    </text>
                  </svg>
                </div>
                <div class="win-stats">
                  <div class="win-stat">
                    <span class="stat-dot win"></span>
                    <span>Winning: {{ winRate.winningTrades }}</span>
                  </div>
                  <div class="win-stat">
                    <span class="stat-dot lose"></span>
                    <span>Losing: {{ winRate.losingTrades }}</span>
                  </div>
                  <div class="win-stat">
                    <span class="stat-dot neutral"></span>
                    <span>Total: {{ winRate.totalTrades }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Asset Allocation -->
          <div class="section-card">
            <h3>Investment Distribution</h3>
            @if (allocationChartData.labels && allocationChartData.labels.length > 0) {
              <div class="chart-wrapper">
                <canvas baseChart
                  [data]="allocationChartData"
                  [options]="pieOptions"
                  type="pie">
                </canvas>
              </div>
            } @else {
              <div class="empty-chart">
                <span>📊</span>
                <p>No allocation data available</p>
              </div>
            }
          </div>
        </div>

        <!-- Top/Bottom Performers -->
        <div class="two-col">
          <div class="section-card">
            <h3>🏆 Top Performers</h3>
            @if (topPerformers.length > 0) {
              <div class="performer-list">
                @for (h of topPerformers; track h.id) {
                  <div class="performer-item">
                    <div class="performer-info">
                      <span class="symbol-tag">{{ h.symbol }}</span>
                      <span class="performer-qty">{{ h.quantity }} shares</span>
                    </div>
                    <div class="performer-pnl">
                      <span class="positive">+{{ h.pnLPercentage | number:'1.2-2' }}%</span>
                      <span class="performer-val positive">{{ h.pnL | inr }}</span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="no-data">No profitable holdings yet</p>
            }
          </div>

          <div class="section-card">
            <h3>📉 Loss-Making Stocks</h3>
            @if (bottomPerformers.length > 0) {
              <div class="performer-list">
                @for (h of bottomPerformers; track h.id) {
                  <div class="performer-item">
                    <div class="performer-info">
                      <span class="symbol-tag">{{ h.symbol }}</span>
                      <span class="performer-qty">{{ h.quantity }} shares</span>
                    </div>
                    <div class="performer-pnl">
                      <span class="negative">{{ h.pnLPercentage | number:'1.2-2' }}%</span>
                      <span class="performer-val negative">{{ h.pnL | inr }}</span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="no-data">No loss-making holdings 🎉</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .analytics-page { max-width: 1200px; margin: 0 auto; }
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
      padding: 80px 0; color: #888;
    }
    .loader {
      width: 40px; height: 40px;
      border: 4px solid #e8ecf0; border-top-color: #3a7bd5;
      border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .section-card {
      background: #fff; border-radius: 16px; padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #f0f0f0;
      margin-bottom: 20px;
    }
    .section-card h3 { font-size: 16px; color: #1a1a2e; margin: 0 0 16px 0; }
    .section-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
    }
    .section-header h3 { margin-bottom: 0; }

    .period-selector { display: flex; gap: 4px; }
    .period-btn {
      padding: 6px 14px; border: 1px solid #e0e0e0; border-radius: 6px;
      background: #fff; color: #555; font-size: 12px; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
    }
    .period-btn.active {
      background: #1a1a2e; color: #fff; border-color: #1a1a2e;
    }

    .pnl-cards {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
    }
    .pnl-card {
      background: #f7f8fa; padding: 20px; border-radius: 12px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .pnl-card-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .pnl-card-value { font-size: 22px; font-weight: 700; }
    .pnl-card-pct { font-size: 13px; font-weight: 600; }
    .pnl-card-sub { font-size: 12px; color: #aaa; }

    .positive { color: #00c853; }
    .negative { color: #ff5252; }

    .two-col {
      display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
    }

    .win-rate-display {
      display: flex; align-items: center; gap: 32px; justify-content: center;
    }
    .win-rate-circle { width: 140px; height: 140px; }
    .circle-chart { width: 100%; height: 100%; }
    .win-stats { display: flex; flex-direction: column; gap: 12px; }
    .win-stat {
      display: flex; align-items: center; gap: 8px; font-size: 14px; color: #555;
    }
    .stat-dot {
      width: 10px; height: 10px; border-radius: 50%;
    }
    .stat-dot.win { background: #00c853; }
    .stat-dot.lose { background: #ff5252; }
    .stat-dot.neutral { background: #ccc; }

    .chart-wrapper { max-height: 240px; display: flex; justify-content: center; }
    .empty-chart {
      display: flex; flex-direction: column; align-items: center;
      padding: 40px 0; color: #888;
    }
    .empty-chart span { font-size: 36px; margin-bottom: 8px; }

    .performer-list { display: flex; flex-direction: column; gap: 10px; }
    .performer-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px; background: #f7f8fa; border-radius: 10px;
    }
    .performer-info { display: flex; align-items: center; gap: 10px; }
    .symbol-tag {
      background: #e8f4fd; color: #3a7bd5; padding: 4px 10px;
      border-radius: 6px; font-weight: 600; font-size: 12px;
    }
    .performer-qty { font-size: 12px; color: #888; }
    .performer-pnl { text-align: right; display: flex; flex-direction: column; gap: 2px; }
    .performer-pnl span:first-child { font-size: 14px; font-weight: 600; }
    .performer-val { font-size: 12px; }
    .no-data { text-align: center; color: #aaa; padding: 20px 0; }

    @media (max-width: 900px) {
      .two-col { grid-template-columns: 1fr; }
      .pnl-cards { grid-template-columns: 1fr; }
    }
  `]
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  loading = true;
  pnlData: PnLData | null = null;
  winRate: WinRateData | null = null;
  holdings: Holding[] = [];
  topPerformers: Holding[] = [];
  bottomPerformers: Holding[] = [];
  allocationData: { [key: string]: AllocationItem } = {};
  selectedPeriod = 'monthly';
  periods = ['daily', 'weekly', 'monthly', 'yearly'];

  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 1000; // 1 second

  allocationChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  pieOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 12 } } }
    }
  };

  constructor(
    private portfolioService: PortfolioService,
    private analyticsService: AnalyticsService,
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
      pnl: this.portfolioService.getPnL(this.selectedPeriod),
      winRate: this.portfolioService.getWinRate(),
      holdings: this.holdingsService.getHoldings(),
      allocation: this.analyticsService.getAssetAllocation(),
    }).subscribe({
      next: (res) => {
        this.pnlData = res.pnl.data;
        this.winRate = res.winRate.data;
        this.holdings = res.holdings.data || [];
        this.allocationData = res.allocation.data || {};
        this.computePerformers();
        this.buildAllocationChart();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  refreshData(): void {
    this.loading = true;
    this.loadData();
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.portfolioService.getPnL(period).subscribe({
      next: (res) => { this.pnlData = res.data; }
    });
  }

  computePerformers(): void {
    const sorted = [...this.holdings].sort((a, b) => b.pnLPercentage - a.pnLPercentage);
    this.topPerformers = sorted.filter(h => h.pnL > 0).slice(0, 5);
    this.bottomPerformers = sorted.filter(h => h.pnL < 0).reverse().slice(0, 5);
  }

  buildAllocationChart(): void {
    const keys = Object.keys(this.allocationData);
    if (!keys.length) return;
    const colors = ['#3a7bd5', '#00c853', '#ff9800', '#7c4dff', '#ff5252', '#26c6da'];
    this.allocationChartData = {
      labels: keys.map(k => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [{
        data: keys.map(k => this.allocationData[k].percentage),
        backgroundColor: colors.slice(0, keys.length),
        borderWidth: 2,
        borderColor: '#fff',
      }]
    };
  }

  getCircleDash(percentage: number): string {
    const circumference = 2 * Math.PI * 42;
    const filled = (percentage / 100) * circumference;
    return `${filled} ${circumference}`;
  }
}
