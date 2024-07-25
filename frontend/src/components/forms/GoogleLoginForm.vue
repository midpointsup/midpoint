<template>
  <button id="googleLoginBtn" class="mx-10 google-btn" @click="login">
    <slot></slot>
  </button>
</template>

<script>
import { googleSdkLoaded } from "vue3-google-login";
import userService from "@/services/user-service.js";
import { useUserStore } from "@/stores/userStore.js";
import { notificationMixin } from "@/mixins/notificationMixin.js";

export default {
  mixins: [notificationMixin],
  methods: {
    login() {
      const router = this.$router;
      googleSdkLoaded((google) => {
        google.accounts.oauth2
          .initCodeClient({
            client_id: import.meta.env.VITE_CLIENT_ID,
            scope: "email profile openid",
            redirect_uri: import.meta.env.VITE_REDIRECT_URI,
            callback: (response) => {
              if (response.error) {
                return this.notifyError(
                  "Something went wrong. Please try again."
                );
              }
              if (response.code) {
                userService.saveGoogleToken(response.code).then((res) => {
                  if (res.error) {
                    return this.notifyError(
                      "Something went wrong. Please try again."
                    );
                  }
                  if (res.userId === null) {
                    if (this.isSignIn) {
                      this.notifyWarning(
                        "Registration not completed. Please sign up."
                      );
                    }
                    return router.push({
                      path: "signup",
                      query: {
                        google: true,
                        name: res.username,
                        email: res.email,
                        picture: res.picture,
                      },
                    });
                  }
                  this.notifySuccess(
                    this.isSignIn
                      ? "Signed in successfully."
                      : "Signed in with existing account."
                  );
                  const userStore = useUserStore();
                  userStore.setUser(res);
                  router.push("/");
                });
              }
            },
          })
          .requestCode();
      });
    },
  },
  computed: {
    isSignIn() {
      return this.$router.currentRoute.value.path === "/signin";
    },
  },
};
</script>

<style>
.google-btn {
  background-color: var(--color-background);
  border: 1px solid var(--red);
  border-radius: 5px;
  display: flex;
  padding: 10px 20px;
  justify-content: center;

  &::before {
    content: url("@/assets/static/google.svg");
    display: inline-block;
    width: 18px;
    height: 18px;
    margin-right: 12px;
  }

  &:active {
    transform: translateY(2px);
  }

  &:hover {
    background-color: var(--dark-red);
    color: var(--white);
  }
}
</style>
