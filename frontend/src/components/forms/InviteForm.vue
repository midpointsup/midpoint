<template>
  <form @submit.prevent="sendInvite" class="d-flex flex-column gap-2 m-2">
    <h6>Invite a friend by email</h6>
    <div class="input-group">
      <input
        type="email"
        id="email"
        v-model="email"
        class="form-control input-simple"
        placeholder="Enter email"
        autocomplete="off"
        required
      />
      <button
        type="submit"
        class="btn btn-invite border border-dark px-4"
      ></button>
    </div>
  </form>
</template>

<script>
import emailService from "@/services/emailService.js";

export default {
  data() {
    return {
      email: "",
    };
  },
  methods: {
    sendInvite() {
      console.log("TODO: send invite to", this.email);
      // emailService.sendInvite(this.email);
    },
  },
};
</script>

<style>
.btn-invite {
  background-image: url("@/assets/static/send.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 40%;
}
</style>
