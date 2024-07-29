<template>
  <div class="sidebar-wrapper">
    <h5 class="my-3">{{ currentPage }}</h5>
    <hr class="mb-1"/>
    <slot></slot>
  </div>
  <br/>
</template>

<script>
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
</style>