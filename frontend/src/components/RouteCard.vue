<template>
  <div class="container">
    <h6 class="card-content">{{ route.summary }}</h6>
    <div class="description-container">
      <span class="form-text mode-icon" :class="`mode-${mode.toLowerCase()}`">
      </span>
      <span class="form-text"> {{ route.legs[0].duration.text }}, </span>
      <span class="form-text">
        {{ route.legs[0].distance.text }}
      </span>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    route: Object,
    destination: String,
    mode: String,
  },
  methods: {},
};
</script>

<style>
.container {
  padding: 10px;
}
.profile-border {
  border: 3px solid;
  border-radius: 50%;
}
.description-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mode-icon {
  content: "";
  display: inline-block;
  width: 20px;
  height: 20px;
  background-repeat: no-repeat;
  background-position: center;
}

.mode-drive {
  background-image: url("@/assets/static/DRIVE.svg");
}
.mode-transit {
  background-image: url("@/assets/static/TRANSIT.svg");
}
.mode-bike {
  background-image: url("@/assets/static/BIKE.svg");
}
.mode-walk {
  background-image: url("@/assets/static/WALK.svg");
}
</style>
