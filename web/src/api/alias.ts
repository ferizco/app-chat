
import type { Alias } from '../types/alias';
import { http } from './http';

type Aliases = { status: string; message: string; data: Alias[] };

export async function getAlias(): Promise<Alias[]> {
  const res = await http<Aliases>('/api/alias');
  console.log(res)
  return res.data;
}