<template>
  <MenuComponent></MenuComponent>
  <div id="layout" ref="layout">
    <MapComponent></MapComponent>
    <PopupContainer></PopupContainer>
  </div>
</template>

<script>
import MenuComponent from "@/components/MenuComponent.vue";
import MapComponent from "@/components/MapComponent.vue";
import PopupContainer from "@/components/PopupContainer.vue";
import "@/../node_modules/mapbox-gl/dist/mapbox-gl.css";
import { useBoundingStore } from "@/stores/offsetStore.js";

export default {
  components: {
    MapComponent,
    MenuComponent,
    PopupContainer,
  },
  mounted() {
    const boundingStore = useBoundingStore();
    boundingStore.setBounding("layout", this.$refs.layout);
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
