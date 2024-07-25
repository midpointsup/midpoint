<template>
  <div>Trip info</div>
</template>

<script>
import io from "socket.io-client";

export default {
  created() {
    const socket = io("https://api.midpoint.live");

    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("trip", (trip) => {
      console.log("trip");
      console.log(trip);
    });
  },
};
</script>

<style></style>
