import { ref, onMounted, onUnmounted, type Ref } from 'vue';

/**
 * A small composable that models an open/closed dropdown anchored to a
 * root element. Handles click-outside to close and Escape to close.
 *
 * Usage:
 *   const { isOpen, rootRef, toggle, close } = useDropdown();
 */
export function useDropdown(): {
  isOpen: Ref<boolean>;
  rootRef: Ref<HTMLElement | null>;
  toggle: () => void;
  open: () => void;
  close: () => void;
} {
  const isOpen = ref(false);
  const rootRef = ref<HTMLElement | null>(null);

  const open = () => {
    isOpen.value = true;
  };
  const close = () => {
    isOpen.value = false;
  };
  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as Node | null;
    if (rootRef.value && target && !rootRef.value.contains(target)) {
      close();
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen.value) {
      close();
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('keydown', handleKeydown);
  });

  return { isOpen, rootRef, toggle, open, close };
}
