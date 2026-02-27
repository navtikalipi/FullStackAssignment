import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, interval, Subscription } from 'rxjs';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { PortfolioService } from '../../core/services/portfolio.service';
import { ReportsService } from '../../core/services/reports.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PortfolioSummary, AllocationItem } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, InrPipe],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <div class="header-left">
          <h2>Reports & Insights</h2>
          <p class="subtitle">Generate portfolio reports for tracking and tax purposes</p>
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
              <button class="btn-download" (click)="downloadLastReport()">
                📥 Download
              </button>
            </div>
          }
          @if (reportError) {
            <div class="error-msg">{{ reportError }}</div>
          }
        </div>

        <!-- Recent Reports -->
        <div class="section-card">
          <h3>📁 Recent Reports</h3>
          <p class="section-desc">Download your previously generated reports.</p>
          
          <button class="btn-refresh-reports" (click)="loadReportsList()" [disabled]="loadingReports">
            🔄 Refresh List
          </button>

          @if (reportsList.length > 0) {
            <div class="reports-list">
              @for (report of reportsList; track report.reportId) {
                <div class="report-item">
                  <div class="report-info">
                    <span class="report-icon">📄</span>
                    <div class="report-details">
                      <span class="report-name">{{ report.fileName }}</span>
                      <span class="report-date">{{ report.createdAt | date:'dd MMM yyyy, hh:mm a' }}</span>
                    </div>
                  </div>
                  <button class="btn-download-small" (click)="downloadReportByFileName(report.fileName, report.reportId)">
                    ⬇ Download
                  </button>
                </div>
              }
            </div>
          } @else {
            <p class="no-data">No reports generated yet</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .reports-page { max-width: 900px; margin: 0 auto; }
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
      display: flex; align-items: center; gap: 12px;
    }
    .btn-download {
      background: #38a169; color: #fff; border: none; padding: 6px 12px;
      border-radius: 6px; font-size: 12px; cursor: pointer; margin-left: auto;
    }
    .btn-download:hover { background: #2f855a; }
    .error-msg {
      background: #fff5f5; color: #e53e3e; padding: 12px 16px; border-radius: 8px;
      font-size: 13px; border: 1px solid #fed7d7; margin-top: 16px;
    }
    .no-data { text-align: center; color: #aaa; padding: 20px 0; }

    .btn-refresh-reports {
      background: #f7f8fa; border: 1px solid #e8ecf0; padding: 8px 16px;
      border-radius: 8px; font-size: 13px; cursor: pointer; margin-bottom: 16px;
    }
    .btn-refresh-reports:hover { background: #e8ecf0; }
    .btn-refresh-reports:disabled { opacity: 0.6; cursor: not-allowed; }

    .reports-list { display: flex; flex-direction: column; gap: 12px; }
    .report-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; background: #f7f8fa; border-radius: 10px;
    }
    .report-info { display: flex; align-items: center; gap: 12px; }
    .report-icon { font-size: 24px; }
    .report-details { display: flex; flex-direction: column; }
    .report-name { font-size: 13px; font-weight: 600; color: #333; }
    .report-date { font-size: 11px; color: #888; }
    .btn-download-small {
      background: #3a7bd5; color: #fff; border: none; padding: 6px 14px;
      border-radius: 6px; font-size: 12px; cursor: pointer;
    }
    .btn-download-small:hover { background: #2d6cc4; }

    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ReportsComponent implements OnInit, OnDestroy {
  loading = true;
  loadingReports = false;
  summary: PortfolioSummary | null = null;
  allocationData: { [key: string]: AllocationItem } = {};
  allocationKeys: string[] = [];
  generating = false;
  reportSuccess = '';
  reportError = '';
  reportsList: any[] = [];
  lastReportId = '';
  lastReportFileName = '';

  reportRequest = {
    type: 'performance',
    period: 'monthly',
    format: 'pdf'
  };

  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 1000; // 1 second

  private allocColors: { [key: string]: string } = {
    stocks: '#3a7bd5', bonds: '#00c853', cash: '#ff9800',
    equity: '#7c4dff', debt: '#26c6da', gold: '#ffd600',
  };

  constructor(
    private portfolioService: PortfolioService,
    private analyticsService: AnalyticsService,
    private reportsService: ReportsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.getToken()) {
      this.reportError = 'Please log in to access reports.';
      this.loading = false;
      return;
    }
    
    this.loadData();
    this.loadReportsList();
    
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
      summary: this.portfolioService.getSummary(),
      allocation: this.analyticsService.getAssetAllocation(),
    }).subscribe({
      next: (res) => {
        this.summary = res.summary.data;
        this.allocationData = res.allocation.data || {};
        this.allocationKeys = Object.keys(this.allocationData);
        this.loading = false;
      },
      error: (err) => { 
        this.loading = false;
        if (err.status === 401) {
          this.reportError = 'Session expired. Please log in again.';
        }
      }
    });
  }

  loadReportsList(): void {
    this.loadingReports = true;
    this.reportsService.listReports().subscribe({
      next: (res) => {
        this.reportsList = res.data || [];
        this.loadingReports = false;
      },
      error: (err) => {
        this.loadingReports = false;
        console.error('Error loading reports list:', err);
      }
    });
  }

  refreshData(): void {
    this.loading = true;
    this.loadData();
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
        this.lastReportId = res.data.reportId;
        this.lastReportFileName = res.data.fileName || '';
        const fileName = res.data.fileName || '';
        this.reportSuccess = `Report generated successfully! Report ID: ${res.data.reportId}. Format: ${fileName.endsWith('.xlsx') ? 'Excel' : 'PDF'}`;
        this.loadReportsList();
      },
      error: (err) => {
        this.generating = false;
        this.reportError = err.error?.message || 'Failed to generate report. Please try again.';
      }
    });
  }

  downloadLastReport(): void {
    if (this.lastReportId) {
      this.downloadReport(this.lastReportId);
    }
  }

  downloadReport(reportId: string): void {
    this.reportError = '';
    console.log('Downloading report:', reportId);
    
    this.reportsService.downloadReport(reportId).subscribe({
      next: (blob) => {
        console.log('Download successful, blob size:', blob.size);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Determine extension from content type
        const contentType = blob.type;
        const extension = contentType.includes('spreadsheet') || contentType.includes('excel') ? 'xlsx' : 'pdf';
        link.download = `${reportId}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download error:', err);
        this.reportError = 'Failed to download report: ' + (err.message || 'Please try again. Make sure you are logged in.');
      }
    });
  }

  downloadReportByFileName(fileName: string, reportId: string): void {
    this.reportError = '';
    console.log('Downloading report by filename:', fileName, reportId);
    
    this.reportsService.downloadReport(reportId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download error:', err);
        this.reportError = 'Failed to download report: ' + (err.message || 'Please try again. Make sure you are logged in.');
      }
    });
  }
}
