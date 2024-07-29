import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notifications", {
  state: () => ({
    notifications: [],
  }),
  actions: {
    add(message, className = "alert-primary") {
      this.notifications.push({ message, className });
      setTimeout(() => {
        this.notifications.shift();
      }, 3000);
    },
    remove(index) {
      const offset = Math.max(this.notifications.length - 10, 0);
      this.notifications.splice(offset + index, 1);
    },
  },
});
