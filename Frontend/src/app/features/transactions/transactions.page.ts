import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionsService } from '../../core/services/transactions.service';
import { PortfolioService } from '../../core/services/portfolio.service';
import { Transaction, TransactionRequest } from '../../core/models/transaction.model';
import { PortfolioSummary } from '../../core/models/portfolio.model';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  imports: [CommonModule, FormsModule]
})
export class TransactionsPage implements OnInit {

  transactions: Transaction[] = [];
  portfolios: PortfolioSummary[] = [];
  selectedPortfolioId: number | null = null;
  loading = false;
  submitting = false;
  errorMessage = '';
  showAddModal = false;
  
  newTransaction: TransactionRequest = {
    symbol: '',
    transactionType: 'BUY',
    quantity: 0,
    price: 0,
    transactionDate: new Date().toISOString().split('T')[0]
  };

  constructor(
    private transactionsService: TransactionsService,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit(): void {
    this.loadPortfolios();
  }

  private loadPortfolios(): void {
    this.errorMessage = '';
    this.portfolioService.getSummaries().subscribe({
      next: (data) => {
        this.portfolios = data;
        if (this.portfolios.length > 0) {
          this.selectedPortfolioId = this.portfolios[0].id;
          this.loadTransactions();
        }
      },
      error: (error) => {
        this.errorMessage = error?.message || 'Unable to load portfolios. Check backend server status.';
      }
    });
  }

  onPortfolioChange(): void {
    if (this.selectedPortfolioId) {
      this.loadTransactions();
    }
  }

  loadTransactions(): void {
    if (!this.selectedPortfolioId) return;
    
    this.loading = true;
    this.errorMessage = '';
    this.transactionsService.getByPortfolio(this.selectedPortfolioId).subscribe({
      next: (data: Transaction[]) => {
        this.transactions = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.message || 'Unable to load transactions.';
        this.loading = false;
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.newTransaction = {
      symbol: '',
      transactionType: 'BUY',
      quantity: 0,
      price: 0,
      transactionDate: new Date().toISOString().split('T')[0]
    };
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  addTransaction(): void {
    if (!this.selectedPortfolioId) return;
    if (!this.newTransaction.symbol?.trim()) {
      this.errorMessage = 'Stock symbol is required.';
      return;
    }
    if (this.newTransaction.quantity <= 0 || this.newTransaction.price <= 0) {
      this.errorMessage = 'Quantity and price must be greater than zero.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    const request: TransactionRequest = {
      ...this.newTransaction,
      symbol: this.newTransaction.symbol.trim().toUpperCase()
    };
    
    this.transactionsService.create(this.selectedPortfolioId, request).subscribe({
      next: () => {
        this.loadTransactions();
        this.closeAddModal();
        this.submitting = false;
      },
      error: (error) => {
        this.errorMessage = error?.message || 'Unable to create transaction.';
        this.submitting = false;
      }
    });
  }

  deleteTransaction(id: number): void {
    if (!this.selectedPortfolioId) return;
    
    this.errorMessage = '';
    this.transactionsService.delete(this.selectedPortfolioId, id).subscribe({
      next: () => this.loadTransactions(),
      error: (error) => {
        this.errorMessage = error?.message || 'Unable to delete transaction.';
      }
    });
  }
}
