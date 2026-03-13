import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ChatRequest {
  message: string;
  userId?: string;
  authToken?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  conversation: Array<{
    role: string;
    content: string;
    updateType?: string;
  }>;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class ChatAdvisorService {
  private apiUrl = environment.chatApiUrl + '/api/chat';

  constructor(private http: HttpClient, private authService: AuthService) {}

  sendMessage(request: ChatRequest): Observable<ChatResponse> {
    const token = this.authService.getToken();
    const req = {
      ...request,
      authToken: token || undefined
    };
    return this.http.post<ChatResponse>(this.apiUrl, req);
  }

  connectStream(sessionId: string): EventSource {
    return new EventSource(`${environment.chatApiUrl}/api/chat/stream/${sessionId}`);
  }
}
