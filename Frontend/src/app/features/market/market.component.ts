import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { MarketService } from '../../core/services/market.service';
import { StockPrice, StockInfo } from '../../core/models';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, FormsModule, InrPipe],
  template: `
    <div class="market-page">
      <div class="page-header">
        <h2>Market Data</h2>
        <p class="subtitle">Look up Indian stock prices and information (NSE/BSE)</p>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text"
                 [(ngModel)]="searchSymbol"
                 (keyup.enter)="searchStock()"
                 placeholder="Enter stock symbol (e.g., TCS, INFY, RELIANCE)"
                 style="text-transform: uppercase" />
          <button class="btn-search" (click)="searchStock()" [disabled]="searching">
            {{ searching ? 'Searching...' : 'Search' }}
          </button>
        </div>

        <!-- Popular Stocks -->
        <div class="popular-stocks">
          <span class="popular-label">Popular:</span>
          @for (s of popularStocks; track s) {
            <button class="chip" (click)="searchSymbol = s; searchStock()">{{ s }}</button>
          }
        </div>
      </div>

      @if (error) {
        <div class="error-msg">{{ error }}</div>
      }

      <!-- Stock Info Card -->
      @if (stockInfo || stockPrice) {
        <div class="stock-detail-grid">
          @if (stockPrice) {
            <div class="stock-price-card">
              <div class="price-header">
                <div>
                  <h3 class="stock-symbol">{{ stockPrice.symbol }}</h3>
                  @if (stockInfo) {
                    <p class="stock-name">{{ stockInfo.name }}</p>
                  }
                </div>
                <div class="price-main">
                  <span class="current-price">{{ stockPrice.price | inr }}</span>
                  <span class="price-change"
                        [class.positive]="stockPrice.change >= 0"
                        [class.negative]="stockPrice.change < 0">
                    {{ stockPrice.change >= 0 ? '+' : '' }}{{ stockPrice.change | number:'1.2-2' }}
                    ({{ stockPrice.changePercent >= 0 ? '+' : '' }}{{ stockPrice.changePercent | number:'1.2-2' }}%)
                  </span>
                </div>
              </div>
              <div class="price-meta">
                <span>Last updated: {{ stockPrice.timestamp | date:'dd MMM yyyy, hh:mm a' }}</span>
              </div>
            </div>
          }

          @if (stockInfo) {
            <div class="stock-info-card">
              <h4>Stock Details</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Market Cap</span>
                  <span class="info-value">{{ formatMarketCap(stockInfo.marketCap) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">P/E Ratio</span>
                  <span class="info-value">{{ stockInfo.peRatio | number:'1.2-2' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">52-Week High</span>
                  <span class="info-value positive">{{ stockInfo['52WeekHigh'] | inr }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">52-Week Low</span>
                  <span class="info-value negative">{{ stockInfo['52WeekLow'] | inr }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Dividend Yield</span>
                  <span class="info-value">{{ stockInfo.dividendYield | number:'1.2-2' }}%</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Current Price</span>
                  <span class="info-value">{{ stockInfo.price | inr }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      } @else if (!searching && !error) {
        <div class="empty-state">
          <span class="empty-icon">📈</span>
          <h3>Search for a Stock</h3>
          <p>Enter an NSE/BSE stock symbol above to view live market data</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .market-page { max-width: 1000px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h2 { font-size: 24px; color: #1a1a2e; margin: 0; }
    .subtitle { color: #666; font-size: 14px; margin-top: 4px; }

    .search-section {
      background: #fff; border-radius: 16px; padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 24px;
    }
    .search-box {
      display: flex; align-items: center; gap: 12px;
      background: #f7f8fa; border: 2px solid #e8ecf0; border-radius: 12px;
      padding: 4px 4px 4px 16px;
    }
    .search-icon { font-size: 18px; }
    .search-box input {
      flex: 1; border: none; background: transparent; padding: 12px 0;
      font-size: 15px; outline: none; color: #333;
    }
    .btn-search {
      background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
      color: #fff; border: none; padding: 12px 24px; border-radius: 10px;
      font-size: 14px; font-weight: 600; cursor: pointer;
    }
    .btn-search:disabled { opacity: 0.6; cursor: not-allowed; }

    .popular-stocks {
      display: flex; align-items: center; gap: 8px; margin-top: 12px; flex-wrap: wrap;
    }
    .popular-label { font-size: 12px; color: #888; }
    .chip {
      background: #f0f0f0; border: 1px solid #e0e0e0; padding: 4px 12px;
      border-radius: 16px; font-size: 12px; font-weight: 600; color: #555;
      cursor: pointer; transition: all 0.2s;
    }
    .chip:hover { background: #e8f4fd; color: #3a7bd5; border-color: #3a7bd5; }

    .error-msg {
      background: #fff5f5; color: #e53e3e; padding: 12px 16px; border-radius: 10px;
      font-size: 13px; border: 1px solid #fed7d7; margin-bottom: 20px;
    }

    .stock-detail-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
    }
    .stock-price-card, .stock-info-card {
      background: #fff; border-radius: 16px; padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #f0f0f0;
    }
    .price-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 16px;
    }
    .stock-symbol { font-size: 28px; color: #1a1a2e; margin: 0; }
    .stock-name { font-size: 13px; color: #888; margin-top: 4px; }
    .price-main { text-align: right; }
    .current-price { font-size: 32px; font-weight: 700; color: #1a1a2e; display: block; }
    .price-change {
      font-size: 14px; font-weight: 600; padding: 4px 10px;
      border-radius: 6px; display: inline-block; margin-top: 4px;
    }
    .positive { color: #00c853; }
    .negative { color: #ff5252; }
    .positive.price-change { background: rgba(0,200,83,0.1); }
    .negative.price-change { background: rgba(255,82,82,0.1); }
    .price-meta { font-size: 12px; color: #aaa; }

    .stock-info-card h4 { margin: 0 0 16px 0; font-size: 16px; color: #1a1a2e; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .info-item {
      display: flex; flex-direction: column; gap: 4px;
      padding: 12px; background: #f7f8fa; border-radius: 10px;
    }
    .info-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 15px; font-weight: 700; color: #1a1a2e; }

    .empty-state { text-align: center; padding: 80px 0; color: #888; }
    .empty-icon { font-size: 48px; }
    .empty-state h3 { margin: 12px 0 4px; color: #333; }

    @media (max-width: 768px) {
      .stock-detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class MarketComponent {
  searchSymbol = '';
  searching = false;
  error = '';
  stockPrice: StockPrice | null = null;
  stockInfo: StockInfo | null = null;
  popularStocks = ['TCS', 'INFY', 'RELIANCE', 'HDFCBANK', 'WIPRO', 'ITC', 'SBIN', 'BHARTIARTL'];

  constructor(private marketService: MarketService) {}

  searchStock(): void {
    const symbol = this.searchSymbol.trim().toUpperCase();
    if (!symbol) return;
    this.searching = true;
    this.error = '';
    this.stockPrice = null;
    this.stockInfo = null;

    this.marketService.getStockPrice(symbol).subscribe({
      next: (res) => {
        this.stockPrice = res.data;
        this.marketService.getStockInfo(symbol).subscribe({
          next: (infoRes) => {
            this.stockInfo = infoRes.data;
            this.searching = false;
          },
          error: () => { this.searching = false; }
        });
      },
      error: (err) => {
        this.searching = false;
        this.error = err.error?.message || `Could not find data for "${symbol}". Please check the symbol.`;
      }
    });
  }

  formatMarketCap(value: number): string {
    if (value >= 1e12) return `₹${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `₹${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)}Cr`;
    if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)}L`;
    return `₹${value}`;
  }
}
