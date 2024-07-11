<template>
  <div>
    <button id="googleLoginBtn" class="btn" @click="login">
      Login Using Google
    </button>
    <div v-if="userDetails">
      <h2>User Details</h2>
      <p>Name: {{ userDetails.username }}</p>
      <p>Email: {{ userDetails.email }}</p>
      <p>
        Profile Picture:
        <img :src="userDetails.picture" alt="Profile Picture" />
      </p>
    </div>
  </div>
</template>

<script>
import { googleSdkLoaded } from "vue3-google-login";
import axios from "axios";
import userService from "../services/user-service.js";

export default {
  name: "GoogleLoginForm",
  data() {
    return {
      userDetails: null,
    };
  },
  methods: {
    login() {
      googleSdkLoaded((google) => {
        google.accounts.oauth2
          .initCodeClient({
            client_id: import.meta.env.VITE_CLIENT_ID,
            scope: "email profile openid",
            redirect_uri: import.meta.env.VITE_REDIRECT_URI,
            callback: (response) => {
              console.log("Response received:", response);
              if (response.code) {
                this.sendCodeToBackend(response.code);
              }
            },
          })
          .requestCode();
      });
      console.log("Google Login Button Clicked");
    },
    async sendCodeToBackend(code) {
      try {
        console.log("Sending authorization code to backend:", code);
        const headers = {
          Authorization: code,
        };
        axios
          .post("http://localhost:3000/api/oauth", null, { headers })
          .then((res) => {
            console.log("Response:", res.data);
            const userDetails = res.data;
            console.log("User Details:", userDetails);
            this.userDetails = userDetails;
            userService.storeToken(userDetails.token);
          });
      } catch (error) {
        console.error("Failed to send authorization code:", error);
      }
    },
  },
};
</script>
