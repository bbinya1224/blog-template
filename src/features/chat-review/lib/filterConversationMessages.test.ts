import { describe, it, expect } from 'vitest';
import { filterConversationMessages } from './filterConversationMessages';
import type { ChatMessage } from '@/entities/chat-message';

function createMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: '1',
    role: 'user',
    type: 'text',
    content: '안녕하세요',
    timestamp: new Date(),
    ...overrides,
  };
}

describe('filterConversationMessages', () => {
  it('빈 배열을 입력하면 빈 배열을 반환한다', () => {
    expect(filterConversationMessages([])).toEqual([]);
  });

  it('loading 타입 메시지를 제외한다', () => {
    const messages = [
      createMessage({ id: '1', type: 'text', content: '일반 메시지' }),
      createMessage({ id: '2', type: 'loading', content: '로딩 중' }),
    ];

    const result = filterConversationMessages(messages);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('일반 메시지');
  });

  it('review-preview 타입 메시지를 제외한다', () => {
    const messages = [
      createMessage({ id: '1', type: 'text', content: '일반 메시지' }),
      createMessage({ id: '2', type: 'review-preview', content: '미리보기 내용' }),
    ];

    const result = filterConversationMessages(messages);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('일반 메시지');
  });

  it('내용이 공백만 있는 메시지를 제외한다', () => {
    const messages = [
      createMessage({ id: '1', type: 'text', content: '실제 내용' }),
      createMessage({ id: '2', type: 'text', content: '   ' }),
      createMessage({ id: '3', type: 'text', content: '' }),
    ];

    const result = filterConversationMessages(messages);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('실제 내용');
  });

  it('유효한 메시지를 role, content, type 필드만 포함한 ConversationMessage로 변환한다', () => {
    const messages = [
      createMessage({
        id: 'msg-1',
        role: 'assistant',
        type: 'text',
        content: '답변입니다',
        options: [],
        metadata: { key: 'value' },
      }),
    ];

    const result = filterConversationMessages(messages);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      role: 'assistant',
      content: '답변입니다',
      type: 'text',
    });
    expect(result[0]).not.toHaveProperty('id');
    expect(result[0]).not.toHaveProperty('timestamp');
    expect(result[0]).not.toHaveProperty('metadata');
  });

  it('loading과 review-preview를 제외한 모든 타입의 메시지를 포함한다', () => {
    const messages = [
      createMessage({ id: '1', type: 'text', content: '텍스트' }),
      createMessage({ id: '2', type: 'choice', content: '선택지' }),
      createMessage({ id: '3', type: 'summary', content: '요약' }),
      createMessage({ id: '4', type: 'loading', content: '로딩' }),
      createMessage({ id: '5', type: 'review-preview', content: '미리보기' }),
    ];

    const result = filterConversationMessages(messages);

    expect(result).toHaveLength(3);
    expect(result.map((m) => m.type)).toEqual(['text', 'choice', 'summary']);
  });
});
