<template>
  <div class="profile-background container">

    <div class="row align-items-center">
      <div class="col-11">
        <h2>My profile</h2>
      </div>
      <div class="col-1">
        <RouterLink to="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
              </svg>
        </RouterLink>
        
      </div>
      <div class="col-3 mb-4 mt-4">
        <img
          v-if="currentUser.picture"
          :src="currentUser.picture"
          class="profile-picture"
        />
        <img v-else src="@/assets/static/user.png" alt="" />
      </div>
      <div v-if="!editingHeader" class="col-9">
        <h3>{{ currentUser.username }}</h3>
        <p>{{ currentUser.email }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "@/stores/userStore.js";
import { RouterLink } from "vue-router";
import userService from "@/services/user-service.js";

export default {
  components: {},
  data() {
    return {
        editingHeader: false,
        editingInfo: false
    };
  },
  computed: {
    currentUser() {
      console.log(useUserStore().getUser());
      return useUserStore().getUser();
    },
  },
};
</script>

<style>
.profile-background {
  flex: 1;
  display: flex;
  flex-direction: column;

  padding: 30px;
  width: 80%;
  height: 80%;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.profile-picture {
  width: 100%;
  height: 100%;
  max-width: 100px;
  max-height: 100px;
  border-radius: 50%;
}
.profile-title {
  font-weight: bold;
}
</style>
