import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { PortfolioService } from '../../core/services/portfolio.service';
import { ReportsService } from '../../core/services/reports.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PortfolioSummary, AllocationItem } from '../../core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, InrPipe],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <h2>Reports & Insights</h2>
        <p class="subtitle">Generate portfolio reports for tracking and tax purposes</p>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="loader"></div>
          <p>Loading report data...</p>
        </div>
      } @else {
        <!-- Portfolio Summary Report -->
        <div class="section-card">
          <h3>📋 Portfolio Summary Report</h3>
          @if (summary) {
            <div class="summary-table">
              <div class="summary-row">
                <span class="summary-label">Total Investment</span>
                <span class="summary-value">{{ summary.totalInvestment | inr }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Current Value</span>
                <span class="summary-value">{{ summary.currentValue | inr }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total Gain/Loss</span>
                <span class="summary-value" [class.positive]="summary.totalGain >= 0" [class.negative]="summary.totalGain < 0">
                  {{ summary.totalGain | inr }}
                  ({{ summary.totalGainPercentage >= 0 ? '+' : '' }}{{ summary.totalGainPercentage | number:'1.2-2' }}%)
                </span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total P&L</span>
                <span class="summary-value" [class.positive]="summary.totalPnL >= 0" [class.negative]="summary.totalPnL < 0">
                  {{ summary.totalPnL | inr }}
                </span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Win Rate</span>
                <span class="summary-value">{{ summary.winRate | number:'1.1-1' }}%</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total Trades</span>
                <span class="summary-value">{{ summary.totalTrades }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Last Updated</span>
                <span class="summary-value">{{ summary.lastUpdated | date:'dd MMM yyyy, hh:mm a' }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Investment Distribution -->
        <div class="section-card">
          <h3>📊 Investment Distribution</h3>
          @if (allocationKeys.length > 0) {
            <div class="allocation-bars">
              @for (key of allocationKeys; track key) {
                <div class="alloc-item">
                  <div class="alloc-header">
                    <span class="alloc-name">{{ key | titlecase }}</span>
                    <span class="alloc-pct">{{ allocationData[key].percentage }}%</span>
                  </div>
                  <div class="alloc-bar">
                    <div class="alloc-fill" [style.width.%]="allocationData[key].percentage"
                         [style.background]="getAllocColor(key)"></div>
                  </div>
                  <span class="alloc-value">{{ allocationData[key].value | inr }}</span>
                </div>
              }
            </div>
          } @else {
            <p class="no-data">No allocation data available</p>
          }
        </div>

        <!-- Generate Report -->
        <div class="section-card">
          <h3>📥 Generate Report</h3>
          <p class="section-desc">Export your portfolio data as PDF or Excel for tax purposes and record keeping.</p>

          <form (ngSubmit)="generateReport()" class="report-form">
            <div class="form-row">
              <div class="form-group">
                <label>Report Type</label>
                <select [(ngModel)]="reportRequest.type" name="type" required>
                  <option value="performance">Performance Report</option>
                  <option value="holdings">Holdings Report</option>
                  <option value="transactions">Transaction History</option>
                  <option value="tax">Tax Report</option>
                </select>
              </div>
              <div class="form-group">
                <label>Period</label>
                <select [(ngModel)]="reportRequest.period" name="period" required>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <div class="form-group">
                <label>Format</label>
                <select [(ngModel)]="reportRequest.format" name="format" required>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
            </div>
            <button type="submit" class="btn-generate" [disabled]="generating">
              @if (generating) {
                <span class="spinner"></span> Generating...
              } @else {
                📥 Generate Report
              }
            </button>
          </form>

          @if (reportSuccess) {
            <div class="success-msg">
              ✅ {{ reportSuccess }}
            </div>
          }
          @if (reportError) {
            <div class="error-msg">{{ reportError }}</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .reports-page { max-width: 900px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h2 { font-size: 24px; color: #1a1a2e; margin: 0; }
    .subtitle { color: #666; font-size: 14px; margin-top: 4px; }

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
    .section-desc { font-size: 13px; color: #888; margin-bottom: 16px; }

    .summary-table { display: flex; flex-direction: column; }
    .summary-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 0; border-bottom: 1px solid #f5f5f5;
    }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { font-size: 14px; color: #555; }
    .summary-value { font-size: 15px; font-weight: 600; color: #1a1a2e; }
    .positive { color: #00c853; }
    .negative { color: #ff5252; }

    .allocation-bars { display: flex; flex-direction: column; gap: 16px; }
    .alloc-item { display: flex; flex-direction: column; gap: 6px; }
    .alloc-header { display: flex; justify-content: space-between; }
    .alloc-name { font-size: 13px; font-weight: 600; color: #333; }
    .alloc-pct { font-size: 13px; font-weight: 600; color: #1a1a2e; }
    .alloc-bar {
      height: 10px; background: #f0f0f0; border-radius: 5px; overflow: hidden;
    }
    .alloc-fill {
      height: 100%; border-radius: 5px; transition: width 0.8s ease;
    }
    .alloc-value { font-size: 12px; color: #888; }

    .report-form { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .form-group label {
      display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: #555;
    }
    .form-group select {
      width: 100%; padding: 10px 12px; background: #f7f8fa; border: 2px solid #e8ecf0;
      border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box;
    }
    .form-group select:focus { border-color: #3a7bd5; }
    .btn-generate {
      align-self: flex-start;
      background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
      color: #fff; border: none; padding: 12px 28px; border-radius: 10px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; gap: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-generate:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(58,123,213,0.3);
    }
    .btn-generate:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
      border-radius: 50%; animation: spin 0.6s linear infinite;
    }
    .success-msg {
      background: #f0fff4; color: #38a169; padding: 12px 16px; border-radius: 8px;
      font-size: 13px; border: 1px solid #c6f6d5; margin-top: 16px;
    }
    .error-msg {
      background: #fff5f5; color: #e53e3e; padding: 12px 16px; border-radius: 8px;
      font-size: 13px; border: 1px solid #fed7d7; margin-top: 16px;
    }
    .no-data { text-align: center; color: #aaa; padding: 20px 0; }

    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ReportsComponent implements OnInit {
  loading = true;
  summary: PortfolioSummary | null = null;
  allocationData: { [key: string]: AllocationItem } = {};
  allocationKeys: string[] = [];
  generating = false;
  reportSuccess = '';
  reportError = '';

  reportRequest = {
    type: 'performance',
    period: 'monthly',
    format: 'pdf'
  };

  private allocColors: { [key: string]: string } = {
    stocks: '#3a7bd5', bonds: '#00c853', cash: '#ff9800',
    equity: '#7c4dff', debt: '#26c6da', gold: '#ffd600',
  };

  constructor(
    private portfolioService: PortfolioService,
    private analyticsService: AnalyticsService,
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
    forkJoin({
      summary: this.portfolioService.getSummary(),
      allocation: this.analyticsService.getAssetAllocation(),
    }).subscribe({
      next: (res) => {
        this.summary = res.summary.data;
        this.allocationData = res.allocation.data || {};
        this.allocationKeys = Object.keys(this.allocationData);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getAllocColor(key: string): string {
    return this.allocColors[key.toLowerCase()] || '#888';
  }

  generateReport(): void {
    this.generating = true;
    this.reportSuccess = '';
    this.reportError = '';
    this.reportsService.generateReport(this.reportRequest).subscribe({
      next: (res) => {
        this.generating = false;
        this.reportSuccess = `Report generated successfully! Report ID: ${res.data.reportId}. Status: ${res.data.status}`;
      },
      error: (err) => {
        this.generating = false;
        this.reportError = err.error?.message || 'Failed to generate report. Please try again.';
      }
    });
  }
}
