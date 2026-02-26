import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketDataService } from '../../core/services/marketdata.service';
import { MarketStock } from '../../core/models/stock.model';

@Component({
  selector: 'app-marketdata',
  templateUrl: './marketdata.page.html',
  imports: [CommonModule, FormsModule]
})
export class MarketdataPage {

  symbol = '';
  quote!: MarketStock;
  loading = false;
  errorMessage = '';

  constructor(private service: MarketDataService) {}

  fetchQuote(): void {
    if (!this.symbol) {
      this.errorMessage = 'Please enter a stock symbol.';
      return;
    }

    this.errorMessage = '';
    this.loading = true;
    this.service.getStockPrice(this.symbol.trim().toUpperCase()).subscribe({
      next: (data: MarketStock) => {
        this.quote = data;
        this.loading = false;
      },
      error: (error) => {
        this.quote = undefined as unknown as MarketStock;
        this.errorMessage = error?.error?.message || error?.message || 'Unable to fetch market data.';
        this.loading = false;
      }
    });
  }
}
