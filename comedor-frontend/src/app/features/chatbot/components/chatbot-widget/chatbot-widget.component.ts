import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatingToolsService } from '@shared/services/floating-tools.service';
import { ChatMessageResponse, ChatRole, DishSuggestion } from '../../interfaces/chatbot.interface';
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
  private readonly floatingTools = inject(FloatingToolsService);
  private readonly messageList = viewChild<ElementRef<HTMLElement>>('messageList');

  readonly open = computed(() => this.floatingTools.isOpen('chatbot'));
  readonly triggerHidden = computed(() => this.floatingTools.activeTool() !== null);
  readonly sending = signal(false);
  readonly messages = signal<UiMessage[]>([
    {
      role: 'assistant',
      content:
        'Hola, soy MIRA. Puedo consultar stock, alertas y recojos, recomendar platos y orientarte sobre el uso del sistema.',
    },
  ]);

  draft = '';

  toggle(): void {
    this.floatingTools.toggle('chatbot');
  }

  close(): void {
    this.floatingTools.close('chatbot');
  }

  usePrompt(prompt: string): void {
    this.draft = prompt;
    this.send();
  }

  send(): void {
    const message = this.draft.trim();
    if (!message || this.sending()) return;

    const previousMessages = this.messages();
    this.messages.update((items) => [...items, { role: 'user', content: message }]);
    this.draft = '';
    this.sending.set(true);
    this.scrollToEnd();

    this.chatbotApi
      .sendMessage({
        message,
        portions: null,
        history: previousMessages
          .slice(-10)
          .map(({ role, content }) => ({ role, content: content.slice(0, 1000) })),
      })
      .subscribe({
        next: (response) => this.addResponse(response),
        error: () => {
          this.messages.update((items) => [
            ...items,
            {
              role: 'assistant',
              content:
                'No pude consultar el sistema en este momento. Inténtalo de nuevo en unos segundos.',
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
