import type { User } from '../types';

export async function getUsers(): Promise<User[]> {
  const res = await fetch('/api/users');

  if (res.status === 401) throw new Error('unauthorized');
  if (!res.ok) throw new Error(await res.text());
  
  const json = await res.json();

  return json.data;
}
