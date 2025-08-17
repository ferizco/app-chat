export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Accept': 'application/json', ...(init?.headers || {}) },
    ...init,
  });

  if (res.status === 401) throw new Error('unauthorized');
  if (!res.ok) throw new Error(await res.text());

  return res.json() as Promise<T>;
}
