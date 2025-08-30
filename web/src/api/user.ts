import axios from "axios";

type ApiResponse<T> = { status: string; message: string; data: T };

export type User = {
  id: string;
  username: string;
};

export type LoginResult = {
  token: string;
  user: User;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
  id_alias: string;
};

export type SignupResult = {
  id: string;
  username: string;
  email: string;
  alias_name: string;
  created_at: string;
};

export type ListAliasResult = {
  id_alias: string;
  alias_name: string;
}[];

export async function login(payload: LoginPayload): Promise<LoginResult> {
  console.log(payload);
  const res = await axios.post<ApiResponse<LoginResult>>(
    "api/v1/user/login",
    payload,
    { withCredentials: true }
  );
  if (res.data.status === "success") return res.data.data;
  throw new Error(res.data.message || "Login gagal");
}

export async function signup(payload: SignupPayload): Promise<SignupResult> {
  const res = await axios.post<ApiResponse<SignupResult>>(
    "api/v1/user/create",
    payload,
    { withCredentials: true }
  );
  if (res.data.status === "success") return res.data.data;
  throw new Error(res.data.message || "Signup gagal");
}

export async function listAlias(): Promise<ListAliasResult> {
  const res = await axios.get<ApiResponse<ListAliasResult>>(
    "api/v1/user/listalias",
    { withCredentials: true }
  );
  if (res.data.status === "success") return res.data.data;
  throw new Error(res.data.message || "Gagal memuat alias");
}
