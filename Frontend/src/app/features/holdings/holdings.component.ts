import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { HoldingsService } from '../../core/services/holdings.service';
import { Holding } from '../../core/models';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-holdings',
  standalone: true,
  imports: [CommonModule, InrPipe],
  template: `
    <div class="holdings-page">
      <div class="page-header">
        <div>
          <h2>Portfolio Holdings</h2>
          <p class="subtitle">Your current stock positions (auto-updated from transactions)</p>
        </div>
        <div class="live-indicator">
          <span class="live-dot"></span> Live
        </div>
      </div>

      <!-- Auto-refresh notice -->
      <div class="auto-notice">
        <span class="info-icon">ℹ️</span>
        Holdings are automatically updated from your buy/sell transactions. Market prices refresh every second.
      </div>

      <!-- Holdings Table -->
      <div class="table-card">
        @if (loading) {
          <div class="loading">Loading holdings...</div>
        } @else if (holdings.length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <h3>No Holdings Yet</h3>
            <p>Start by buying stocks from the Transactions page. Your holdings will appear here automatically.</p>
          </div>
        } @else {
          <!-- Summary Strip -->
          <div class="summary-strip">
            <div class="summary-item">
              <span class="label">Total Invested</span>
              <span class="value">₹{{ totalInvested | inr }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Current Value</span>
              <span class="value">₹{{ totalCurrentValue | inr }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total P&L</span>
              <span class="value" [class.positive]="totalPnL >= 0" [class.negative]="totalPnL < 0">
                {{ totalPnL >= 0 ? '+' : '' }}₹{{ totalPnL | inr }}
              </span>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Avg Cost</th>
                <th>Current Price</th>
                <th>Total Cost</th>
                <th>Current Value</th>
                <th>P&L</th>
                <th>P&L %</th>
              </tr>
            </thead>
            <tbody>
              @for (holding of holdings; track holding.id) {
                <tr>
                  <td><span class="symbol-tag">{{ holding.symbol }}</span></td>
                  <td>{{ holding.quantity }}</td>
                  <td>₹{{ holding.purchasePrice | inr }}</td>
                  <td class="live-price">₹{{ holding.currentPrice | inr }}</td>
                  <td>₹{{ holding.totalCost | inr }}</td>
                  <td>₹{{ holding.currentValue | inr }}</td>
                  <td [class.positive]="holding.pnL >= 0" [class.negative]="holding.pnL < 0">
                    {{ holding.pnL >= 0 ? '+' : '' }}₹{{ holding.pnL | inr }}
                  </td>
                  <td>
                    <span class="pnl-badge" 
                          [class.positive-bg]="holding.pnLPercentage >= 0" 
                          [class.negative-bg]="holding.pnLPercentage < 0">
                      {{ holding.pnLPercentage >= 0 ? '+' : '' }}{{ holding.pnLPercentage | number:'1.2-2' }}%
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .holdings-page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #1a1a2e; }
    .subtitle { margin: 4px 0 0; color: #666; font-size: 14px; }
    .live-indicator { display: flex; align-items: center; gap: 6px; color: #00c853; font-weight: 600; font-size: 12px; }
    .live-dot { width: 8px; height: 8px; background: #00c853; border-radius: 50%; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    
    .auto-notice { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #e8f4fd; border-radius: 8px; margin-bottom: 16px; color: #3a7bd5; font-size: 13px; }
    .info-icon { font-size: 16px; }
    
    .table-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .loading, .empty-state { padding: 60px 40px; text-align: center; color: #666; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-state h3 { margin: 0 0 8px; color: #1a1a2e; }
    .empty-state p { margin: 0; color: #666; font-size: 14px; }
    
    .summary-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 20px 24px; background: #f8f9fa; border-bottom: 1px solid #eee; }
    .summary-item { display: flex; flex-direction: column; gap: 4px; }
    .summary-item .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-item .value { font-size: 20px; font-weight: 700; color: #1a1a2e; }
    
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 14px 16px; background: #f8f9fa; font-weight: 600; color: #444; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f5f5f5; }
    .data-table tbody tr:hover td { background: #f7f8fa; }
    
    .symbol-tag { background: #e8f4fd; color: #3a7bd5; padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; }
    .live-price { font-weight: 600; color: #00c853; }
    .positive { color: #00c853; }
    .negative { color: #ff5252; }
    .pnl-badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .positive-bg { background: rgba(0,200,83,0.1); color: #00c853; }
    .negative-bg { background: rgba(255,82,82,0.1); color: #ff5252; }

    @media (max-width: 900px) {
      .summary-strip { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class HoldingsComponent implements OnInit, OnDestroy {
  holdings: Holding[] = [];
  loading = true;

  totalInvested = 0;
  totalCurrentValue = 0;
  totalPnL = 0;

  private refreshSubscription?: Subscription;

  constructor(private holdingsService: HoldingsService) {}

  ngOnInit(): void {
    this.loadHoldings();
    
    // Auto-refresh every second for live prices
    this.refreshSubscription = interval(1000).subscribe(() => {
      this.loadHoldings();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  loadHoldings(): void {
    this.holdingsService.getHoldings().subscribe({
      next: (res) => {
        this.holdings = res.data || [];
        this.calculateTotals();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  calculateTotals(): void {
    this.totalInvested = this.holdings.reduce((sum, h) => sum + (h.totalCost || 0), 0);
    this.totalCurrentValue = this.holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
    this.totalPnL = this.totalCurrentValue - this.totalInvested;
  }
}
