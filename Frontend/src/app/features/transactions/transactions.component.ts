import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { TransactionsService } from '../../core/services/transactions.service';
import { Transaction, CreateTransactionRequest } from '../../core/models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, InrPipe],
  template: `
    <div class="transactions-page">
      <div class="page-header">
        <div>
          <h2>Transaction History</h2>
          <p class="subtitle">Manage your buy and sell transactions</p>
        </div>
        <button class="btn-add" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? '✕ Cancel' : '+ New Transaction' }}
        </button>
      </div>

      <!-- Add Transaction Form -->
      @if (showAddForm) {
        <div class="add-form-card">
          <h3>Record New Transaction</h3>
          <form (ngSubmit)="addTransaction()" class="add-form">
            <div class="form-row">
              <div class="form-group">
                <label>Stock Symbol</label>
                <input type="text" [(ngModel)]="newTxn.symbol" name="symbol"
                       placeholder="e.g., TCS, INFY" required style="text-transform:uppercase" />
              </div>
              <div class="form-group">
                <label>Type</label>
                <select [(ngModel)]="newTxn.type" name="type" required>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div class="form-group">
                <label>Quantity</label>
                <input type="number" [(ngModel)]="newTxn.quantity" name="quantity" min="1" placeholder="Shares" required />
              </div>
              <div class="form-group">
                <label>Price (₹)</label>
                <input type="number" [(ngModel)]="newTxn.price" name="price" min="0.01" step="0.01" placeholder="Per share" required />
              </div>
              <div class="form-group">
                <label>Date</label>
                <input type="date" [(ngModel)]="newTxn.date" name="date" required />
              </div>
              <div class="form-group">
                <label>Fees (₹)</label>
                <input type="number" [(ngModel)]="newTxn.fees" name="fees" min="0" step="0.01" placeholder="Brokerage" />
              </div>
            </div>
            @if (formError) {
              <div class="error-msg">{{ formError }}</div>
            }
            @if (formSuccess) {
              <div class="success-msg">{{ formSuccess }}</div>
            }
            <button type="submit" class="btn-submit" [disabled]="saving">
              {{ saving ? 'Recording...' : 'Record Transaction' }}
            </button>
          </form>
        </div>
      }

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button class="tab" [class.active]="filterType === ''" (click)="filterBy('')">All</button>
        <button class="tab" [class.active]="filterType === 'buy'" (click)="filterBy('buy')">
          <span class="dot buy-dot"></span> Buy
        </button>
        <button class="tab" [class.active]="filterType === 'sell'" (click)="filterBy('sell')">
          <span class="dot sell-dot"></span> Sell
        </button>
      </div>

      <!-- Transactions Table -->
      @if (loading) {
        <div class="loading-state">
          <div class="loader"></div>
          <p>Loading transactions...</p>
        </div>
      } @else if (transactions.length === 0) {
        <div class="empty-state">
          <span class="empty-icon">🔄</span>
          <h3>No Transactions Found</h3>
          <p>Record your first stock transaction to get started.</p>
          <button class="btn-add" (click)="showAddForm = true">+ Record First Transaction</button>
        </div>
      } @else {
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total Value</th>
                <th>Fees</th>
              </tr>
            </thead>
            <tbody>
              @for (t of transactions; track t.id) {
                <tr>
                  <td>{{ t.date | date:'dd MMM yyyy' }}</td>
                  <td><span class="symbol-tag">{{ t.symbol }}</span></td>
                  <td>
                    <span class="type-badge" [class.buy-badge]="t.type === 'buy'" [class.sell-badge]="t.type === 'sell'">
                      {{ t.type | uppercase }}
                    </span>
                  </td>
                  <td>{{ t.quantity }}</td>
                  <td>{{ t.price | inr }}</td>
                  <td class="total-val">{{ t.total | inr }}</td>
                  <td class="fees-val">{{ t.fees | inr }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .transactions-page { max-width: 1200px; margin: 0 auto; }
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
    .form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .form-group label {
      display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: #555;
    }
    .form-group input, .form-group select {
      width: 100%; padding: 10px 12px; background: #f7f8fa; border: 2px solid #e8ecf0;
      border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box;
    }
    .form-group input:focus, .form-group select:focus { border-color: #3a7bd5; background: #fff; }
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

    .filter-tabs {
      display: flex; gap: 8px; margin-bottom: 20px;
    }
    .tab {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 18px; border-radius: 8px; border: 1px solid #e0e0e0;
      background: #fff; color: #555; font-size: 13px; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
    }
    .tab.active {
      background: #1a1a2e; color: #fff; border-color: #1a1a2e;
    }
    .dot {
      width: 8px; height: 8px; border-radius: 50%;
    }
    .buy-dot { background: #00c853; }
    .sell-dot { background: #ff5252; }

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

    .empty-state { text-align: center; padding: 60px 0; color: #888; }
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
    .type-badge {
      padding: 4px 12px; border-radius: 6px; font-size: 11px;
      font-weight: 700; letter-spacing: 0.5px;
    }
    .buy-badge { background: rgba(0,200,83,0.1); color: #00c853; }
    .sell-badge { background: rgba(255,82,82,0.1); color: #ff5252; }
    .total-val { font-weight: 600; color: #1a1a2e; }
    .fees-val { color: #888; }

    @media (max-width: 900px) {
      .form-row { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  loading = true;
  showAddForm = false;
  saving = false;
  formError = '';
  formSuccess = '';
  filterType = '';
  newTxn: CreateTransactionRequest = { symbol: '', type: 'buy', quantity: 0, price: 0, date: '', fees: 0 };

  constructor(private txnService: TransactionsService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.txnService.getTransactions(this.filterType || undefined).subscribe({
      next: (res) => {
        this.transactions = res.data || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filterBy(type: string): void {
    this.filterType = type;
    this.loadTransactions();
  }

  addTransaction(): void {
    if (!this.newTxn.symbol || !this.newTxn.quantity || !this.newTxn.price || !this.newTxn.date) {
      this.formError = 'Please fill in all required fields';
      return;
    }
    this.saving = true;
    this.formError = '';
    this.formSuccess = '';
    const req = { ...this.newTxn, symbol: this.newTxn.symbol.toUpperCase() };
    this.txnService.createTransaction(req).subscribe({
      next: () => {
        this.saving = false;
        this.formSuccess = 'Transaction recorded successfully!';
        this.newTxn = { symbol: '', type: 'buy', quantity: 0, price: 0, date: '', fees: 0 };
        this.loadTransactions();
        setTimeout(() => { this.showAddForm = false; this.formSuccess = ''; }, 1500);
      },
      error: (err) => {
        this.saving = false;
        this.formError = err.error?.message || 'Failed to record transaction.';
      }
    });
  }
}
