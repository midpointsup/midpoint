<template>
  <form class="needs-validation d-flex flex-column gap-3" @submit.prevent="createUser" novalidate ref="form">
    <a @click="$router.back()" class="mt-4 back-btn">Back</a>
    <h2 class="mt-1">You're almost there!</h2>
    <p>Choose a unique username to finish setting up your account!</p>
    <div class="row align-items-center">
      <img v-if="picture" :src="picture" class="col-2 pfp-large rounded-circle py-2" />
      <img v-else src="@/assets/static/user.png" class="col-2 limits rounded-circle py-2" />
      <TextInput id="username" name="username" placeholder="Username" label="Username" :feedback="feedback" @focus="resetValidity"
        class="col-10 p-0" />
    </div>
    <button type="submit" class="btn py-2 mt-5 mb-2">Finish Setup</button>
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
  data() {
    return {
      feedback: "Username required",
      username: this.$route.query.name?.toLowerCase().replaceAll(/[^a-z0-9_-]/g, "") ?? "",
      email: this.$route.query.email ?? "",
      picture: "",
    };
  },
  mounted() {
    const form = this.$refs.form;
    form.username.value = this.username;

    const picture = this.$route.query.picture;
    if (picture) {
      const img = new Image();
      img.src = picture;
      img.onload = () => {
        this.picture = img.src;
      };
    }
  },
  methods: {
    createUser() {
      const form = this.$refs.form;
      const router = this.$router;
      const userStore = useUserStore();

      if (form.checkValidity()) {
        userService.signup(form.username.value,this.email,null,this.picture).then((res) => {
          if (res.error) {
            this.feedback = res.error;
            form.username.classList.add("is-invalid");
          } else {
            form.classList.add("was-validated");
            res.picture = this.picture;
            userStore.setUser(res);
            router.push("/");
          }
        });
      } else {
        this.feedback = "Username required";
        form.username.classList.add("is-invalid");
      }
    },
  },
};
</script>

<style>
.back-btn {
  display: inline-flex;
  align-items: center;
  width: max-content;
  padding-right: 5px;
  border-radius: 5px;
  color: var(--dark-green);

  &::before {
    content: "";
    display: inline-block;
    height: 1rem;
    width: 1rem;
    background-color: var(--dark-green);
    mask: url("@/assets/static/chevron-left.svg");
  }
}

.pfp-large {
  min-width: 60px;
  max-width: 90px;
}
</style>