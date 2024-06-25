<template>
  <div class="container-login">
    <div class="container-form">
      <h1 class="row mb-3">Sign Up</h1>
      <form
        class="signup-form needs-validation"
        @submit.prevent="signup"
        novalidate
      >
        <div class="row form-floating mb-3">
          <input
            type="text"
            class="form-control"
            id="username"
            name="username"
            placeholder="Username"
            required
          />
          <label for="username">Username</label>
          <div class="invalid-feedback">Username required</div>
        </div>
        <div class="row form-floating mb-3">
          <input
            type="text"
            class="form-control"
            id="email"
            name="email"
            placeholder="email"
            required
          />
          <label for="email">Email</label>
          <div class="invalid-feedback">Email required</div>
        </div>
        <div class="row form-floating mb-3">
          <input
            type="password"
            class="form-control"
            id="password"
            name="password"
            placeholder="Password"
            required
          />
          <label for="password">Password</label>
          <div class="invalid-feedback">Password required</div>
        </div>
        <div class="row form-floating mb-3">
          <input
            type="re-enter-password"
            class="form-control"
            id="re-enter-password"
            name="re-enter-password"
            placeholder="Re-Enter Password"
            required
          />
          <label for="re-enter-password">Re-Enter Password</label>
          <div class="invalid-feedback">Password required</div>
        </div>
        <div class="row container mx-auto mb-3">
          <button type="submit" class="btn w-100">Log In</button>
        </div>
      </form>
      <hr />
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    signup() {
      document
        .querySelector(".signup-form")
        .addEventListener("signup-form", function (e) {
          e.preventDefault();
        });
    },
  },
  mounted() {
    var form = document.querySelector(".signup-form");

    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  },
};
</script>

<style>
@media (max-width: 576px) {
  .container-form {
    max-width: 90%;
    margin: auto;
  }

  .container-login {
    background-color: var(--white);
    width: 500px;
    max-width: 94%;
    position: fixed;
    border-radius: 12px;
  }
}
@media (min-width: 577px) {
  .container-form {
    max-width: 400px;
    margin: auto;
  }

  .container-login {
    background-color: var(--white);
    width: 460px;
    position: fixed;
    border-radius: 12px;
  }
}
</style>
