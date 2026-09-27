import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { environment } from '@env/environment';
import { ChatMessageRequest, ChatMessageResponse } from '../interfaces/chatbot.interface';

@Injectable({ providedIn: 'root' })
export class ChatbotApiService {
  private readonly http = inject(HttpClient);

  sendMessage(request: ChatMessageRequest) {
    return this.http.post<ChatMessageResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.CHATBOT.MESSAGE}`,
      request,
    );
  }
}
