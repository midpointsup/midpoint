<template>
  <form
    class="needs-validation d-flex flex-column gap-3"
    @submit.prevent="addPlan"
    novalidate
    ref="form"
  >
    <span class="form-text" v-if="!template">
      Create a plan and invite your friends to meet up!
    </span>

    <div>
      <label for="planName" class="form-label mt-2">Name your plan</label>
      <input
        id="planName"
        type="text"
        class="form-control input-simple"
        placeholder="Enter plan name"
        v-model="planName"
        @focus="(e) => e.target.classList.remove('is-invalid')"
        required
      />
      <div class="invalid-feedback">Plan name required</div>
    </div>

    <slot v-if="template"></slot>

    <div>
      <label for="userSearch" class="form-label">Add members</label>
      <input
        type="text"
        id="userSearch"
        class="form-control input-simple"
        placeholder="Search username"
        v-model="searchUsername"
        @keydown.enter="(e) => e.preventDefault()"
        @focus="(e) => e.target.classList.remove('is-invalid')"
      />
      <div class="invalid-feedback">At least one member needed</div>
      <div for="userSearch" class="form-text">
        Can't find who you're looking for?
        <a class="green" @click="showInvite">Send an Invite</a>
      </div>
      <button
        v-if="searchUsername.length >= 1"
        type="button"
        class="btn-clear"
        @click="searchUsername = ''"
      ></button>
      <ul v-if="searchUsername.length >= 3" class="list-group member-dropdown">
        <li v-if="isLoading" class="list-group-item">Loading...</li>
        <li v-else-if="fetchedUsers?.length === 0" class="list-group-item">
          No results
        </li>
        <li
          v-for="user in fetchedUsers"
          :key="user.id"
          :value="user.id"
          class="list-group-item list-group-item-action"
          @click="addMember(user.username)"
          tabindex="0"
        >
          {{ user.username }}
        </li>
      </ul>
      <div class="d-flex gap-1 my-2 flex-wrap overflow-x-hidden mw-100">
        <div
          class="badge rounded-pill p-2 d-flex gap-1 mw-100"
          v-for="(member, index) in membersList"
          :key="index"
        >
          <span class="badge-text text-truncate">{{ member }}</span>
          <button
            @click="removeMember(index)"
            class="btn btn-close badge-btn"
          ></button>
        </div>
      </div>
    </div>

    <div class="mb-3" v-if="!template">
      <label class="form-label" data-tooltip="You can change this later"
        >Select a category *</label
      >
      <div
        class="d-flex gap-1 flex-wrap overflow-x-hidden mw-100 form-check p-0"
        ref="selectCategory"
      >
        <div v-for="(category, index) in categories">
          <input
            type="radio"
            class="btn-check"
            name="btnradio"
            :id="'btnradio' + index"
            @focus="() => $refs.selectCategory.classList.remove('is-invalid')"
            v-model="planCategory"
            :value="category"
            autocomplete="off"
          />
          <label class="radio-btn" :for="'btnradio' + index">{{
            category
          }}</label>
        </div>
      </div>
      <div class="invalid-feedback">Category required</div>
    </div>

    <div class="form-group">
      <label class="form-label" data-tooltip="You can change this later"
        >Select a date *</label
      >
      <VueDatePicker
        v-model="date"
        :teleport="true"
        :enable-time-picker="false"
        hide-input-icon
        ref="datePicker"
        :state="datePickerState"
      ></VueDatePicker>
      <div class="invalid-feedback" :class="getInvalidClass">Date required</div>
    </div>

    <div>
      <label for="exampleColorInput" class="form-label"
        >Pick an accent colour</label
      >
      <input
        type="color"
        class="form-control form-control-color"
        id="exampleColorInput"
        v-model="planColour"
      />
    </div>

    <div v-if="!template" class="form-check">
      <input
        class="form-check-input"
        type="checkbox"
        v-model="emailNotify"
        id="flexCheckDefault"
      />
      <label class="form-check-label" for="flexCheckDefault">
        Send email notifications to members
      </label>
    </div>

    <button type="submit" class="btn my-2">Create Plan</button>
  </form>
</template>

<script>
import userService from "@/services/userService.js";
import { usePopupStore } from "@/stores/popupStore";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import planService from "@/services/planService.js";
import { notificationMixin } from "@/mixins/notificationMixin.js";
import emailService from "@/services/emailService.js";
import io from "socket.io-client";

export default {
  mixins: [notificationMixin],
  components: {
    VueDatePicker,
  },
  props: {
    currentUser: Object,
    template: {
      type: Boolean,
      default: false,
    },
    templateName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      planName: "",
      searchUsername: "",
      isLoading: true,
      cache: {},
      fetchedUsers: [],
      membersList: [],
      categories: [
        "Restaurants",
        "Cafe",
        "Grocery",
        "Schools",
        "Parks",
        "Shopping",
        "Recreation Centers",
        "Bathrooms",
        "Theatres",
      ],
      planCategory: null,
      date: new Date(),
      datePickerState: null,
      planColour: "#4dc48a",
      emailNotify: false,
      socket: null,
    };
  },
  watch: {
    searchUsername: function (username) {
      if (username.length >= 3) {
        this.searchUser(username);
      }
    },
  },
  computed: {
    getInvalidClass() {
      return this.datePickerState === false ? "d-block" : "d-none";
    },
  },
  methods: {
    addPlan() {
      const form = this.$refs.form;
      this.resetValidity();
      this.setValidity(form.userSearch, this.membersList.length > 0);
      this.setValidity(form.planName, this.planName.trim().length > 0);
      if (!this.template) {
        this.setValidity(this.$refs.selectCategory, this.planCategory !== null);
      }
      this.datePickerState = this.date !== null;
      const callback = (res) => {
        this.resetValidity();
        this.notifySuccess("Plan created successfully");
        this.searchUsername = "";
        this.membersList = [];
        this.planName = "";
        this.planCategory = null;
        this.date = new Date();
        this.planColour = "#4dc48a";

        if (this.emailNotify) {
          res.members.forEach((member) => {
            if (member !== this.currentUser.userId) {
              emailService.sendEmail(member).then((res) => {
                if (res.error) {
                  this.notifyError(res.error);
                }
              });
            } else {
              this.socket?.on("emailSent", (data) => {
                this.notifySuccess("Email sent to " + data);
              });
              this.socket?.on("emailOpened", (data) => {
                this.notifySuccess(data + " opened the email!");
              });
            }
          });
        }
      };
      if (
        this.membersList.length > 0 &&
        this.planName.trim().length > 0 &&
        (this.template || this.planCategory) &&
        this.datePickerState
      ) {
        if (this.template) {
          this.$emit("createPlan", {
            planName: this.planName.trim(),
            membersList: this.membersList,
            date: this.date,
            planColour: this.planColour,
            onSuccess: callback,
          });
        } else {
          planService
            .createPlan(
              this.planName.trim(),
              this.membersList,
              this.planCategory,
              this.date,
              this.planColour,
              [this.planCategory]
            )
            .then((res) => {
              if (res.error) {
                this.notifyError(res.error);
              } else {
                callback(res);
              }
            });
        }
      }
    },
    setValidity(elem, isValid) {
      elem.classList.add(isValid ? "is-valid" : "is-invalid");
    },
    resetValidity() {
      const form = this.$refs.form;
      form.userSearch.classList.remove("is-invalid", "is-valid");
      form.planName.classList.remove("is-invalid", "is-valid");
      if (!this.template) {
        this.$refs.selectCategory.classList.remove("is-invalid", "is-valid");
      }
      this.datePickerState = null;
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
        this.fetchedUsers = this.cache[username].filter(
          (user) => !this.membersList.includes(user.username)
        );
        this.isLoading = false;
        return;
      }

      userService.findUsers(username).then((response) => {
        this.cache[username] = response.filter(
          (user) => !this.membersList.includes(user.username)
        );
        this.fetchedUsers = this.cache[username];
        this.isLoading = false;
        setTimeout(() => {
          delete this.cache[username];
        }, 60000);
      });
    },
    showInvite() {
      usePopupStore().show(0);
    },
  },
  mounted() {
    if (this.template) {
      this.planName = this.templateName;
    }

    this.socket = io("https://api.midpoint.live");
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>

<style>
.btn-clear {
  background-image: url("@/assets/static/cancel.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 14px;
  position: absolute;
  top: 32px;
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
  top: 74px;
  z-index: 100;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.btn-down {
  background-image: url("@/assets/static/chevron-down.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 14px;
}

.radio-btn {
  border-radius: 20px;
  border: 1px solid var(--primary);
  padding: 2px 5px;

  &:hover {
    background-color: var(--secondary);
  }
}

.btn-check:checked + .radio-btn {
  background-color: var(--primary);
}
</style>
