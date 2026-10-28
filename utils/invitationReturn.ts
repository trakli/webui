const INVITATION_PATH = /^\/invitations\/[A-Za-z0-9]+$/;

export function invitationPath(value: unknown): string | null {
  return typeof value === 'string' && INVITATION_PATH.test(value) ? value : null;
}

export function usePendingInvitation() {
  const cookie = useCookie<string | null>('trakli.invitation', {
    maxAge: 60 * 60 * 24,
    sameSite: 'lax'
  });

  function remember(path: string) {
    cookie.value = invitationPath(path);
  }

  function take(fallback?: unknown): string | null {
    const path = invitationPath(fallback) ?? invitationPath(cookie.value);
    cookie.value = null;
    return path;
  }

  return { remember, take };
}
