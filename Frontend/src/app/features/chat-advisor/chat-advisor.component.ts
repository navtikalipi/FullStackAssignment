import { Component, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { AuthService, ChatAdvisorService, ChatRequest, ChatResponse, MarketService } from '../../core/services';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  isLive?: boolean;
}

@Component({
  selector: 'app-chat-advisor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <h2>Chat Advisor</h2>
        <p>Your AI stock market assistant</p>
      </div>
      <div class="chat-messages" #messagesContainer>
        @for (msg of messages(); track msg.timestamp) {
          <div class="message {{msg.role}}" [class.live]="msg.isLive">
            <div class="message-content">{{msg.content}}</div>
            <span class="message-time">{{msg.timestamp | date:'short'}}</span>
          </div>
        }
      </div>
      <div class="chat-input-container">
        <input 
          #input 
          [(ngModel)]="inputMessage" 
          (keyup.enter)="sendMessage()"
          placeholder="Ask about stocks, buy/sell shares, get live prices..."
          class="chat-input">
        <button (click)="sendMessage()" [disabled]="!inputMessage.trim() || isLoading()">
          {{isLoading() ? 'Sending...' : 'Send'}}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--color-bg);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }
    .chat-header {
      text-align: center;
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--color-border);
    }
    .chat-header h2 {
      margin: 0 0 var(--space-1) 0;
      color: var(--color-text);
    }
    .chat-header p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-4);
      gap: var(--space-3);
      display: flex;
      flex-direction: column;
    }
    .message {
      display: flex;
      flex-direction: column;
      max-width: 80%;
      animation: fadeIn 0.3s ease;
    }
    .message.user {
      align-self: flex-end;
      background: var(--color-primary);
      color: white;
    }
    .message.ai {
      align-self: flex-start;
      background: var(--color-surface);
      color: var(--color-text);
    }
    .message.live {
      border-left: 3px solid var(--color-profit);
      animation: pulseLive 2s infinite;
    }
    .message-content {
      padding: var(--space-3);
      border-radius: var(--space-2);
      margin-bottom: var(--space-1);
      white-space: pre-wrap;
      line-height: 1.5;
    }
    .message-time {
      font-size: 0.7rem;
      opacity: 0.6;
      align-self: flex-end;
    }
    .chat-input-container {
      display: flex;
      gap: var(--space-2);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
    }
    .chat-input {
      flex: 1;
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--space-2);
      background: var(--color-surface);
      color: var(--color-text);
    }
    .chat-input:focus {
      outline: none;
      border-color: var(--color-primary);
    }
    button {
      padding: var(--space-3) var(--space-5);
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--space-2);
      cursor: pointer;
      font-weight: 500;
      min-width: 80px;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulseLive {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `]
})
export class ChatAdvisorComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private chatService = inject(ChatAdvisorService);
  private marketService = inject(MarketService);

  messages = signal<ChatMessage[]>([]);
  inputMessage = '';
  isLoading = signal(false);
  private sessionId = Date.now().toString();
  private stream: EventSource | null = null;

  ngOnInit() {
    this.connectLiveUpdates();
  }

  ngOnDestroy() {
    if (this.stream) {
      this.stream.close();
    }
  }

  sendMessage() {
    if (!this.inputMessage.trim() || this.isLoading()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: this.inputMessage,
      timestamp: Date.now()
    };
    this.messages.update(msgs => [...msgs, userMsg]);
    const request: ChatRequest = { message: this.inputMessage };
    this.isLoading.set(true);

    this.chatService.sendMessage(request).subscribe({
      next: (response: ChatResponse) => {
        if (response.success && response.conversation) {
          const aiMsg: ChatMessage = {
            role: 'ai',
            content: response.conversation[response.conversation.length - 1].content,
            timestamp: response.timestamp
          };
          this.messages.update(msgs => [...msgs, aiMsg]);
        }
        this.isLoading.set(false);
        this.inputMessage = '';
        this.scrollToBottom();
      },
      error: (err: any) => {
        console.error('Chat error', err);
        this.isLoading.set(false);
      }
    });
  }

  private connectLiveUpdates() {
    this.stream = this.chatService.connectStream(this.sessionId);
    if (this.stream) {
      this.stream.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'price_update') {
            // Update latest messages with live prices
            const liveMsg: ChatMessage = {
              role: 'ai',
              content: `🔔 Live update: ${data.symbol} price changed at ${new Date(data.timestamp).toLocaleTimeString()}`,
              timestamp: data.timestamp,
              isLive: true
            };
            this.messages.update(msgs => [...msgs.slice(0, -1), liveMsg, ...msgs.slice(-1)]);
          }
        } catch (e) {
          console.error('Stream parse error', e);
        }
      };
      this.stream.addEventListener('error', () => {
        console.warn('Stream error, reconnecting...');
      });
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.chat-messages');
      container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }, 100);
  }
}
