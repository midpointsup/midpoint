<template>
  <div></div>
</template>

<script>
export default {
  mounted() {
    const socket = io();

    socket.on("trip", (trip) => {
      console.log(trip);
    });
  },
};
</script>

<style></style>
