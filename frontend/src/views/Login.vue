<template>
  <div id="layout" class="login-background">
    <LoginForm class="login-container"></LoginForm>
  </div>
</template>

<script>
import LoginForm from "../components/LoginForm.vue";
export default {
  components: {
    LoginForm,
  },
};
</script>

<style>
.login-container {
  margin: auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.login-background {
  background-color: var(--secondary);
}

#layout {
  flex: 1;
  display: flex;
  position: relative;
}
</style>
