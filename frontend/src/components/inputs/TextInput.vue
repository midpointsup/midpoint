<template>
  <div class="form-floating">
    <input
      :type="type"
      class="form-control text-overflow"
      :id="id"
      :name="name"
      :placeholder="placeholder"
      required
      :autocomplete="autocomplete"
    />
    <label :for="id" class="d-inline-block text-truncate w-100">{{
      label
    }}</label>
    <div class="invalid-feedback">{{ feedback }}</div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    feedback: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
  },
  computed: {
    autocomplete() {
      return this.type === "password" ? "current-password" : "off";
    },
  },
};
</script>
