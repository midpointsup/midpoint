import { useNotificationStore } from '@/stores/notificationStore.js';

export const notificationMixin = {
  methods: {
    notifyError(message) {
      useNotificationStore().add(message, "alert-danger");
    },
    notifySuccess(message) {
      useNotificationStore().add(message, "alert-success");
    },
    notifyWarning(message) {
      useNotificationStore().add(message, "alert-warning");
    }
  }
};