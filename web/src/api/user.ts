import axios from "axios";

type ApiResponse<T> = { status: string; message: string; data: T };
export type User = { id: string; username: string };
export type LoginResult = { token: string; user: User };

export async function login(
  username: string,
  password: string
): Promise<LoginResult> {
  const res = await axios.post<ApiResponse<LoginResult>>(
    "api/v1/user/login", // ⬅️ relatif, lewat proxy Vite
    { username, password },
    { withCredentials: true } // kalau memang perlu cookie
  );
  if (res.data.status === "success") return res.data.data;
  throw new Error(res.data.message || "Login gagal");
}
