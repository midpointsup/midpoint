<template>
  <form
    class="signup-form needs-validation"
    @submit.prevent="signup"
    novalidate
    ref="form"
  >
    <h2 class="mt-5 mb-4">Sign Up</h2>
    <p>Get started with Midpoint!</p>
    <div class="row gap-2 mx-0">
      <TextInput
        class="col p-0"
        id="username"
        name="username"
        placeholder="Username"
        label="Username"
        feedback="Username required"
      />
      <TextInput
        class="col p-0"
        id="email"
        name="email"
        placeholder="Email"
        label="Email"
        feedback="Email required"
      />
    </div>
    <TextInput
      id="password"
      name="password"
      placeholder="Password"
      label="Password"
      feedback="Password required"
    />
    <TextInput
      id="reEnterPassword"
      name="reEnterPassword"
      placeholder="Re-Enter Password"
      label="Re-Enter Password"
      feedback="Password required"
    />
    <button type="submit" class="btn py-2">Create Account</button>
  </form>
</template>

<script>
import TextInput from "@/components/TextInput.vue";
import userService from "@/services/user-service.js";
import { useUserStore } from "@/stores/userStore.js";

export default {
  components: {
    TextInput,
  },
  methods: {
    signup(event) {
      const form = this.$refs.form;
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.reEnterPassword.setCustomValidity("");
      if (form.password.value.trim() !== form.reEnterPassword.value.trim()) {
        form.reEnterPassword.setCustomValidity("Passwords do not match.");
        form.reEnterPassword.reportValidity();
        event.preventDefault();
        event.stopPropagation();
      } else {
        const router = this.$router;
        userService
          .signup(form.username.value, form.email.value, form.password.value)
          .then(function (res) {
            if (res.error) {
              console.error("Handle already existing user and other errors");
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
