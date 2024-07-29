<template>
  <UseDraggable
    v-for="(popup, index) in popups"
    :key="index"
    :class="popup.show ? 'popup' : 'hidden'"
    @move="(pos) => handleMove(index, pos)"
    :style="getPopupStyle(index, popup.pos)"
    ref="popupElement"
    :initial-value="popup.pos"
  >
    <button
      v-if="popup.key !== 'routeview'"
      @click="handleClose(index)"
      class="btn-close small popup-close"
    ></button>
    <component :is="popup.component" class="mt-4"></component>
  </UseDraggable>
</template>

<script>
import { UseDraggable } from "@vueuse/components";
import { useBoundingStore } from "@/stores/offsetStore.js";
import { useElementBounding } from "@vueuse/core";
import { usePopupStore } from "@/stores/popupStore.js";

export default {
  components: {
    UseDraggable,
  },
  data() {
    return {
      popups: usePopupStore().getPopups(),
      popupBounds: [],
    };
  },
  computed: {
    offset() {
      const layoutBounds = useBoundingStore().getBounding("layout");
      return layoutBounds?.width ?? 0;
    },
  },
  mounted() {
    for (let i = 0; i < this.popups.length; i++) {
      this.popupBounds.push(useElementBounding(this.$refs.popupElement[i]));
    }
  },
  methods: {
    getPopupWidth(index) {
      return this.popupBounds[index]?.width ?? 0;
    },
    getPopupHeight(index) {
      return this.popupBounds[index]?.height ?? 0;
    },
    getPopupStyle(index, { x, y }) {
      const left = Math.min(
        Math.max(x - window.innerWidth + this.offset, 10),
        this.offset - this.getPopupWidth(index) - 10
      );
      const top = Math.min(
        Math.max(y, 10),
        window.innerHeight - this.getPopupHeight(index) - 10
      );
      return {
        left: `${left}px`,
        top: `${top}px`,
      };
    },
    handleMove(index, pos) {
      usePopupStore().move(index, pos);
    },
    handleClose(index) {
      console.log("HELLOOOOO CLICKEDDDDDDD")
      usePopupStore().hide(index);
    },
  },
};
</script>

<style>
.popup {
  position: absolute;
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 100;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-height: 90%;
  overflow-y: auto;
}

.hidden {
  display: none;
}

.popup-close {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
