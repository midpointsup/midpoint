<template>
  <MenuComponent></MenuComponent>
  <div id="layout">
    <MapComponent></MapComponent>
  </div>
  <TripInfo></TripInfo>
</template>

<script>
import MenuComponent from "@/components/MenuComponent.vue";
import MapComponent from "@/components/MapComponent.vue";
import "@/../node_modules/mapbox-gl/dist/mapbox-gl.css";
import TripInfo from "@/components/TripInfo.vue";

export default {
  components: {
    MapComponent,
    MenuComponent,
    TripInfo,
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
