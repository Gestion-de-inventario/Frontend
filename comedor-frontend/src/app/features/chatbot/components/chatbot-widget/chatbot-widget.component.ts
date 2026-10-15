import { CommonModule } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatingToolsService } from '@shared/services/floating-tools.service';
import {
  ChatMessageResponse,
  ChatRole,
  ChatTable,
  ConversationState,
  DishSuggestion,
  QuickReply,
} from '../../interfaces/chatbot.interface';
import { ChatbotApiService } from '../../services/chatbot-api.service';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';
import { formatChatText } from '../../utils/chat-format';

interface UiMessage {
  role: ChatRole;
  content: string;
  html: string;
  source?: 'GEMINI' | 'LOCAL';
  suggestions?: DishSuggestion[];
  disclaimer?: string | null;
  table?: ChatTable | null;
  quickReplies?: QuickReply[];
  sources?: string[];
  /** Mensaje del usuario que falló, para ofrecer "Reintentar". */
  retry?: string;
}

interface StoredConversation {
  messages: UiMessage[];
  state: ConversationState | null;
}

const STORAGE_KEY = 'mira.conversation.v2';
const MAX_STORED_MESSAGES = 40;

const WELCOME =
  '¡Hola! Soy **MIRA**, la asistente del comedor. 😊\n' +
  'Pregúntame con tus palabras, como le escribirías a una compañera. ' +
  'También puedes tocar el 🎤 y hablarme.';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
})
export class ChatbotWidgetComponent {
  private readonly chatbotApi = inject(ChatbotApiService);
  private readonly floatingTools = inject(FloatingToolsService);
  private readonly injector = inject(Injector);
  readonly speech = inject(SpeechRecognitionService);
  private readonly messageList = viewChild<ElementRef<HTMLElement>>('messageList');
  private readonly composerInput = viewChild<ElementRef<HTMLTextAreaElement>>('composerInput');

  readonly open = computed(() => this.floatingTools.isOpen('chatbot'));
  readonly triggerHidden = computed(() => this.floatingTools.activeTool() !== null);
  readonly sending = signal(false);
  readonly voiceNotice = signal('');
  readonly messages = signal<UiMessage[]>([]);
  private conversationState: ConversationState | null = null;

  /** Los botones de respuesta solo se muestran en el último mensaje, para no saturar. */
  readonly lastAssistantIndex = computed(() => {
    const items = this.messages();
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].role === 'assistant') return i;
    }
    return -1;
  });
  readonly isFresh = computed(() => this.messages().length <= 1);

  draft = '';

  constructor() {
    this.restore();
    effect(() => {
      if (!this.open()) this.speech.cancel();
      else this.scrollToEnd();
    });
  }

  toggle(): void {
    this.floatingTools.toggle('chatbot');
  }

  close(): void {
    this.floatingTools.close('chatbot');
  }

  /** Borra la conversación y la memoria: el siguiente mensaje empieza de cero. */
  newConversation(): void {
    this.speech.cancel();
    this.conversationState = null;
    this.messages.set([this.welcome()]);
    this.persist();
    this.draft = '';
    this.voiceNotice.set('');
    this.focusComposer();
  }

  usePrompt(prompt: string): void {
    this.draft = prompt;
    this.send();
  }

  send(): void {
    const message = this.draft.trim();
    if (!message || this.sending()) return;
    this.draft = '';
    this.voiceNotice.set('');
    this.ask(message);
  }

  retry(message: string): void {
    // se quita el aviso de error y se vuelve a preguntar
    this.messages.update((items) => items.filter((item) => item.retry !== message));
    this.ask(message, false);
  }

  private ask(message: string, addUserMessage = true): void {
    const previousMessages = this.messages();
    if (addUserMessage) {
      this.messages.update((items) => [...items, this.userMessage(message)]);
    }
    this.sending.set(true);
    this.scrollToEnd();

    this.chatbotApi
      .sendMessage({
        message,
        portions: null,
        state: this.conversationState,
        history: previousMessages
          .slice(-8)
          .map(({ role, content }) => ({ role, content: content.slice(0, 1000) })),
      })
      .subscribe({
        next: (response) => this.addResponse(response),
        error: () => {
          this.messages.update((items) => [
            ...items,
            this.assistantMessage({
              content: 'No pude conectarme con el sistema en este momento. Revisa tu internet e inténtalo de nuevo.',
              retry: message,
            }),
          ]);
          this.sending.set(false);
          this.persist();
          this.scrollToEnd();
        },
      });
  }

  // ------------------------------------------------------------- micrófono

  toggleVoice(): void {
    if (this.speech.listening()) {
      this.speech.stop();
      return;
    }
    this.voiceNotice.set('');
    const before = this.draft;
    this.speech.start({
      partial: (text) => (this.draft = text),
      final: (text) => {
        this.draft = text;
        this.send();
      },
      error: (notice) => {
        this.draft = before;
        this.voiceNotice.set(notice);
      },
    });
  }

  // ------------------------------------------------------------- teclado

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

  // ------------------------------------------------------------- utilidades

  private addResponse(response: ChatMessageResponse): void {
    this.conversationState = response.state;
    this.messages.update((items) => [
      ...items,
      this.assistantMessage({
        content: response.reply,
        source: response.generatedBy,
        suggestions: response.suggestions,
        disclaimer: response.disclaimer,
        table: response.table,
        quickReplies: response.quickReplies ?? [],
        sources: response.sources ?? [],
      }),
    ]);
    this.sending.set(false);
    this.persist();
    this.scrollToEnd();
  }

  private welcome(): UiMessage {
    return this.assistantMessage({ content: WELCOME });
  }

  private userMessage(content: string): UiMessage {
    return { role: 'user', content, html: formatChatText(content) };
  }

  private assistantMessage(data: Omit<UiMessage, 'role' | 'html'>): UiMessage {
    return { role: 'assistant', ...data, html: formatChatText(data.content) };
  }

  /** La conversación se conserva al cambiar de página (solo en esta pestaña). */
  private persist(): void {
    try {
      const stored: StoredConversation = {
        messages: this.messages().slice(-MAX_STORED_MESSAGES),
        state: this.conversationState,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // sin almacenamiento disponible: la conversación vive solo mientras la página esté abierta
    }
  }

  private restore(): void {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as StoredConversation;
        if (Array.isArray(stored.messages) && stored.messages.length) {
          this.messages.set(stored.messages.map((m) => ({ ...m, html: formatChatText(m.content) })));
          this.conversationState = stored.state ?? null;
          return;
        }
      }
    } catch {
      // datos guardados inválidos: se empieza de nuevo
    }
    this.messages.set([this.welcome()]);
  }

  private focusComposer(): void {
    queueMicrotask(() => this.composerInput()?.nativeElement.focus());
  }

  /** Baja al último mensaje después de que Angular lo dibuje (tablas y botones incluidos). */
  private scrollToEnd(): void {
    afterNextRender(
      () => {
        const list = this.messageList()?.nativeElement;
        list?.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
      },
      { injector: this.injector },
    );
  }
}
