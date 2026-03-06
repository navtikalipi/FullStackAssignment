import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletService, WalletResponse } from '../../../core/services/wallet.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="wallet-section">
          <div class="balance-display">
            <span class="balance-label">Wallet Balance:</span>
            <span class="balance-amount">₹{{ balance | number:'1.2-2' }}</span>
          </div>
          <div class="wallet-actions">
            <button class="btn-action btn-deposit" (click)="openModal('deposit')">
              <span class="icon">+</span> Deposit
            </button>
            <button class="btn-action btn-withdraw" (click)="openModal('withdraw')">
              <span class="icon">−</span> Withdraw
            </button>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ modalType === 'deposit' ? 'Deposit' : 'Withdraw' }} Funds</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="current-balance">
              Current Balance: <strong>₹{{ balance | number:'1.2-2' }}</strong>
            </div>
            <div class="form-group">
              <label for="amount">Amount (₹)</label>
              <input 
                type="number" 
                id="amount" 
                [(ngModel)]="amount" 
                placeholder="Enter amount"
                min="1"
                step="100"
              />
            </div>
            <div class="quick-amounts">
              <button (click)="setAmount(1000)">+₹1,000</button>
              <button (click)="setAmount(5000)">+₹5,000</button>
              <button (click)="setAmount(10000)">+₹10,000</button>
              <button (click)="setAmount(50000)">+₹50,000</button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Cancel</button>
            <button 
              class="btn-confirm" 
              [disabled]="!amount || amount <= 0 || loading"
              (click)="submitTransaction()"
            >
              {{ loading ? 'Processing...' : (modalType === 'deposit' ? 'Deposit' : 'Withdraw') }}
            </button>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      position: fixed;
      bottom: 0;
      left: 240px;
      right: 0;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
      z-index: 999;
    }
    .footer-content {
      padding: 12px 24px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
    .wallet-section {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .balance-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .balance-label {
      color: #b0bec5;
      font-size: 14px;
    }
    .balance-amount {
      color: #00d2ff;
      font-size: 18px;
      font-weight: 700;
    }
    .wallet-actions {
      display: flex;
      gap: 8px;
    }
    .btn-action {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-deposit {
      background: rgba(0, 210, 255, 0.15);
      color: #00d2ff;
      border: 1px solid rgba(0, 210, 255, 0.3);
    }
    .btn-deposit:hover {
      background: rgba(0, 210, 255, 0.25);
    }
    .btn-withdraw {
      background: rgba(255, 193, 7, 0.15);
      color: #ffc107;
      border: 1px solid rgba(255, 193, 7, 0.3);
    }
    .btn-withdraw:hover {
      background: rgba(255, 193, 7, 0.25);
    }
    .icon {
      font-size: 16px;
      font-weight: bold;
    }
    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    .modal-content {
      background: #fff;
      border-radius: 12px;
      width: 400px;
      max-width: 90%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
    }
    .modal-header h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #666;
      cursor: pointer;
    }
    .modal-body {
      padding: 20px;
    }
    .current-balance {
      margin-bottom: 16px;
      color: #666;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      color: #333;
      font-weight: 500;
    }
    .form-group input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      box-sizing: border-box;
    }
    .form-group input:focus {
      outline: none;
      border-color: #00d2ff;
    }
    .quick-amounts {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .quick-amounts button {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #f5f5f5;
      color: #666;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .quick-amounts button:hover {
      background: #e0e0e0;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid #eee;
    }
    .btn-cancel {
      padding: 10px 20px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #fff;
      color: #666;
      cursor: pointer;
    }
    .btn-confirm {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      background: #00d2ff;
      color: #fff;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-confirm:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class FooterComponent implements OnInit, OnDestroy {
  balance: number = 0;
  showModal: boolean = false;
  modalType: 'deposit' | 'withdraw' = 'deposit';
  amount: number | null = null;
  loading: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private walletService: WalletService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Initialize wallet and get balance
    this.initWallet();
    
    // Subscribe to balance updates
    this.subscriptions.add(
      this.walletService.balance$.subscribe(balance => {
        this.balance = balance;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initWallet(): void {
    // Initialize wallet for user
    this.walletService.initWallet().subscribe({
      next: (response: WalletResponse) => {
        if (response.success && response.data) {
          this.balance = response.data.balance;
          this.walletService.updateBalance(this.balance);
        }
      },
      error: () => {
        // If init fails, try to get balance
        this.refreshBalance();
      }
    });
  }

  refreshBalance(): void {
    this.walletService.getBalance().subscribe({
      next: (response: WalletResponse) => {
        if (response.success && response.data) {
          this.balance = response.data.balance;
          this.walletService.updateBalance(this.balance);
        }
      },
      error: () => {
        console.error('Failed to get balance');
      }
    });
  }

  openModal(type: 'deposit' | 'withdraw'): void {
    this.modalType = type;
    this.amount = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.amount = null;
  }

  setAmount(value: number): void {
    this.amount = value;
  }

  submitTransaction(): void {
    if (!this.amount || this.amount <= 0) return;
    
    this.loading = true;
    const operation = this.modalType === 'deposit' 
      ? this.walletService.deposit(this.amount)
      : this.walletService.withdraw(this.amount);

    operation.subscribe({
      next: (response: WalletResponse) => {
        this.loading = false;
        if (response.success && response.data) {
          this.balance = response.data.newBalance || this.balance;
          this.walletService.updateBalance(this.balance);
          this.closeModal();
        } else {
          alert(response.message || 'Transaction failed');
        }
      },
      error: () => {
        this.loading = false;
        alert('Transaction failed. Please try again.');
      }
    });
  }
}

