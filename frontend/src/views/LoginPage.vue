<template>
  <div id="layout" class="login-background">
    <LoginForm class="login-container"></LoginForm>
    </div>
    <div>
    <GoogleLoginForm></GoogleLoginForm>
  </div>
</template>

<script>
import GoogleLoginForm from "@/components/GoogleLoginForm.vue";
import LoginForm from "../components/LoginForm.vue";
export default {
  components: {
    LoginForm,
    GoogleLoginForm
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
