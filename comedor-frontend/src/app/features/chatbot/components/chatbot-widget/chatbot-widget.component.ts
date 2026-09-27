import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ChatMessageResponse,
  ChatRole,
  DishSuggestion,
} from '../../interfaces/chatbot.interface';
import { ChatbotApiService } from '../../services/chatbot-api.service';

interface UiMessage {
  role: ChatRole;
  content: string;
  source?: 'GEMINI' | 'LOCAL';
  suggestions?: DishSuggestion[];
  disclaimer?: string;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
})
export class ChatbotWidgetComponent {
  private readonly chatbotApi = inject(ChatbotApiService);
  private readonly messageList = viewChild<ElementRef<HTMLElement>>('messageList');

  readonly open = signal(false);
  readonly sending = signal(false);
  readonly messages = signal<UiMessage[]>([
    {
      role: 'assistant',
      content:
        'Hola, soy MIRA. Puedo recomendar platos según el inventario y calcular si alcanzan los insumos.',
    },
  ]);

  draft = '';
  portions = 50;

  toggle(): void {
    this.open.update((value) => !value);
  }

  close(): void {
    this.open.set(false);
  }

  usePrompt(prompt: string): void {
    this.draft = prompt;
    this.send();
  }

  send(): void {
    const message = this.draft.trim();
    if (!message || this.sending() || !this.validPortions()) return;

    const previousMessages = this.messages();
    this.messages.update((items) => [...items, { role: 'user', content: message }]);
    this.draft = '';
    this.sending.set(true);
    this.scrollToEnd();

    this.chatbotApi
      .sendMessage({
        message,
        portions: Number(this.portions),
        history: previousMessages
          .slice(-10)
          .map(({ role, content }) => ({ role, content })),
      })
      .subscribe({
        next: (response) => this.addResponse(response),
        error: () => {
          this.messages.update((items) => [
            ...items,
            {
              role: 'assistant',
              content:
                'No pude consultar el inventario en este momento. Inténtalo de nuevo en unos segundos.',
            },
          ]);
          this.sending.set(false);
          this.scrollToEnd();
        },
      });
  }

  onComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  validPortions(): boolean {
    const value = Number(this.portions);
    return Number.isInteger(value) && value >= 1 && value <= 10000;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }

  private addResponse(response: ChatMessageResponse): void {
    this.messages.update((items) => [
      ...items,
      {
        role: 'assistant',
        content: response.reply,
        source: response.generatedBy,
        suggestions: response.suggestions,
        disclaimer: response.disclaimer,
      },
    ]);
    this.sending.set(false);
    this.scrollToEnd();
  }

  private scrollToEnd(): void {
    queueMicrotask(() => {
      const list = this.messageList()?.nativeElement;
      list?.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    });
  }
}
