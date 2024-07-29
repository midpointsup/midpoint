<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <h6 class="card-content card-title">{{ route.summary }}</h6>
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <span class="badge">
          {{ mode }}
        </span>
      </div>
      <div class="col-4">
        <span class="badge">
          {{ route.legs[0].duration.text }}
        </span>
      </div>
      <div class="col-4">
        <span class="badge">
          {{ route.legs[0].distance.text }}
        </span>
      </div>
    </div>
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
.card-content {
  margin-left: 4px;
}
.profile-border {
  border: 3px solid;
  border-radius: 50%;
}
</style>
