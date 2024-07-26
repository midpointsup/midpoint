<template>
  <UseDraggable
    v-for="(popup, index) in popups"
    :key="index"
    class="popup"
    :class="popup.show ? '' : 'hidden'"
    @move.passive="(pos) => move(index, pos)"
    :style="getPopupStyle(index, popup.pos)"
    ref="popupElement"
  >
    <button @click="hide(index)" class="btn-close small popup-close"></button>
    <component :is="popup.component" class="mt-4"></component>
  </UseDraggable>
</template>

<script>
import { popupMixin } from "@/mixins/popupMixin";
import { UseDraggable } from "@vueuse/components";
import { useBoundingStore } from "../stores/offsetStore.js";
import { useElementBounding } from "@vueuse/core";

export default {
  mixins: [popupMixin],
  components: {
    UseDraggable,
  },
  data() {
    return {
      popupBounds: [],
    };
  },
  computed: {
    offset() {
      console.log("recalculated")
      const layoutBounds = useBoundingStore().getBounding("layout");
      console.log(layoutBounds);
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
      const left = Math.min(Math.max(x - window.innerWidth + this.offset, 10), this.offset - this.getPopupWidth(index) - 10);
      const top = Math.min(Math.max(y, 10), window.innerHeight - this.getPopupHeight(index) - 10);
      return {
        left: `${left}px`,
        top: `${top}px`,
      };
    },
  }
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