<template>
  <div id="layout" class="signup-background">
    <SignUpForm class="signup-container"></SignUpForm>
  </div>
</template>

<script>
import SignUpForm from "../components/SignUpForm.vue";
export default {
  components: {
    SignUpForm,
  },
};
</script>

<style>
.signup-container {
  margin: auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.signup-background {
  background-color: var(--secondary);
}

#layout {
  flex: 1;
  display: flex;
  position: relative;
}
</style>
