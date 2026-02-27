import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketService, StockListItem } from '../../core/services/market.service';
import { TransactionsService } from '../../core/services/transactions.service';
import { Transaction } from '../../core/models';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, FormsModule, InrPipe],
  template: `
    <div class="market-page">
      <div class="market-header">
        <div class="header-left">
          <h1>📈 Live Market Trading</h1>
          <p class="subtitle">Real-time stock trading with advanced order types</p>
        </div>
        <div class="live-indicator">
          <span class="live-dot"></span> Live
        </div>
      </div>

      <div class="market-grid">
        <!-- Left Panel: Stock List -->
        <div class="stock-list-panel">
          <div class="panel-header">
            <h3>Stocks</h3>
            <div class="search-box">
              <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()" 
                     placeholder="Search stocks..." />
            </div>
          </div>
          <div class="stock-list">
            @for (stock of filteredStocks; track stock.symbol) {
              <div class="stock-item" [class.active]="selectedStock?.symbol === stock.symbol"
                   (click)="selectStock(stock)">
                <div class="stock-info">
                  <span class="symbol">{{ stock.symbol }}</span>
                  <span class="name">{{ stock.name }}</span>
                </div>
                <div class="stock-price">
                  <span class="price">₹{{ stock.price | number:'1.2-2' }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Center Panel -->
        <div class="chart-panel">
          @if (selectedStock) {
            <div class="chart-header">
              <div class="stock-details">
                <h2>{{ selectedStock.symbol }}</h2>
                <span class="stock-name">{{ selectedStock.name }}</span>
                <span class="current-price" [class.positive]="priceChange >= 0" [class.negative]="priceChange < 0">
                  ₹{{ currentPrice | number:'1.2-2' }}
                  <span class="change">{{ priceChange >= 0 ? '+' : '' }}{{ priceChangePercent | number:'1.2-2' }}%</span>
                </span>
              </div>
            </div>

            <!-- Simulated Chart -->
            <div class="simulated-chart">
              <div class="chart-price-display">
                <span class="price-label">Current Price</span>
                <span class="price-value" [class.positive]="priceChange >= 0" [class.negative]="priceChange < 0">
                  ₹{{ currentPrice | number:'1.2-2' }}
                </span>
              </div>
              <div class="chart-bars">
                @for (bar of chartBars; track $index) {
                  <div class="chart-bar" [style.height.%]="bar.height" 
                       [class.positive]="bar.change >= 0" [class.negative]="bar.change < 0"
                       [title]="'₹' + bar.price + ' (' + (bar.change >= 0 ? '+' : '') + bar.changePercent.toFixed(2) + '%)'">
                  </div>
                }
              </div>
              <div class="chart-time-labels">
                @for (label of timeLabels; track label) {
                  <span>{{ label }}</span>
                }
              </div>
            </div>

            <!-- Quick Trade Panel -->
            <div class="quick-trade-panel">
              <div class="trade-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Order Type</label>
                    <select [(ngModel)]="orderType">
                      <option value="MARKET">Market Order</option>
                      <option value="LIMIT">Limit Order</option>
                      <option value="STOP_LOSS">Stop Loss</option>
                      <option value="STOP_LIMIT">Stop Limit</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Type</label>
                    <select [(ngModel)]="tradeType">
                      <option value="BUY">Buy</option>
                      <option value="SELL">Sell</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" [(ngModel)]="tradeQuantity" min="1" placeholder="Qty" />
                  </div>
                  @if (orderType === 'LIMIT' || orderType === 'STOP_LIMIT') {
                    <div class="form-group">
                      <label>Limit Price (₹)</label>
                      <input type="number" [(ngModel)]="limitPrice" min="0.01" step="0.01" />
                    </div>
                  }
                  @if (orderType === 'STOP_LOSS' || orderType === 'STOP_LIMIT') {
                    <div class="form-group">
                      <label>Stop Price (₹)</label>
                      <input type="number" [(ngModel)]="stopPrice" min="0.01" step="0.01" />
                    </div>
                  }
                </div>
                
                <div class="trade-summary">
                  <div class="summary-row">
                    <span>Estimated Total:</span>
                    <span class="total">₹{{ estimatedTotal | number:'1.2-2' }}</span>
                  </div>
                </div>
                
                <button class="trade-btn" [class.buy]="tradeType === 'BUY'" [class.sell]="tradeType === 'SELL'"
                        (click)="executeTrade(tradeType)" [disabled]="!tradeQuantity">
                  {{ tradeType === 'BUY' ? 'Buy' : 'Sell' }} {{ selectedStock?.symbol }}
                </button>
              </div>
            </div>
          } @else {
            <div class="no-stock-selected">
              <div class="placeholder-icon">📊</div>
              <h3>Select a Stock</h3>
              <p>Choose a stock from the list to view charts and trade</p>
            </div>
          }
        </div>

        <!-- Right Panel -->
        <div class="info-panel">
          <div class="panel-section">
            <h3>Market Stats</h3>
            @if (selectedStock) {
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="label">Open</span>
                  <span class="value">₹{{ marketStats.open | number:'1.2-2' }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">High</span>
                  <span class="value positive">₹{{ marketStats.high | number:'1.2-2' }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Low</span>
                  <span class="value negative">₹{{ marketStats.low | number:'1.2-2' }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Volume</span>
                  <span class="value">{{ marketStats.volume | number:'1.0-0' }}</span>
                </div>
              </div>
            }
          </div>

          <div class="panel-section">
            <h3>Recent Trades</h3>
            <div class="recent-trades">
              @for (txn of recentTransactions; track txn.id) {
                <div class="trade-item">
                  <span class="txn-type" [class.buy]="txn.type === 'buy'" [class.sell]="txn.type === 'sell'">
                    {{ txn.type | uppercase }}
                  </span>
                  <span class="txn-symbol">{{ txn.symbol }}</span>
                  <span class="txn-qty">{{ txn.quantity }}</span>
                  <span class="txn-price">₹{{ txn.price | number:'1.2-2' }}</span>
                </div>
              }
              @if (recentTransactions.length === 0) {
                <div class="empty-trades">No recent trades</div>
              }
            </div>
          </div>

          @if (tradeMessage) {
            <div class="trade-message" [class.success]="tradeSuccess" [class.error]="!tradeSuccess">
              {{ tradeMessage }}
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .market-page { padding: 20px; height: 100vh; display: flex; flex-direction: column; background: #0d1117; }
    
    .market-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .market-header h1 { margin: 0; color: #fff; font-size: 28px; }
    .subtitle { margin: 4px 0 0; color: #8b949e; font-size: 14px; }
    .live-indicator { display: flex; align-items: center; gap: 6px; color: #00c853; font-weight: 600; }
    .live-dot { width: 10px; height: 10px; background: #00c853; border-radius: 50%; animation: pulse 1s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

    .market-grid { display: grid; grid-template-columns: 250px 1fr 280px; gap: 16px; flex: 1; min-height: 0; }
    
    .stock-list-panel { background: #161b22; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
    .panel-header { padding: 16px; border-bottom: 1px solid #30363d; }
    .panel-header h3 { margin: 0 0 12px; color: #fff; font-size: 16px; }
    .search-box input { width: 100%; padding: 8px 12px; background: #0d1117; border: 1px solid #30363d; border-radius: 6px; color: #fff; }
    .stock-list { flex: 1; overflow-y: auto; }
    .stock-item { display: flex; justify-content: space-between; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #21262d; transition: background 0.2s; }
    .stock-item:hover { background: #21262d; }
    .stock-item.active { background: #1f6feb; }
    .stock-info { display: flex; flex-direction: column; }
    .stock-info .symbol { color: #fff; font-weight: 600; }
    .stock-info .name { color: #8b949e; font-size: 12px; }
    .stock-price .price { color: #fff; font-weight: 600; }

    .chart-panel { background: #161b22; border-radius: 12px; display: flex; flex-direction: column; padding: 16px; }
    .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .stock-details h2 { margin: 0; color: #fff; font-size: 28px; }
    .stock-details .stock-name { color: #8b949e; }
    .current-price { display: block; font-size: 32px; font-weight: 700; color: #fff; margin-top: 4px; }
    .current-price .change { font-size: 16px; margin-left: 8px; }
    .positive { color: #00c853 !important; }
    .negative { color: #ff5252 !important; }

    .simulated-chart { flex: 1; min-height: 250px; background: #0d1117; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; }
    .chart-price-display { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .price-label { color: #8b949e; }
    .price-value { font-size: 24px; font-weight: 700; }
    .chart-bars { flex: 1; display: flex; align-items: flex-end; gap: 4px; }
    .chart-bar { flex: 1; background: #30363d; border-radius: 2px 2px 0 0; min-width: 8px; transition: height 0.3s; }
    .chart-bar.positive { background: #00c853; }
    .chart-bar.negative { background: #ff5252; }
    .chart-time-labels { display: flex; justify-content: space-between; color: #8b949e; font-size: 11px; margin-top: 8px; }

    .quick-trade-panel { background: #0d1117; border-radius: 8px; padding: 16px; margin-top: 16px; }
    .trade-form .form-row { display: flex; gap: 12px; margin-bottom: 12px; }
    .form-group { flex: 1; }
    .form-group label { display: block; color: #8b949e; font-size: 12px; margin-bottom: 4px; }
    .form-group input, .form-group select { width: 100%; padding: 8px; background: #161b22; border: 1px solid #30363d; border-radius: 6px; color: #fff; }
    .trade-summary { display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid #30363d; margin-top: 12px; }
    .trade-summary .total { font-size: 20px; font-weight: 700; color: #fff; }
    .trade-btn { width: 100%; padding: 12px; border: none; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 12px; }
    .trade-btn.buy { background: #00c853; color: #fff; }
    .trade-btn.sell { background: #ff5252; color: #fff; }
    .trade-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .no-stock-selected { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #8b949e; }
    .placeholder-icon { font-size: 64px; margin-bottom: 16px; }
    .no-stock-selected h3 { color: #fff; margin: 0 0 8px; }

    .info-panel { background: #161b22; border-radius: 12px; padding: 16px; overflow-y: auto; }
    .panel-section { margin-bottom: 20px; }
    .panel-section h3 { margin: 0 0 12px; color: #fff; font-size: 14px; text-transform: uppercase; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-item .label { color: #8b949e; font-size: 12px; }
    .stat-item .value { color: #fff; font-weight: 600; }

    .recent-trades { display: flex; flex-direction: column; gap: 8px; }
    .trade-item { display: flex; align-items: center; gap: 8px; padding: 8px; background: #0d1117; border-radius: 6px; font-size: 12px; }
    .txn-type { padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 10px; }
    .txn-type.buy { background: rgba(0,200,83,0.2); color: #00c853; }
    .txn-type.sell { background: rgba(255,82,82,0.2); color: #ff5252; }
    .txn-symbol { color: #fff; font-weight: 600; flex: 1; }
    .txn-qty { color: #8b949e; }
    .txn-price { color: #fff; }
    .empty-trades { color: #8b949e; text-align: center; padding: 20px; }

    .trade-message { padding: 12px; border-radius: 8px; margin-top: 12px; text-align: center; font-weight: 600; }
    .trade-message.success { background: rgba(0,200,83,0.2); color: #00c853; }
    .trade-message.error { background: rgba(255,82,82,0.2); color: #ff5252; }
  `]
})
export class MarketComponent implements OnInit, OnDestroy {
  allStocks: StockListItem[] = [];
  filteredStocks: StockListItem[] = [];
  selectedStock: StockListItem | null = null;
  searchQuery = '';
  
  currentPrice = 0;
  priceChange = 0;
  priceChangePercent = 0;
  
  marketStats = { open: 0, high: 0, low: 0, volume: 0, week52High: 0, week52Low: 0 };
  
  chartBars: {height: number, price: number, change: number, changePercent: number}[] = [];
  timeLabels = ['-60s', '-45s', '-30s', '-15s', 'Now'];
  
  tradeType = 'BUY';
  tradeQuantity = 0;
  orderType = 'MARKET';
  limitPrice = 0;
  stopPrice = 0;
  
  recentTransactions: Transaction[] = [];
  tradeMessage = '';
  tradeSuccess = false;
  
  private refreshSubscription?: Subscription;

  constructor(
    private marketService: MarketService,
    private txnService: TransactionsService
  ) {}

  ngOnInit(): void {
    this.loadStocks();
    this.loadRecentTransactions();
    
    this.refreshSubscription = interval(1000).subscribe(() => {
      this.loadStocks();
      if (this.selectedStock) {
        this.updateChartData();
      }
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  get estimatedTotal(): number {
    const price = this.orderType === 'MARKET' ? this.currentPrice : 
                  (this.orderType === 'LIMIT' ? this.limitPrice : this.stopPrice);
    return this.tradeQuantity * price;
  }

  loadStocks(): void {
    this.marketService.getAllStocks().subscribe({
      next: (res) => {
        this.allStocks = res.data || [];
        if (!this.searchQuery) {
          this.filteredStocks = this.allStocks;
        }
        if (this.selectedStock) {
          const updated = this.allStocks.find(s => s.symbol === this.selectedStock?.symbol);
          if (updated) {
            this.priceChange = (Math.random() - 0.5) * 20;
            this.priceChangePercent = (this.priceChange / updated.price) * 100;
            this.currentPrice = updated.price;
          }
        }
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery) {
      this.filteredStocks = this.allStocks;
      return;
    }
    const q = this.searchQuery.toUpperCase();
    this.filteredStocks = this.allStocks.filter(s => 
      s.symbol.includes(q) || s.name.toUpperCase().includes(q)
    );
  }

  selectStock(stock: StockListItem): void {
    this.selectedStock = stock;
    this.currentPrice = stock.price;
    this.limitPrice = stock.price;
    this.stopPrice = stock.price;
    this.priceChange = (Math.random() - 0.5) * 20;
    this.priceChangePercent = (this.priceChange / stock.price) * 100;
    
    this.marketStats = {
      open: stock.price - Math.random() * 10,
      high: stock.price + Math.random() * 20,
      low: stock.price - Math.random() * 20,
      volume: Math.floor(Math.random() * 10000000),
      week52High: stock.price * 1.3,
      week52Low: stock.price * 0.7
    };
    
    this.generateChartBars();
  }

  generateChartBars(): void {
    this.chartBars = [];
    const basePrice = this.currentPrice;
    for (let i = 0; i < 30; i++) {
      const variation = (Math.random() - 0.5) * basePrice * 0.1;
      const price = basePrice + variation;
      const change = (Math.random() - 0.5) * 10;
      const height = 20 + Math.random() * 80;
      this.chartBars.push({ height, price, change, changePercent: change });
    }
  }

  updateChartData(): void {
    if (this.chartBars.length > 0) {
      // Remove oldest, add newest
      this.chartBars.shift();
      const change = (Math.random() - 0.5) * 10;
      const height = 20 + Math.random() * 80;
      this.chartBars.push({ 
        height, 
        price: this.currentPrice, 
        change, 
        changePercent: change 
      });
    }
  }

  loadRecentTransactions(): void {
    this.txnService.getTransactions().subscribe({
      next: (res) => {
        this.recentTransactions = (res.data || []).slice(0, 10);
      }
    });
  }

  executeTrade(type: string): void {
    if (!this.selectedStock || !this.tradeQuantity) return;
    
    this.tradeMessage = '';
    
    const req = {
      symbol: this.selectedStock.symbol,
      type: type.toLowerCase(),
      quantity: this.tradeQuantity,
      orderType: this.orderType,
      limitPrice: this.orderType === 'LIMIT' || this.orderType === 'STOP_LIMIT' ? this.limitPrice : undefined,
      stopPrice: this.orderType === 'STOP_LOSS' || this.orderType === 'STOP_LIMIT' ? this.stopPrice : undefined
    };
    
    this.txnService.createTransaction(req as any).subscribe({
      next: (res) => {
        this.tradeSuccess = true;
        this.tradeMessage = `${type === 'BUY' ? 'Bought' : 'Sold'} ${this.tradeQuantity} shares of ${this.selectedStock?.symbol}!`;
        this.tradeQuantity = 0;
        this.loadRecentTransactions();
        setTimeout(() => this.tradeMessage = '', 3000);
      },
      error: (err) => {
        this.tradeSuccess = false;
        this.tradeMessage = err.error?.message || 'Trade failed';
        setTimeout(() => this.tradeMessage = '', 3000);
      }
    });
  }
}
