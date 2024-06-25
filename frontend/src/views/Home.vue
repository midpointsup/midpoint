<template>
  <Menu></Menu>
  <div id="layout">
    <Map></Map>
  </div>
</template>

<script>
import Menu from "../components/Menu.vue";
import Map from "../components/Map.vue";
import "../../node_modules/mapbox-gl/dist/mapbox-gl.css";

export default {
  components: {
    Map,
    Menu,
  },
};
</script>

<style>
#layout {
  flex: 1;
  display: flex;
  position: relative;
}
</style>
