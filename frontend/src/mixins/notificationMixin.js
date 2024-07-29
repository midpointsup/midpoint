import { useNotificationStore } from "@/stores/notificationStore.js";

export const notificationMixin = {
  methods: {
    notifyError(message, persist) {
      useNotificationStore().add(message, "alert-danger", persist);
    },
    notifySuccess(message, persist) {
      useNotificationStore().add(message, "alert-success", persist);
    },
    notifyWarning(message, persist) {
      useNotificationStore().add(message, "alert-warning", persist);
    },
  },
};
