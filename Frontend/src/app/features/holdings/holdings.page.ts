import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../core/services/portfolio.service';
import { PortfolioSummary } from '../../core/models/portfolio.model';

@Component({
  selector: 'app-holdings',
  templateUrl: './holdings.page.html',
  imports: [CommonModule, FormsModule]
})
export class HoldingsPage implements OnInit {

  portfolios: PortfolioSummary[] = [];
  selectedPortfolioId: number | null = null;
  loading = false;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.loadPortfolios();
  }

  private loadPortfolios(): void {
    this.loading = true;
    this.portfolioService.getSummaries().subscribe({
      next: (data) => {
        this.portfolios = data;
        if (this.portfolios.length > 0) {
          this.selectedPortfolioId = this.portfolios[0].id;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onPortfolioChange(): void {
    // Portfolio changed - could reload holdings
  }
}
