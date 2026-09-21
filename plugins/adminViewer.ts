export default defineNuxtPlugin(() => {
  const { user } = useAuth();
  const viewer = useState<{ name: string; email: string } | null>('admin.viewer', () => null);

  watchEffect(() => {
    const current = user.value;
    viewer.value = current
      ? {
          name: [current.first_name, current.last_name].filter(Boolean).join(' ') || current.email,
          email: current.email
        }
      : null;
  });
});
