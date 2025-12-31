export const useOnboardingStatus = () => {
  const cookie = useCookie('onboarding_complete', {
    default: () => '',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax'
  });

  const state = useState('onboarding_complete', () => cookie.value === 'true');

  const setComplete = () => {
    cookie.value = 'true';
    state.value = true;
  };

  const clear = () => {
    cookie.value = '';
    state.value = false;
  };

  const isComplete = computed(() => state.value || cookie.value === 'true');

  return {
    isComplete,
    setComplete,
    clear
  };
};
