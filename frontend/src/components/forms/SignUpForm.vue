<template>
  <form
    class="needs-validation d-flex flex-column gap-3"
    @submit.prevent="signup"
    novalidate
    ref="form"
  >
    <h2 class="mt-5">Sign Up</h2>
    <p>Get started with Midpoint!</p>
    <div class="row gap-2 mx-0">
      <TextInput
        class="col p-0"
        id="username"
        name="username"
        placeholder="Username"
        label="Username"
        :feedback="feedback.username"
        @focus="resetValidity"
      />
      <TextInput
        class="col p-0"
        id="email"
        name="email"
        placeholder="Email"
        label="Email"
        :feedback="feedback.email"
        @focus="resetValidity"
      />
    </div>
    <TextInput
      id="password"
      name="password"
      placeholder="Password"
      label="Password"
      :feedback="feedback.password"
      @focus="resetValidity"
      type="password"
    />
    <TextInput
      id="reEnterPassword"
      name="reEnterPassword"
      placeholder="Re-Enter Password"
      label="Re-Enter Password"
      :feedback="feedback.reEnterPassword"
      @focus="resetValidity"
      type="password"
    />
    <button type="submit" class="btn py-2">Create Account</button>
  </form>
</template>

<script>
import TextInput from "@/components/inputs/TextInput.vue";
import userService from "@/services/userService.js";
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
        email: "Email required",
        password: "Password required",
        reEnterPassword: "Password required",
      },
    };
  },
  methods: {
    signup() {
      const form = this.$refs.form;
      const router = this.$router;
      const userStore = useUserStore();

      const showError = (elem, msg) => {
        this.feedback[elem.name] = msg;
        elem.classList.add("is-invalid");
      };

      this.resetFeedback();
      if (form.password.value.trim() !== form.reEnterPassword.value.trim()) {
        showError(form.reEnterPassword, "Passwords do not match");
      } else if (form.checkValidity()) {
        userService
          .signup(form.username.value, form.email.value, form.password.value)
          .then((res) => {
            const field = ["username", "email"].find((f) =>
              res.error?.toLowerCase()?.includes(f)
            );
            if (field) {
              showError(form[field], res.error);
            } else if (res.error) {
              this.notifyError("Something went wrong. Please try again.");
            } else {
              this.notifySuccess("Account created successfully!");
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
      form.email.classList.remove("is-invalid");
      form.password.classList.remove("is-invalid");
      form.reEnterPassword.classList.remove("is-invalid");
      this.feedback.username = "Username required";
      this.feedback.email = "Email required";
      this.feedback.password = "Password required";
      this.feedback.reEnterPassword = "Password required";
    },
  },
};
</script>
