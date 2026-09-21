export type ChatRole = 'user' | 'assistant';

export interface ConversationMessage {
  role: ChatRole;
  content: string;
}

export interface ChatMessageRequest {
  message: string;
  portions: number;
  history: ConversationMessage[];
}

export interface DishSuggestion {
  dishId: number;
  dishName: string;
  possiblePortions: number;
  enoughStock: boolean;
  missingSupplies: string[];
}

export interface ChatMessageResponse {
  reply: string;
  generatedBy: 'GEMINI' | 'LOCAL';
  portionsEvaluated: number;
  suggestions: DishSuggestion[];
  disclaimer: string;
}
