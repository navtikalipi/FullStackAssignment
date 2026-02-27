import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { TransactionsService } from '../../core/services/transactions.service';
import { MarketService, StockListItem } from '../../core/services/market.service';
import { Transaction, CreateTransactionRequest } from '../../core/models';
import { interval, Subscription } from 'rxjs';

interface StockSearchResult {
  symbol: string;
  name: string;
  price: number;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, InrPipe],
  template: `
    <div class="transactions-page">
      <div class="page-header">
        <div>
          <h2>Transaction History</h2>
          <p class="subtitle">Buy and sell stocks with live market data</p>
        </div>
        <div class="live-indicator">
          <span class="live-dot"></span> Live
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
              <div class="form-group stock-search-group">
                <label>Stock Symbol</label>
                <div class="stock-search-wrapper">
                  <input type="text" 
                         [(ngModel)]="stockSearchQuery" 
                         (input)="onStockSearch()"
                         (focus)="showStockDropdown = true"
                         (blur)="hideStockDropdown()"
                         name="stockSearch" 
                         placeholder="Search stocks..." 
                         required 
                         autocomplete="off" />
                  @if (selectedStock) {
                    <div class="selected-stock">
                      <span class="stock-symbol">{{ selectedStock.symbol }}</span>
                      <span class="stock-name">{{ selectedStock.name }}</span>
                      <span class="stock-price">₹{{ selectedStock.price | number:'1.2-2' }}</span>
                      <button type="button" class="clear-btn" (click)="clearSelectedStock()">✕</button>
                    </div>
                  }
                  @if (showStockDropdown && stockResults.length > 0) {
                    <div class="stock-dropdown">
                      @for (stock of stockResults; track stock.symbol) {
                        <div class="stock-option" (mousedown)="selectStock(stock)">
                          <span class="stock-symbol">{{ stock.symbol }}</span>
                          <span class="stock-name">{{ stock.name }}</span>
                          <span class="stock-price">₹{{ stock.price | number:'1.2-2' }}</span>
                        </div>
                      }
                    </div>
                  }
                </div>
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
                <input type="number" [(ngModel)]="newTxn.price" name="price" min="0.01" step="0.01" 
                       [placeholder]="selectedStock ? 'Live: ₹' + selectedStock.price : 'Auto-fetched'" 
                       [readonly]="!!selectedStock" />
                @if (selectedStock) {
                  <small class="auto-fetch-note">Price auto-fetched from live market</small>
                }
              </div>
            </div>
            @if (formError) {
              <div class="error-msg">{{ formError }}</div>
            }
            @if (formSuccess) {
              <div class="success-msg">{{ formSuccess }}</div>
            }
            <button type="submit" class="btn-submit" [disabled]="saving">
              {{ saving ? 'Processing...' : (newTxn.type === 'buy' ? 'Buy Stock' : 'Sell Stock') }}
            </button>
          </form>
        </div>
      }

      <!-- Live Price Ticker -->
      @if (livePrices.length > 0) {
        <div class="ticker-strip">
          @for (price of livePrices; track price.symbol) {
            <span class="ticker-item">
              <strong>{{ price.symbol }}</strong> ₹{{ price.price | number:'1.2-2' }}
              <span [class]="price.change >= 0 ? 'positive' : 'negative'">
                {{ price.change >= 0 ? '▲' : '▼' }} {{ price.changePercent | number:'1.2-2' }}%
              </span>
            </span>
          }
        </div>
      }

      <!-- Transaction Filters -->
      <div class="filters">
        <button [class.active]="!filterType" (click)="filterBy('')">All</button>
        <button [class.active]="filterType === 'BUY'" (click)="filterBy('BUY')">Buy</button>
        <button [class.active]="filterType === 'SELL'" (click)="filterBy('SELL')">Sell</button>
      </div>

      <!-- Transactions Table -->
      <div class="table-card">
        @if (loading) {
          <div class="loading">Loading transactions...</div>
        } @else if (transactions.length === 0) {
          <div class="empty-state">No transactions yet. Click "+ New Transaction" to start trading!</div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              @for (txn of transactions; track txn.id) {
                <tr>
                  <td>{{ txn.date | date:'dd-MMM-yyyy' }}</td>
                  <td><span class="symbol-tag">{{ txn.symbol }}</span></td>
                  <td>
                    <span class="type-badge" [class.buy-badge]="txn.type === 'buy'" [class.sell-badge]="txn.type === 'sell'">
                      {{ txn.type | uppercase }}
                    </span>
                  </td>
                  <td>{{ txn.quantity }}</td>
                  <td>₹{{ txn.price | inr }}</td>
                  <td class="total-val">₹{{ txn.total | inr }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .transactions-page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-header h2 { margin: 0; font-size: 24px; color: #1a1a2e; }
    .subtitle { margin: 4px 0 0; color: #666; font-size: 14px; }
    .live-indicator { display: flex; align-items: center; gap: 6px; color: #00c853; font-weight: 600; font-size: 12px; }
    .live-dot { width: 8px; height: 8px; background: #00c853; border-radius: 50%; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .btn-add { background: #3a7bd5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-add:hover { background: #2d63b8; }
    
    .add-form-card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .add-form-card h3 { margin: 0 0 16px; color: #1a1a2e; }
    .form-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #444; font-size: 13px; }
    .form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #3a7bd5; }
    
    .stock-search-group { position: relative; }
    .stock-search-wrapper { position: relative; }
    .stock-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #e0e0e0; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .stock-option { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; cursor: pointer; transition: background 0.2s; }
    .stock-option:hover { background: #f5f5f5; }
    .stock-option .stock-symbol { font-weight: 600; color: #3a7bd5; }
    .stock-option .stock-name { flex: 1; margin: 0 12px; color: #666; font-size: 13px; }
    .stock-option .stock-price { font-weight: 600; color: #00c853; }
    
    .selected-stock { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #e8f4fd; border-radius: 8px; margin-top: 8px; }
    .selected-stock .stock-symbol { font-weight: 700; color: #3a7bd5; }
    .selected-stock .stock-name { flex: 1; color: #666; font-size: 13px; }
    .selected-stock .stock-price { font-weight: 600; color: #00c853; }
    .selected-stock .clear-btn { background: none; border: none; color: #999; cursor: pointer; font-size: 14px; }
    .selected-stock .clear-btn:hover { color: #ff5252; }
    
    .auto-fetch-note { color: #00c853; font-size: 11px; margin-top: 4px; display: block; }
    
    .ticker-strip { display: flex; gap: 24px; padding: 12px 16px; background: #f8f9fa; border-radius: 8px; margin-bottom: 16px; overflow-x: auto; white-space: nowrap; }
    .ticker-item { font-size: 13px; display: flex; align-items: center; gap: 6px; }
    .ticker-item strong { color: #1a1a2e; }
    .ticker-item .positive { color: #00c853; }
    .ticker-item .negative { color: #ff5252; }
    
    .filters { display: flex; gap: 8px; margin-bottom: 16px; }
    .filters button { padding: 8px 16px; border: 1px solid #e0e0e0; background: white; border-radius: 20px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
    .filters button.active { background: #3a7bd5; color: white; border-color: #3a7bd5; }
    
    .table-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .loading, .empty-state { padding: 40px; text-align: center; color: #666; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 14px 16px; background: #f8f9fa; font-weight: 600; color: #444; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f5f5f5; }
    .data-table tbody tr:hover td { background: #f7f8fa; }
    .symbol-tag { background: #e8f4fd; color: #3a7bd5; padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; }
    .type-badge { padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
    .buy-badge { background: rgba(0,200,83,0.1); color: #00c853; }
    .sell-badge { background: rgba(255,82,82,0.1); color: #ff5252; }
    .total-val { font-weight: 600; color: #1a1a2e; }
    .error-msg { color: #ff5252; margin-bottom: 12px; font-size: 13px; }
    .success-msg { color: #00c853; margin-bottom: 12px; font-size: 13px; }
    .btn-submit { background: #3a7bd5; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-submit:hover:not(:disabled) { background: #2d63b8; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    @media (max-width: 900px) {
      .form-row { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  loading = true;
  showAddForm = false;
  saving = false;
  formError = '';
  formSuccess = '';
  filterType = '';
  newTxn: CreateTransactionRequest = { symbol: '', type: 'buy', quantity: 0, price: 0, date: '', fees: 0 };
  
  // Stock search
  stockSearchQuery = '';
  stockResults: StockSearchResult[] = [];
  selectedStock: StockSearchResult | null = null;
  showStockDropdown = false;
  
  // Live prices for ticker
  livePrices: {symbol: string, price: number, change: number, changePercent: number}[] = [];
  
  private refreshSubscription?: Subscription;
  private searchTimeout?: any;

  constructor(
    private txnService: TransactionsService,
    private marketService: MarketService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.loadLivePrices();
    
    // Auto-refresh every second
    this.refreshSubscription = interval(1000).subscribe(() => {
      this.loadLivePrices();
      this.loadTransactions();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  loadTransactions(): void {
    this.txnService.getTransactions(this.filterType || undefined).subscribe({
      next: (res) => {
        this.transactions = res.data || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadLivePrices(): void {
    this.marketService.getAllStocks().subscribe({
      next: (res) => {
        if (res.data) {
          this.livePrices = res.data.slice(0, 10).map((s: any) => ({
            symbol: s.symbol,
            price: s.price,
            change: (Math.random() - 0.5) * 20,
            changePercent: (Math.random() - 0.5) * 2
          }));
        }
      },
      error: () => {}
    });
  }

  filterBy(type: string): void {
    this.filterType = type;
    this.loadTransactions();
  }

  onStockSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    if (!this.stockSearchQuery || this.stockSearchQuery.length < 1) {
      this.stockResults = [];
      return;
    }
    
    this.searchTimeout = setTimeout(() => {
      this.marketService.searchStocks(this.stockSearchQuery).subscribe({
        next: (res) => {
          this.stockResults = res.data || [];
        },
        error: () => {
          this.stockResults = [];
        }
      });
    }, 300);
  }

  selectStock(stock: StockSearchResult): void {
    this.selectedStock = stock;
    this.newTxn.symbol = stock.symbol;
    this.newTxn.price = stock.price;
    this.stockSearchQuery = stock.symbol;
    this.showStockDropdown = false;
    this.stockResults = [];
  }

  clearSelectedStock(): void {
    this.selectedStock = null;
    this.newTxn.symbol = '';
    this.newTxn.price = 0;
    this.stockSearchQuery = '';
  }

  hideStockDropdown(): void {
    setTimeout(() => {
      this.showStockDropdown = false;
    }, 200);
  }

  addTransaction(): void {
    if (!this.newTxn.symbol || !this.newTxn.quantity) {
      this.formError = 'Please select a stock and enter quantity';
      return;
    }
    
    this.saving = true;
    this.formError = '';
    this.formSuccess = '';
    
    // Auto-set date to now
    const now = new Date();
    this.newTxn.date = now.toISOString().split('T')[0];
    
    // If no price provided but stock selected, use live price
    if (!this.newTxn.price && this.selectedStock) {
      this.newTxn.price = this.selectedStock.price;
    }
    
    const req = { ...this.newTxn, symbol: this.newTxn.symbol.toUpperCase() };
    this.txnService.createTransaction(req).subscribe({
      next: () => {
        this.saving = false;
        this.formSuccess = this.newTxn.type === 'buy' ? 'Stock bought successfully!' : 'Stock sold successfully!';
        this.newTxn = { symbol: '', type: 'buy', quantity: 0, price: 0, date: '', fees: 0 };
        this.clearSelectedStock();
        this.loadTransactions();
        setTimeout(() => { this.showAddForm = false; this.formSuccess = ''; }, 2000);
      },
      error: (err) => {
        this.saving = false;
        this.formError = err.error?.message || 'Failed to process transaction.';
      }
    });
  }
}
