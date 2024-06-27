<template>
  <div class="middle-form-wrapper" v-if="showInput">
    What is your starting location?
    <form class="middle-form">
      <input
        class="form-control"
        type="text"
        placeholder="Enter location"
        autofocus
        v-model="startLoc"
      />
      <button @click="addLocation" class="btn">Done</button>
    </form>
  </div>
  <ul class="mb-auto middle-info">
    <li v-if="!showInput">
      <h6>Your starting location</h6>
      <div class="middle-form">
        <span class="location">{{ startLoc }}</span>
        <button @click="editLocation" class="btn">Edit</button>
      </div>
    </li>
  </ul>
  <slot></slot>
  <button class="btn" disabled>Meet in the middle!</button>
</template>

<script>
export default {
  data() {
    return {
      showInput: !this.startLocation,
      startLoc: this.startLocation ?? "",
    };
  },
  props: {
    numMembers: Number,
    startLocation: String,
  },
  methods: {
    addLocation() {
      if (this.startLoc?.trim()) {
        this.showInput = false;
        this.$emit("add-location", this.startLoc);
      }
    },
    editLocation() {
      this.showInput = true;
      this.$emit("clear-location");
    },
  },
};
</script>

<style>
.middle-form-wrapper {
  margin: 10px 0px;
}
.middle-form {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100%;
}
.middle-info {
  margin-top: 20px;
  padding: 0;
  list-style: none;
}
.location {
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
}
</style>
