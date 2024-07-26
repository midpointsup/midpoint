<template>
  <div class="card">
    <div class="card-body">
      <p>{{ plan.description }}</p>
      <p>${{ plan.price }}</p>
      <p>{{ plan.duration }}km</p>
      <button @click="handleClick" class="btn">Open Plan</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    plan: {
      type: Object,
      required: true,
    },
  },
  methods: {
    handleClick() {
      this.$emit("open-plan", this.plan);
    },
  },
};
</script>