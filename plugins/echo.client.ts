import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Real-time transport for chat streaming. Without a configured Reverb key the
// app runs fine on polling alone, so this is a no-op provider in that case.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const key = config.public.reverbKey as string;

  if (!key) {
    return { provide: { echo: null as Echo<'reverb'> | null } };
  }

  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

  const apiBase = config.public.apiBase as string;
  // The broadcasting-auth route sits at the API host root, not under /api/v1.
  const authEndpoint = apiBase.replace(/\/api\/v1\/?$/, '') + '/broadcasting/auth';
  const token = useCookie('auth.token').value;

  const echo = new Echo<'reverb'>({
    broadcaster: 'reverb',
    key,
    wsHost: config.public.reverbHost as string,
    wsPort: Number(config.public.reverbPort),
    wssPort: Number(config.public.reverbPort),
    forceTLS: config.public.reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint,
    auth: { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  });

  return { provide: { echo } };
});
