<template>
  <div
    class="sidebar-wrapper"
    :class="selectedPlan ? 'sidebar-wide' : ''"
  >
    <a @click="goBack" class="back-btn" v-if="canGoBack">Back</a>
    <h5 class="my-3">{{ currentPage }}</h5>
    <hr class="mb-1" />
    <slot></slot>
  </div>
  <br />
</template>

<script>
import { usePlanStore } from "@/stores/planStore.js";

export default {
  props: {
    currentPage: {
      type: String,
      default: "",
    },
    offset: {
      type: Number,
      default: 0,
    },
    canGoBack: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["goBack"],
  inheritAttrs: false,
  methods: {
    goBack() {
      this.$emit("goBack");
    },
  },
  computed: {
    selectedPlan() {
      return usePlanStore().getPlan();
    },
  },
};
</script>

<style>
.sidebar-wrapper {
  background-color: var(--color-background-secondary);
  padding: 20px;
  position: fixed;
  width: 100%;
  bottom: var(--menu-height);
  z-index: 80;
  height: 40%;
  overflow-y: auto;

  @media (min-width: 577px) {
    position: relative;
    width: 250px;
    height: 100%;
    bottom: 0px;
  }
}

.badge {
  background-color: var(--primary);
}

.sidebar-wide {
  min-width: 300px;
}
</style>
