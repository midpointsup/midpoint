<template>
  <form
    class="needs-validation d-flex flex-column gap-3"
    @submit.prevent="signin"
    novalidate
    ref="form"
  >
    <h2 class="mt-5">Sign In</h2>
    <p class="mb-1">Welcome back to Midpoint!</p>
    <span class="invalid-feedback" :class="isHidden"
      >Incorrect username or password</span
    >
    <TextInput
      id="username"
      name="username"
      placeholder="Username"
      label="Username"
      :feedback="feedback.username"
    />
    <TextInput
      id="password"
      name="password"
      placeholder="Password"
      label="Password"
      :feedback="feedback.password"
      type="password"
    />
    <button type="submit" class="btn py-2">Sign In</button>
  </form>
</template>

<script>
import userService from "@/services/user-service.js";
import TextInput from "@/components/inputs/TextInput.vue";
import { useUserStore } from "@/stores/userStore.js";
import { notificationMixin } from "@/mixins/notificationMixin.js";

export default {
  mixins: [notificationMixin],
  components: {
    TextInput,
  },
  data() {
    return {
      feedback: {
        username: "Username required",
        password: "Password required",
      },
      error: false,
    };
  },
  methods: {
    signin() {
      const form = this.$refs.form;
      const router = this.$router;
      const userStore = useUserStore();
      const onSuccess = () =>
        this.notifySuccess("Account created successfully!");
      const showError = () => {
        this.feedback.username = "";
        this.feedback.password = "";
        form.username.classList.add("is-invalid");
        form.password.classList.add("is-invalid");
        this.error = true;
      };
      this.resetFeedback();
      if (form.checkValidity()) {
        userService
          .signin(form.username.value, form.password.value)
          .then(function (res) {
            if (res.error) {
              showError(res.error);
            } else {
              onSuccess();
              form.classList.add("was-validated");
              userStore.setUser(res);
              router.push("/");
            }
          });
      } else {
        form.classList.add("was-validated");
      }
    },
    resetValidity(event) {
      event.target?.classList.remove("is-invalid");
    },
    resetFeedback() {
      const form = this.$refs.form;
      form.classList.remove("was-validated");
      form.username.classList.remove("is-invalid");
      form.password.classList.remove("is-invalid");
      this.feedback.username = "Username required";
      this.feedback.password = "Password required";
      this.error = false;
    },
  },
  computed: {
    isHidden() {
      return this.error ? "d-block" : "";
    },
  },
};
</script>
