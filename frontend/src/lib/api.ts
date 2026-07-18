import type { LoginResponse, User, WorkOrder } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const TOKEN_KEY = 'work_order_access_token';

class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

async function request<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);
  // Authentication belongs in this single transport boundary so pages do not
  // need to know how Bearer tokens are attached.
  if (authenticated && token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      // Notify AuthProvider so an expired/revoked session redirects to login.
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const body = await response.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new ApiError(message || 'Request failed', response.status);
  }
  return response.json() as Promise<T>;
}

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = {
  login: (email: string, password: string) => request<LoginResponse>('/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
  }, false),
  me: () => request<User>('/auth/me'),
  users: () => request<User[]>('/users'),
  workOrders: () => request<WorkOrder[]>('/work-orders'),
  workOrder: (id: string) => request<WorkOrder>(`/work-orders/${id}`),
  mutate: <T>(path: string, body?: unknown) => request<T>(path, {
    method: 'POST',
    // A new user command receives a new key. Browser/network retries of that
    // request remain safe because the backend stores the first response.
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
    body: body === undefined ? undefined : JSON.stringify(body),
  }),
};
