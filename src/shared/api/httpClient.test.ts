import { describe, it, expect, vi, beforeEach } from 'vitest';

import { HttpError } from '@/shared/lib/errors';

import { apiGet, apiPost, apiPut, apiDelete } from './httpClient';

function mockFetch(body: unknown, status = 200, statusText = 'OK') {
  const text = body === null ? '' : JSON.stringify(body);
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: vi.fn().mockResolvedValue(text),
    json: vi.fn().mockResolvedValue(body ?? {}),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('apiGet', () => {
  it('ApiSuccessResponse 형태이면 data를 언래핑해서 반환한다', async () => {
    global.fetch = mockFetch({ success: true, data: { id: 1 } });

    const result = await apiGet<{ id: number }>('/api/test');

    expect(result).toEqual({ id: 1 });
  });

  it('일반 JSON 응답은 그대로 반환한다', async () => {
    global.fetch = mockFetch([{ id: 1 }, { id: 2 }]);

    const result = await apiGet('/api/list');

    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('params를 query string으로 변환해서 fetch 호출한다', async () => {
    global.fetch = mockFetch({ success: true, data: null });

    await apiGet('/api/search', { params: { q: 'hello', page: '1' } });

    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/api/search?');
    expect(calledUrl).toContain('q=hello');
    expect(calledUrl).toContain('page=1');
  });

  it('params가 없으면 쿼리 스트링 없이 호출한다', async () => {
    global.fetch = mockFetch({ success: true, data: null });

    await apiGet('/api/test');

    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toBe('/api/test');
  });

  it('HTTP 에러 응답 시 HttpError를 throw한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: vi.fn().mockResolvedValue({
        success: false,
        error: { code: 'NOT_FOUND', message: '리소스를 찾을 수 없습니다.' },
      }),
    });

    await expect(apiGet('/api/missing')).rejects.toThrow(HttpError);
  });

  it('에러 응답에서 HttpError의 statusCode와 code가 올바르게 설정된다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: vi.fn().mockResolvedValue({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' },
      }),
    });

    const error = await apiGet('/api/secure').catch((e) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('에러 응답 body 파싱 실패 시 statusText로 메시지를 설정한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: vi.fn().mockRejectedValue(new Error('invalid json')),
    });

    const error = await apiGet('/api/broken').catch((e) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect(error.message).toBe('Internal Server Error');
    expect(error.statusCode).toBe(500);
  });

  it('빈 응답 body는 undefined를 반환한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: vi.fn().mockResolvedValue(''),
    });

    const result = await apiGet('/api/empty');

    expect(result).toBeUndefined();
  });

  it('GET 메서드로 fetch를 호출한다', async () => {
    global.fetch = mockFetch({ success: true, data: null });

    await apiGet('/api/test');

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect(options.method).toBe('GET');
  });
});

describe('apiPost', () => {
  it('body를 JSON 직렬화해서 전송한다', async () => {
    global.fetch = mockFetch({ success: true, data: { id: 1 } });
    const payload = { name: '홍길동', age: 30 };

    await apiPost('/api/users', payload);

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect(options.body).toBe(JSON.stringify(payload));
  });

  it('body가 있으면 Content-Type: application/json 헤더를 설정한다', async () => {
    global.fetch = mockFetch({ success: true, data: null });

    await apiPost('/api/users', { name: '테스트' });

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('body가 없으면 Content-Type 헤더와 body를 설정하지 않는다', async () => {
    global.fetch = mockFetch({ success: true, data: null });

    await apiPost('/api/trigger');

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect((options.headers as Record<string, string>)?.['Content-Type']).toBeUndefined();
    expect(options.body).toBeUndefined();
  });

  it('POST 메서드로 fetch를 호출한다', async () => {
    global.fetch = mockFetch({ success: true, data: null });

    await apiPost('/api/test', { data: 1 });

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect(options.method).toBe('POST');
  });

  it('빈 응답 body는 undefined를 반환한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      statusText: 'No Content',
      text: vi.fn().mockResolvedValue(''),
    });

    const result = await apiPost('/api/action');

    expect(result).toBeUndefined();
  });
});

describe('apiPut', () => {
  it('PUT 메서드로 fetch를 호출한다', async () => {
    global.fetch = mockFetch({ success: true, data: null });

    await apiPut('/api/users/1', { name: '수정됨' });

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect(options.method).toBe('PUT');
  });

  it('body를 JSON 직렬화해서 전송한다', async () => {
    global.fetch = mockFetch({ success: true, data: null });
    const payload = { name: '수정된 이름' };

    await apiPut('/api/users/1', payload);

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect(options.body).toBe(JSON.stringify(payload));
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('HTTP 에러 시 HttpError를 throw한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: vi.fn().mockResolvedValue({
        success: false,
        error: { code: 'FORBIDDEN', message: '권한이 없습니다.' },
      }),
    });

    await expect(apiPut('/api/protected', {})).rejects.toThrow(HttpError);
  });
});

describe('apiDelete', () => {
  it('DELETE 메서드로 fetch를 호출한다', async () => {
    global.fetch = mockFetch({ success: true, data: null });

    await apiDelete('/api/users/1');

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect(options.method).toBe('DELETE');
  });

  it('body 없이 DELETE 요청 시 Content-Type 헤더가 없다', async () => {
    global.fetch = mockFetch(null, 204, 'No Content');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      statusText: 'No Content',
      text: vi.fn().mockResolvedValue(''),
    });

    await apiDelete('/api/users/1');

    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect((options.headers as Record<string, string>)?.['Content-Type']).toBeUndefined();
  });

  it('HTTP 에러 시 HttpError를 throw한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: vi.fn().mockResolvedValue({
        success: false,
        error: { code: 'NOT_FOUND', message: '리소스를 찾을 수 없습니다.' },
      }),
    });

    const error = await apiDelete('/api/users/999').catch((e) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });
});
