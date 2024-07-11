<template>
  <MenuComponent></MenuComponent>
  <div id="layout">
    <MapComponent></MapComponent>
  </div>
</template>

<script>
import MenuComponent from "@/components/MenuComponent.vue";
import MapComponent from "@/components/MapComponent.vue";
import "@/../node_modules/mapbox-gl/dist/mapbox-gl.css";

export default {
  components: {
    MapComponent,
    MenuComponent,
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
