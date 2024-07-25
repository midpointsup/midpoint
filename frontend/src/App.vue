<template>
  <RouterView />
  <NotificationQueue />
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import NotificationQueue from "@/components/NotificationQueue.vue";
export default {
  components: {
    NotificationQueue,
  },
};
</script>

<style></style>
