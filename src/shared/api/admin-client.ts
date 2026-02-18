import { apiGet, apiPost, apiPut, apiDelete } from './http-client';

export function createAdminClient(password: string) {
  const headers = { 'X-Admin-Password': password };

  return {
    get: <T>(path: string, params?: Record<string, string>) =>
      apiGet<T>(path, { params, headers }),

    post: <T>(path: string, body?: unknown) =>
      apiPost<T>(path, body, { headers }),

    put: <T>(path: string, body?: unknown) =>
      apiPut<T>(path, body, { headers }),

    delete: <T>(path: string, body?: unknown) =>
      apiDelete<T>(path, body, { headers }),
  };
}
