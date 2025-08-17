import type { User } from '../types/user';
import { http } from './http';

type Users = { status: string; message: string; data: User[] };

export async function getUsers(): Promise<User[]> {
  const res = await http<Users>('/api/users');
  return res.data;
}
