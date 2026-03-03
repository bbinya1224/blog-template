import { describe, it, expect } from 'vitest';

import { ErrorCode } from '@/shared/types/api';

import { ApiResponse } from './response';

async function parseJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe('ApiResponse.success', () => {
  it('success: true와 data를 반환한다', async () => {
    const res = ApiResponse.success({ id: 1 });
    const body = await parseJson(res);

    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: 1 });
  });

  it('기본 status는 200이다', async () => {
    const res = ApiResponse.success(null);

    expect(res.status).toBe(200);
  });

  it('message를 전달하면 응답 body에 포함된다', async () => {
    const res = ApiResponse.success({ id: 1 }, '생성 완료');
    const body = await parseJson(res);

    expect(body.message).toBe('생성 완료');
  });
});

describe('ApiResponse.created', () => {
  it('status 201을 반환한다', async () => {
    const res = ApiResponse.created({ id: 1 });

    expect(res.status).toBe(201);
  });

  it('success: true와 data를 반환한다', async () => {
    const res = ApiResponse.created({ id: 2 });
    const body = await parseJson(res);

    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: 2 });
  });
});

describe('ApiResponse.unauthorized', () => {
  it('status 401을 반환한다', () => {
    const res = ApiResponse.unauthorized();

    expect(res.status).toBe(401);
  });

  it('기본 메시지는 "인증이 필요합니다."이다', async () => {
    const res = ApiResponse.unauthorized();
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('인증이 필요합니다.');
    expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
  });

  it('커스텀 메시지로 오버라이드할 수 있다', async () => {
    const res = ApiResponse.unauthorized('로그인이 필요합니다.');
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('로그인이 필요합니다.');
  });
});

describe('ApiResponse.forbidden', () => {
  it('status 403을 반환한다', () => {
    const res = ApiResponse.forbidden();

    expect(res.status).toBe(403);
  });

  it('기본 메시지는 "권한이 없습니다."이다', async () => {
    const res = ApiResponse.forbidden();
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('권한이 없습니다.');
    expect(error.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('커스텀 메시지로 오버라이드할 수 있다', async () => {
    const res = ApiResponse.forbidden('관리자만 접근 가능합니다.');
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('관리자만 접근 가능합니다.');
  });
});

describe('ApiResponse.quotaExceeded', () => {
  it('status 403을 반환한다', () => {
    const res = ApiResponse.quotaExceeded();

    expect(res.status).toBe(403);
  });

  it('기본 메시지와 QUOTA_EXCEEDED 코드를 반환한다', async () => {
    const res = ApiResponse.quotaExceeded();
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.code).toBe(ErrorCode.QUOTA_EXCEEDED);
    expect(typeof error.message).toBe('string');
    expect((error.message as string).length).toBeGreaterThan(0);
  });

  it('커스텀 메시지로 오버라이드할 수 있다', async () => {
    const res = ApiResponse.quotaExceeded('쿼터를 초과했습니다.');
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('쿼터를 초과했습니다.');
  });
});

describe('ApiResponse.notFound', () => {
  it('status 404를 반환한다', () => {
    const res = ApiResponse.notFound();

    expect(res.status).toBe(404);
  });

  it('기본 메시지는 "리소스를 찾을 수 없습니다."이다', async () => {
    const res = ApiResponse.notFound();
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('리소스를 찾을 수 없습니다.');
    expect(error.code).toBe(ErrorCode.NOT_FOUND);
  });

  it('커스텀 메시지로 오버라이드할 수 있다', async () => {
    const res = ApiResponse.notFound('해당 게시글이 없습니다.');
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('해당 게시글이 없습니다.');
  });
});

describe('ApiResponse.validationError', () => {
  it('status 400을 반환한다', () => {
    const res = ApiResponse.validationError();

    expect(res.status).toBe(400);
  });

  it('기본 메시지는 "잘못된 요청 형식입니다."이다', async () => {
    const res = ApiResponse.validationError();
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('잘못된 요청 형식입니다.');
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
  });

  it('커스텀 메시지와 details를 반환한다', async () => {
    const details = [{ field: 'email', message: '이메일 형식이 올바르지 않습니다.' }];
    const res = ApiResponse.validationError('입력값 오류', details);
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('입력값 오류');
    expect(error.details).toEqual(details);
  });

  it('details 없이 호출할 수 있다', async () => {
    const res = ApiResponse.validationError('필수 항목 누락');
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('필수 항목 누락');
    expect(error.details).toBeUndefined();
  });
});

describe('ApiResponse.serverError', () => {
  it('status 500을 반환한다', () => {
    const res = ApiResponse.serverError();

    expect(res.status).toBe(500);
  });

  it('기본 메시지는 "서버 오류가 발생했습니다."이다', async () => {
    const res = ApiResponse.serverError();
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('서버 오류가 발생했습니다.');
    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
  });

  it('커스텀 메시지로 오버라이드할 수 있다', async () => {
    const res = ApiResponse.serverError('데이터베이스 연결 실패');
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('데이터베이스 연결 실패');
  });
});

describe('ApiResponse.timeout', () => {
  it('status 408을 반환한다', () => {
    const res = ApiResponse.timeout();

    expect(res.status).toBe(408);
  });

  it('기본 메시지는 "요청 시간이 초과되었습니다."이다', async () => {
    const res = ApiResponse.timeout();
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('요청 시간이 초과되었습니다.');
    expect(error.code).toBe(ErrorCode.TIMEOUT);
  });

  it('커스텀 메시지로 오버라이드할 수 있다', async () => {
    const res = ApiResponse.timeout('AI 응답 시간 초과');
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('AI 응답 시간 초과');
  });
});

describe('ApiResponse.rateLimitExceeded', () => {
  it('status 429를 반환한다', () => {
    const res = ApiResponse.rateLimitExceeded();

    expect(res.status).toBe(429);
  });

  it('기본 메시지와 RATE_LIMIT_EXCEEDED 코드를 반환한다', async () => {
    const res = ApiResponse.rateLimitExceeded();
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
    expect(error.message).toBe('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
  });

  it('커스텀 메시지로 오버라이드할 수 있다', async () => {
    const res = ApiResponse.rateLimitExceeded('분당 요청 한도를 초과했습니다.');
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(error.message).toBe('분당 요청 한도를 초과했습니다.');
  });
});

describe('ApiResponse.error (공통 구조)', () => {
  it('에러 응답은 success: false를 반환한다', async () => {
    const res = ApiResponse.serverError();
    const body = await parseJson(res);

    expect(body.success).toBe(false);
  });

  it('에러 응답 body는 { success, error: { code, message } } 구조를 가진다', async () => {
    const res = ApiResponse.notFound();
    const body = await parseJson(res);
    const error = body.error as Record<string, unknown>;

    expect(body).toHaveProperty('success', false);
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('message');
  });
});
