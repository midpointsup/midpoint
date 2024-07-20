<template>
  <div class="form-floating mb-3">
    <input
      type="text"
      class="form-control"
      :id="id"
      :name="name"
      :placeholder="placeholder"
      required
    />
    <label :for="id">{{ label }}</label>
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
      required: true,
    },
  },
};
</script>
