export interface ConversationMessage {
  role: 'assistant' | 'user';
  content: string;
  type: string;
}

export interface Review {
  id: string;
  storeName: string;
  date: string;
  createdAt: string;
  content: string;
  characterCount: number;
  conversation: ConversationMessage[];
}
