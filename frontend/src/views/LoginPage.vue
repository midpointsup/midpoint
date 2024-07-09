<template>
  <div id="layout" class="login-background">
    <div class="container login-container">
      <div class="row">
        <LoginForm class=""></LoginForm>
      </div>
      <div class="row">
        <GoogleLoginForm class=""></GoogleLoginForm>
      </div>
    </div>
  </div>
</template>

<script>
import GoogleLoginForm from "@/components/GoogleLoginForm.vue";
import LoginForm from "../components/LoginForm.vue";
export default {
  components: {
    LoginForm,
    GoogleLoginForm,
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
