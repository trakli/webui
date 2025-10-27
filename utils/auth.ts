export function checkAuth(): boolean {
  if (typeof window === 'undefined') return false;
  const tokenCookie = useCookie('auth.token');
  return !!tokenCookie.value;
}
