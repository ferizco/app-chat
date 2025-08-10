import type { User } from '../types';

export async function getUsers(): Promise<User[]> {
  const res = await fetch('/api/users'); // cookie httpOnly ikut otomatis (via proxy)
  if (res.status === 401) throw new Error('unauthorized');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
