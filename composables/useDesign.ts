import { computed } from 'vue';

export type DesignName = 'ledger' | 'classic';

export const DESIGNS: DesignName[] = ['ledger', 'classic'];

export const DESIGN_COOKIE = 'trakli-design';

const DEFAULT_DESIGN: DesignName = 'ledger';

export const isDesign = (value: unknown): value is DesignName =>
  typeof value === 'string' && (DESIGNS as string[]).includes(value);

export function useDesign() {
  const cookie = useCookie<string | null>(DESIGN_COOKIE, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/'
  });

  // Shared state, not the cookie, is the source of truth: on the server every useCookie()
  // call reads the request header separately, so a value set by one caller is invisible to
  // the layout and the server renders a different shell than the client hydrates.
  const current = useState<DesignName>(DESIGN_COOKIE, () =>
    isDesign(cookie.value) ? cookie.value : DEFAULT_DESIGN
  );

  const design = computed<DesignName>(() => current.value);

  function setDesign(next: DesignName) {
    if (!isDesign(next)) return;
    current.value = next;
    cookie.value = next;
  }

  function applyQuery(value: unknown) {
    const candidate = Array.isArray(value) ? value[0] : value;
    if (isDesign(candidate) && current.value !== candidate) {
      setDesign(candidate);
    }
  }

  return {
    design,
    isLedger: computed(() => design.value === 'ledger'),
    setDesign,
    applyQuery
  };
}
