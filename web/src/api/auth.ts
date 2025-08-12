import type { LoginResp } from '../types';

export async function login(username: string, password: string): Promise<LoginResp> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function logout(): Promise<any> {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
