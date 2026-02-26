import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { HoldingsService } from '../../core/services/holdings.service';
import { Holding, CreateHoldingRequest } from '../../core/models';

@Component({
  selector: 'app-holdings',
  standalone: true,
  imports: [CommonModule, FormsModule, InrPipe],
  template: `
    <div class="holdings-page">
      <div class="page-header">
        <div>
          <h2>Portfolio Holdings</h2>
          <p class="subtitle">Track your current stock positions</p>
        </div>
        <button class="btn-add" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? '✕ Cancel' : '+ Add Holding' }}
        </button>
      </div>

      <!-- Add Holding Form -->
      @if (showAddForm) {
        <div class="add-form-card">
          <h3>Add New Holding</h3>
          <form (ngSubmit)="addHolding()" class="add-form">
            <div class="form-row">
              <div class="form-group">
                <label>Stock Symbol (NSE)</label>
                <input type="text" [(ngModel)]="newHolding.symbol" name="symbol"
                       placeholder="e.g., TCS, INFY, RELIANCE" required
                       style="text-transform: uppercase" />
              </div>
              <div class="form-group">
                <label>Quantity</label>
                <input type="number" [(ngModel)]="newHolding.quantity" name="quantity"
                       placeholder="No. of shares" min="1" required />
              </div>
              <div class="form-group">
                <label>Purchase Price (₹)</label>
                <input type="number" [(ngModel)]="newHolding.purchasePrice" name="purchasePrice"
                       placeholder="Buy price per share" min="0.01" step="0.01" required />
              </div>
              <div class="form-group">
                <label>Purchase Date</label>
                <input type="date" [(ngModel)]="newHolding.purchaseDate" name="purchaseDate" required />
              </div>
            </div>
            @if (formError) {
              <div class="error-msg">{{ formError }}</div>
            }
            @if (formSuccess) {
              <div class="success-msg">{{ formSuccess }}</div>
            }
            <button type="submit" class="btn-submit" [disabled]="saving">
              {{ saving ? 'Adding...' : 'Add to Portfolio' }}
            </button>
          </form>
        </div>
      }

      <!-- Summary Strip -->
      @if (!loading && holdings.length > 0) {
        <div class="summary-strip">
          <div class="strip-item">
            <span class="strip-label">Total Holdings</span>
            <span class="strip-value">{{ holdings.length }}</span>
          </div>
          <div class="strip-item">
            <span class="strip-label">Total Invested</span>
            <span class="strip-value">{{ totalInvested | inr }}</span>
          </div>
          <div class="strip-item">
            <span class="strip-label">Current Value</span>
            <span class="strip-value">{{ totalCurrentValue | inr }}</span>
          </div>
          <div class="strip-item">
            <span class="strip-label">Overall P&L</span>
            <span class="strip-value" [class.positive]="totalPnL >= 0" [class.negative]="totalPnL < 0">
              {{ totalPnL | inr }}
            </span>
          </div>
        </div>
      }

      <!-- Holdings Table -->
      @if (loading) {
        <div class="loading-state">
          <div class="loader"></div>
          <p>Loading holdings...</p>
        </div>
      } @else if (holdings.length === 0) {
        <div class="empty-state">
          <span class="empty-icon">💼</span>
          <h3>No Holdings Yet</h3>
          <p>Start building your portfolio by adding your first stock holding.</p>
          <button class="btn-add" (click)="showAddForm = true">+ Add Your First Holding</button>
        </div>
      } @else {
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Avg. Buy Price</th>
                <th>Current Price</th>
                <th>Total Cost</th>
                <th>Current Value</th>
                <th>P&L</th>
                <th>P&L %</th>
              </tr>
            </thead>
            <tbody>
              @for (h of holdings; track h.id) {
                <tr>
                  <td><span class="symbol-tag">{{ h.symbol }}</span></td>
                  <td>{{ h.quantity }}</td>
                  <td>{{ h.purchasePrice | inr }}</td>
                  <td>{{ h.currentPrice | inr }}</td>
                  <td>{{ h.totalCost | inr }}</td>
                  <td>{{ h.currentValue | inr }}</td>
                  <td>
                    <span [class.positive]="h.pnL >= 0" [class.negative]="h.pnL < 0">
                      {{ h.pnL | inr }}
                    </span>
                  </td>
                  <td>
                    <span class="pnl-badge" [class.positive-bg]="h.pnLPercentage >= 0" [class.negative-bg]="h.pnLPercentage < 0">
                      {{ h.pnLPercentage >= 0 ? '+' : '' }}{{ h.pnLPercentage | number:'1.2-2' }}%
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .holdings-page { max-width: 1200px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
    }
    .page-header h2 { font-size: 24px; color: #1a1a2e; margin: 0; }
    .subtitle { color: #666; font-size: 14px; margin-top: 4px; }
    .btn-add {
      background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
      color: #fff; border: none; padding: 10px 20px; border-radius: 10px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-add:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(58,123,213,0.3);
    }

    .add-form-card {
      background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #f0f0f0;
    }
    .add-form-card h3 { margin: 0 0 16px 0; font-size: 16px; color: #1a1a2e; }
    .add-form { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .form-group label {
      display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: #555;
    }
    .form-group input {
      width: 100%; padding: 10px 12px; background: #f7f8fa; border: 2px solid #e8ecf0;
      border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box;
    }
    .form-group input:focus { border-color: #3a7bd5; background: #fff; }
    .btn-submit {
      align-self: flex-start; background: linear-gradient(135deg, #00c853, #69f0ae);
      color: #fff; border: none; padding: 10px 24px; border-radius: 8px;
      font-size: 14px; font-weight: 600; cursor: pointer;
    }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .error-msg {
      background: #fff5f5; color: #e53e3e; padding: 8px 12px; border-radius: 6px;
      font-size: 13px; border: 1px solid #fed7d7;
    }
    .success-msg {
      background: #f0fff4; color: #38a169; padding: 8px 12px; border-radius: 6px;
      font-size: 13px; border: 1px solid #c6f6d5;
    }

    .summary-strip {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
    }
    .strip-item {
      background: #fff; padding: 16px 20px; border-radius: 12px;
      display: flex; flex-direction: column; gap: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .strip-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .strip-value { font-size: 18px; font-weight: 700; color: #1a1a2e; }

    .loading-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 60px 0; color: #888;
    }
    .loader {
      width: 36px; height: 36px;
      border: 3px solid #e8ecf0; border-top-color: #3a7bd5;
      border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      text-align: center; padding: 60px 0; color: #888;
    }
    .empty-icon { font-size: 48px; }
    .empty-state h3 { margin: 12px 0 4px; color: #333; }
    .empty-state p { margin-bottom: 20px; }

    .table-card {
      background: #fff; border-radius: 16px; overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #f0f0f0;
    }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      text-align: left; padding: 14px 16px; font-size: 11px; color: #888;
      text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc;
      border-bottom: 1px solid #eee;
    }
    .data-table td {
      padding: 14px 16px; font-size: 13px; color: #333;
      border-bottom: 1px solid #f5f5f5;
    }
    .data-table tbody tr:hover td { background: #f7f8fa; }
    .symbol-tag {
      background: #e8f4fd; color: #3a7bd5; padding: 4px 12px;
      border-radius: 6px; font-weight: 600; font-size: 12px;
    }
    .positive { color: #00c853; }
    .negative { color: #ff5252; }
    .pnl-badge {
      padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
    }
    .positive-bg { background: rgba(0,200,83,0.1); color: #00c853; }
    .negative-bg { background: rgba(255,82,82,0.1); color: #ff5252; }

    @media (max-width: 900px) {
      .form-row { grid-template-columns: 1fr 1fr; }
      .summary-strip { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class HoldingsComponent implements OnInit {
  holdings: Holding[] = [];
  loading = true;
  showAddForm = false;
  saving = false;
  formError = '';
  formSuccess = '';
  newHolding: CreateHoldingRequest = { symbol: '', quantity: 0, purchasePrice: 0, purchaseDate: '' };

  totalInvested = 0;
  totalCurrentValue = 0;
  totalPnL = 0;

  constructor(private holdingsService: HoldingsService) {}

  ngOnInit(): void {
    this.loadHoldings();
  }

  loadHoldings(): void {
    this.loading = true;
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
    this.totalInvested = this.holdings.reduce((sum, h) => sum + h.totalCost, 0);
    this.totalCurrentValue = this.holdings.reduce((sum, h) => sum + h.currentValue, 0);
    this.totalPnL = this.holdings.reduce((sum, h) => sum + h.pnL, 0);
  }

  addHolding(): void {
    if (!this.newHolding.symbol || !this.newHolding.quantity || !this.newHolding.purchasePrice || !this.newHolding.purchaseDate) {
      this.formError = 'Please fill in all fields';
      return;
    }
    this.saving = true;
    this.formError = '';
    this.formSuccess = '';
    const req = { ...this.newHolding, symbol: this.newHolding.symbol.toUpperCase() };
    this.holdingsService.createHolding(req).subscribe({
      next: (res) => {
        this.saving = false;
        this.formSuccess = 'Holding added successfully!';
        this.newHolding = { symbol: '', quantity: 0, purchasePrice: 0, purchaseDate: '' };
        this.loadHoldings();
        setTimeout(() => { this.showAddForm = false; this.formSuccess = ''; }, 1500);
      },
      error: (err) => {
        this.saving = false;
        this.formError = err.error?.message || 'Failed to add holding.';
      }
    });
  }
}
