export function getCookie(name: string) {
  const m = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[2]) : null;
}
export function setCookie(name: string, value: string, days = 7) {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; samesite=lax`;
}
export function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}
