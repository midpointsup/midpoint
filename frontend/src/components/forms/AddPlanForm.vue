<template>
  <form class="needs-validation d-flex flex-column gap-3" @submit.prevent="addPlan" novalidate ref="form">
    <!-- <TextInput id="planName" name="planName" placeholder="Enter plan name" label="Plan Name" /> -->
    <br />

    <div>
      <input type="text" id="userSearch" class="search input-simple" placeholder="Search username" v-model="searchUsername">
      <div for="userSearch" class="form-text">Can't find who you're looking for? <a class="green" @click="showInvite">Send an Invite</a>
      </div>
      <button v-if="searchUsername.length >= 1" type="button" class="btn-clear" @click="searchUsername = ''"></button>
      <ul v-if="searchUsername.length >= 3" class="list-group member-dropdown">
        <li v-if="isLoading" class="list-group-item">Loading...</li>
        <li v-else-if="fetchedUsers?.length === 0" class="list-group-item">No results</li>
        <li v-for="user in fetchedUsers" :key="user.id" :value="user.id" class="list-group-item list-group-item-action"
          @click="addMember(user.username)" tabindex="0">{{ user.username }}</li>
      </ul>

      <div class="d-flex gap-1 my-2 flex-wrap overflow-x-hidden mw-100">
        <div class="badge rounded-pill p-2 d-flex gap-1 mw-100" v-for="(member, index) in membersList" :key="index">
          <span class="badge-text text-truncate">{{ member }}</span>
          <button @click="removeMember(index)" class="btn btn-close badge-btn"></button>
        </div>
      </div>
    </div>
    <br />
    Where do you want to meet?
    <PlacePicker></PlacePicker>
  </form>

</template>

<script>
import TextInput from "@/components/inputs/TextInput.vue";
import PlacePicker from "@/components/inputs/PlacePicker.vue";
import userService from "@/services/userService.js";
import { usePopupStore } from "../../stores/popupStore";
export default {
  components: {
    TextInput,
    PlacePicker,
  },
  data() {
    return {
      isLoading: true,
      searchUsername: "",
      fetchedUsers: [],
      membersList: [
        "spiders",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      ],
      cache: {},
    };
  },
  watch: {
    searchUsername: function (username) {
      if (username.length >= 3) {
        this.searchUser(username);
      }
    },
  },
  methods: {
    addPlan() {
      const form = this.$refs.form;
      if (form.checkValidity()) {
        this.success = true;
      }
    },
    addMember(username) {
      this.membersList.push(username);
      this.searchUsername = "";
      this.fetchedUsers = [];
    },
    removeMember(index) {
      this.membersList.splice(index, 1);
    },
    searchUser(username) {
      this.isLoading = true;

      if (this.cache[username]) {
        this.fetchedUsers = this.cache[username].filter((user) => !this.membersList.includes(user.username));
        this.isLoading = false;
        return;
      }

      userService.findUsers(username).then((response) => {
        this.cache[username] = response.filter((user) => !this.membersList.includes(user.username));;
        this.fetchedUsers = this.cache[username];
        this.isLoading = false;
      });
    },
    showInvite() {
      usePopupStore().show(0)
    }
  }
}
</script>

<style>
.btn-clear {
  background-image: url("@/assets/static/cancel.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 14px;
  position: absolute;
  right: 0px;
  height: 41.6px;
  width: 35px;
  margin: auto;
  border: none;
  background-color: transparent;
}

.badge-text {
  font-weight: 500;
  color: var(--black);
}

.member-dropdown {
  position: absolute;
  top: 41.6px;
  z-index: 100;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
}

.btn-down {
  background-image: url("@/assets/static/chevron-down.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 14px;
}
</style>