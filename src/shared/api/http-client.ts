import { HttpError } from '@/shared/lib/errors';

type ApiSuccessResponse<T> = { success: true; data: T };
type ApiErrorResponse = {
  success: false;
  error: { code: string; message: string };
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = (body as ApiErrorResponse)?.error;
    throw new HttpError(
      error?.message || response.statusText,
      response.status,
      error?.code,
    );
  }

  const json: unknown = await response.json();

  if (
    typeof json === 'object' &&
    json !== null &&
    'success' in json &&
    (json as ApiSuccessResponse<T>).success === true &&
    'data' in json
  ) {
    return (json as ApiSuccessResponse<T>).data;
  }

  return json as T;
}

function buildUrl(path: string, params?: Record<string, string>): string {
  if (!params) return path;
  const query = new URLSearchParams(params).toString();
  return query ? `${path}?${query}` : path;
}

export async function apiGet<T>(
  path: string,
  options?: { params?: Record<string, string>; headers?: HeadersInit },
): Promise<T> {
  const response = await fetch(buildUrl(path, options?.params), {
    method: 'GET',
    headers: options?.headers,
  });
  return parseResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  options?: { headers?: HeadersInit },
): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(response);
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
  options?: { headers?: HeadersInit },
): Promise<T> {
  const response = await fetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(response);
}

export async function apiDelete<T>(
  path: string,
  body?: unknown,
  options?: { headers?: HeadersInit },
): Promise<T> {
  const response = await fetch(path, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(response);
}
