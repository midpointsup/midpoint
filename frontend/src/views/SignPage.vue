<template>
  <div class="sign-background">
    <div class="sign-container">
      <SignUpForm v-if="isSignUp"></SignUpForm>
      <SignInForm v-else></SignInForm>
      <hr />
      <GoogleLoginForm>{{ title }} with Google</GoogleLoginForm>
      <p>
        {{ msg }}
        <RouterLink :to="to">{{ link }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<script>
import SignInForm from "@/components/forms/SignInForm.vue";
import SignUpForm from "@/components/forms/SignUpForm.vue";
import GoogleLoginForm from "@/components/forms/GoogleLoginForm.vue";
export default {
  components: {
    SignInForm,
    SignUpForm,
    GoogleLoginForm,
  },
  props: {
    type: "up" | "in",
  },
  computed: {
    isSignUp() {
      return this.type === "up";
    },
    title() {
      return this.isSignUp ? "Sign up" : "Sign in";
    },
    msg() {
      return this.isSignUp
        ? "Already have an account?"
        : "Don't have an account?";
    },
    to() {
      const to = this.isSignUp ? "/signin" : "/signup";
      this.$emit("update:type", this.isSignUp ? "in" : "up");
      return to;
    },
    link() {
      return this.isSignUp ? "Sign in" : "Sign up";
    },
  },
};
</script>

<style>
.sign-container {
  width: 100%;
  padding: 20px;
  background-color: var(--color-background);
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (min-width: 768px) {
    width: 70%;
    max-height: 750px;

    & > * {
      width: calc(60% - 40px);
      margin: 20px;
    }

    &::after {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      width: 40%;
      height: 100%;
      background-image: url("@/assets/static/map.png");
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
      box-shadow: inset 10px 0 15px -10px rgba(0, 0, 0, 0.1);
    }
  }
}

.sign-background {
  flex: 1;
  display: flex;
  background-color: var(--primary);
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}
</style>
