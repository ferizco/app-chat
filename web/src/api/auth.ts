import type { LoginResp } from '../types/auth';
import { http } from './http';

export async function login(username: string, password: string): Promise<LoginResp> {
  return http<LoginResp>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export async function logout(): Promise<{ status: string }> {
  return http<{ status: string }>('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}
