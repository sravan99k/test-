export interface GeminiMessage {
  role: 'user' | 'model' | 'assistant';
  parts: string;
}

export interface GenerateResponseParams {
  prompt: string;
  chatHistory: GeminiMessage[];
}
