export type ChatRole = 'user' | 'assistant';

export interface ConversationMessage {
  role: ChatRole;
  content: string;
}

/** Memoria de la conversación: el backend la devuelve y se reenvía en el siguiente mensaje. */
export interface ConversationState {
  intent: string | null;
  productId: number | null;
  productName: string | null;
  dishId: number | null;
  dishName: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  periodLabel: string | null;
  portions: number | null;
  awaiting: string | null;
}

export interface ChatMessageRequest {
  message: string;
  portions?: number | null;
  history: ConversationMessage[];
  state: ConversationState | null;
}

export interface DishSuggestion {
  dishId: number;
  dishName: string;
  possiblePortions: number;
  enoughStock: boolean;
  missingSupplies: string[];
}

/** Botón de respuesta rápida: al tocarlo se envía `message`. */
export interface QuickReply {
  label: string;
  message: string;
}

export interface ChatTable {
  columns: string[];
  rows: string[][];
  footer: string | null;
}

export interface ChatMessageResponse {
  reply: string;
  generatedBy: 'GEMINI' | 'LOCAL';
  portionsEvaluated: number;
  suggestions: DishSuggestion[];
  disclaimer: string | null;
  table: ChatTable | null;
  quickReplies: QuickReply[];
  sources: string[];
  state: ConversationState | null;
  intent: string;
  confidence: number;
}
