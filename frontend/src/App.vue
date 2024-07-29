<template>
  <RouterView />
  <NotificationQueue />
</template>

<script>
import NotificationQueue from "@/components/NotificationQueue.vue";
export default {
  components: {
    NotificationQueue,
  },
};
</script>

<style></style>
