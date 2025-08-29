import type { Alias } from '../types/alias';
import type { LoginResp, SignupResp } from '../types/auth';
import type { User } from '../types/user';
import { http } from './http';

type Users = { status: string; message: string; data: User[] };
type Aliases = { status: string; message: string; data: Alias[] };

export async function signup(name: string, username: string, email:string, pass:string, id_alias:string): Promise<SignupResp> {
  return http<SignupResp>('/api/v1/user/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, username, email, pass, id_alias}),
  });
}

export async function login(username: string, password: string): Promise<LoginResp> {
  return http<LoginResp>('/api/v1/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export async function logout(): Promise<{ status: string }> {
  return http<{ status: string }>('/api/v1/user/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getAlias(): Promise<Alias[]> {
  const res = await http<Aliases>('/api/v1/user/listalias');

  return res.data;
}

export async function getUsers(): Promise<User[]> {
  const res = await http<Users>('/api/v1/user/listusers');
  return res.data;
}


