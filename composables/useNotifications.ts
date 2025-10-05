import { ref, readonly } from 'vue';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

// Global state for notifications and modals
const notifications = ref<Notification[]>([]);
const isConfirmModalOpen = ref(false);
const confirmModalData = ref<
  ConfirmOptions & {
    resolve: (value: boolean) => void;
  }
>({
  title: '',
  message: '',
  resolve: () => {}
});

export const useNotifications = () => {
  // Add a notification
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      id,
      duration: 5000, // 5 seconds default
      ...notification
    };

    notifications.value.push(newNotification);

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  // Remove a notification
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  // Clear all notifications
  const clearNotifications = () => {
    notifications.value = [];
  };

  // Show success notification
  const showSuccess = (title: string, message?: string, duration?: number) => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  };

  // Show error notification
  const showError = (title: string, message?: string, duration?: number) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: duration || 7000 // Errors stay longer
    });
  };

  // Show warning notification
  const showWarning = (title: string, message?: string, duration?: number) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  };

  // Show info notification
  const showInfo = (title: string, message?: string, duration?: number) => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  };

  // Show confirmation modal (replaces browser confirm())
  const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmModalData.value = {
        ...options,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'warning',
        resolve
      };
      isConfirmModalOpen.value = true;
    });
  };

  // Handle confirm modal response
  const handleConfirmResponse = (confirmed: boolean) => {
    confirmModalData.value.resolve(confirmed);
    isConfirmModalOpen.value = false;
  };

  // Quick delete confirmation
  const confirmDelete = (itemName: string = 'item'): Promise<boolean> => {
    return showConfirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
  };

  return {
    // State
    notifications: readonly(notifications),
    isConfirmModalOpen: readonly(isConfirmModalOpen),
    confirmModalData: readonly(confirmModalData),

    // Methods
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    handleConfirmResponse,
    confirmDelete
  };
};
