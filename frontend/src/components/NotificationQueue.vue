<template>
  <div v-if="notifications.length" class="notification-container">
    <div
      v-for="(notification, index) in notifications"
      :key="index"
      class="alert alert-dismissible"
      :class="notification.className"
      role="alert"
    >
      {{ notification.message }}
      <button
        type="button"
        class="btn-close small"
        data-dismiss="alert"
        aria-label="Close"
        @click="dismiss(index)"
      ></button>
    </div>
  </div>
</template>

<script>
import { useNotificationStore } from "@/stores/notificationStore.js";

export default {
  computed: {
    notifications() {
      const store = useNotificationStore();
      const start = Math.max(store.notifications.length - 10, 0);
      return store.notifications.slice(start);
    },
  },
  methods: {
    dismiss(index) {
      useNotificationStore().remove(index);
    },
  },
};
</script>

<style>
.notification-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}
</style>
