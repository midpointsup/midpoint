<template>
  <form
    class="signin-form needs-validation"
    @submit.prevent="signin"
    novalidate
    ref="form"
  >
    <h2 class="mt-5 mb-4">Sign In</h2>
    <p>Welcome back to Midpoint!</p>
    <TextInput
      id="username"
      name="username"
      placeholder="Username"
      label="Username"
      feedback="Username required"
    />
    <TextInput
      id="password"
      name="password"
      placeholder="Password"
      label="Password"
      feedback="Password required"
    />
    <button type="submit" class="btn py-2">Sign In</button>
  </form>
</template>

<script>
import userService from "@/services/user-service.js";
import TextInput from "@/components/TextInput.vue";
import { useUserStore } from "@/stores/userStore.js";

export default {
  components: {
    TextInput,
  },
  methods: {
    signin(event) {
      const form = this.$refs.form;
      const router = this.$router;
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        userService
          .signin(form.username.value, form.password.value)
          .then(function (res) {
            if (res.error) {
              console.error("Handle invalid credentials and other errors");
              return;
            }
            const userStore = useUserStore();
            userStore.setUser(res);
            router.push("/");
          });
      }
      form.classList.add("was-validated");
    },
  },
};
</script>

<style></style>
