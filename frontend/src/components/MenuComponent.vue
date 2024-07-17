<template>
  <div class="menu-wrapper-outer gap-3">
    <ul class="menu-wrapper gap-3 ps-0 mb-0">
      <h4 class="logo-header">idpoint</h4>
      <hr />
      <!-- <li class="nav-btn explore-btn" @click="showPlans" data-content="Explore"></li> -->
      <li
        class="nav-btn plans-btn"
        @click="showPlans"
        data-content="Your Plans"
      ></li>
      <li
        class="nav-btn add-btn"
        @click="showCreatePlan"
        data-content="Add Plan"
      ></li>
    </ul>
    <div class="dropend">
      <a
        href="#"
        class="d-flex align-items-center link-dark text-decoration-none"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <img
          v-if="currentUser.picture"
          :src="currentUser.picture"
          class="pfp"
        />
        <img v-else src="@/assets/static/user.png" alt="" class="pfp" />
      </a>
      <ul class="dropdown-menu text-small shadow">
        <li><a class="dropdown-item" href="#">Settings</a></li>
        <li><a class="dropdown-item" href="#">Profile</a></li>
        <li>
          <hr class="dropdown-divider" />
        </li>
        <li>
          <button class="dropdown-item" @click="signout">Sign out</button>
        </li>
      </ul>
    </div>
  </div>

  <div v-if="isSidebarOpen" id="menu">
    <div
      class="d-flex flex-column flex-shrink-0 p-3 bg-light"
      id="menuContainer"
    >
      <a
        href="/"
        class="title d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none"
      >
        <span class="fs-4">Midpoint</span>
      </a>
      <hr />
      <div v-if="plansPage" class="nav nav-pills flex-column mb-auto">
        <div v-if="selectedPlan" class="nav nav-pills flex-column mb-auto">
          <h4>{{ selectedPlan.name }}</h4>
          <MiddleForm
            :startLocation="
              selectedPlan.members.find(
                (member) => member.id === currentUser.userId
              ).Trips[0].startLocation
            "
            :selectedPlan="selectedPlan"
            :currentUser="currentUser"
            @add-location="updateCurrentLocation"
            @clear-location="clearCurrentLocation"
            @generate-midpoint="updateMiddle"
          >
            <MembersList
              :members="selectedPlan.members"
              :you="currentUser"
            ></MembersList>
          </MiddleForm>
          <button @click="clearSelection" class="btn mt-3">Back</button>
          <button
            v-if="selectedPlan.ownerId === currentUser.userId"
            @click="confirmDelete(selectedPlan.id)"
            class="btn btn-danger mt-3"
          >
            Delete Plan
          </button>
        </div>
        <div v-else>
          <h6>My Plans</h6>
          <ul class="nav nav-pills flex-column mb-auto">
            <li
              v-for="plan in plans"
              :key="plan"
              class="planContainer"
              @click="selectPlan(plan)"
            >
              <a href="#" class="nav-link link-dark" :id="plan.id">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-people-fill icon"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
                  />
                </svg>
                {{ plan.name }}
                <hr />
                <p>{{ plan.address ? plan.address : "TBD" }}</p>
                <span class="badge">{{
                  plan.date && plan.date.slice(0, 10)
                }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div v-else-if="createPlan" class="nav nav-pills flex-column mb-auto">
        <h6>Create a Plan</h6>
        Plan Name
        <input
          class="form-control"
          type="text"
          v-model="newPlanName"
          placeholder="Enter plan name"
          autofocus
        />

        <br />
        Invite Members
        <input
          class="form-control"
          type="text"
          v-model="newMemberName"
          @keyup.enter="addMember"
          placeholder="Add member"
        />

        <div class="mt-3">
          <span
            class="badge badge-pill"
            v-for="(member, index) in membersList"
            :key="index"
          >
            {{ member }}
            <button @click="removeMember(index)" class="btn btn-sm">x</button>
          </span>
        </div>

        <br />
        Where do you want to meet?
        <gmpx-place-picker
          id="place-picker"
          for-map="map"
          placeholder="Enter A Location"
        ></gmpx-place-picker>
        <div id="infowindow-content">
          <span id="place-name" class="title" style="font-weight: bold"></span
          ><br />
          <span id="place-address"></span>
        </div>

        <br />
        Select Category
        <div id="categoryContainer">
          <div
            v-for="category in categories"
            :key="category.id"
            :data-key="category.name"
            class="category-icon"
            @click="toggleCategorySelection(category.name)"
          >
            <span>{{ category.name }}</span>
          </div>
        </div>

        <br />
        Date
        <input
          id="date"
          class="form-control"
          type="text"
          placeholder="Enter date"
          autofocus
        />
        <button @click="addPlan" class="btn mt-3">Create</button>

        <span v-if="success" class="alert alert-success" role="alert">
          Plan created successfully!
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "https://unpkg.com/@googlemaps/extended-component-library@0.6";
import MiddleForm from "@/components/MiddleForm.vue";
import MembersList from "@/components/MembersList.vue";
import userService from "@/services/user-service.js";
import planService from "@/services/plan-service.js";
import { useUserStore } from "@/stores/userStore.js";
export default {
  components: {
    MiddleForm,
    MembersList,
  },
  data() {
    return {
      placePicker: null,
      infowindowContent: null,
      infowindow: null,
      showInput: false,
      date: "",
      place: "",
      newPlanName: "",
      plans: [],
      success: false,
      selectedPlan: null,
      newMemberName: "",
      membersList: [],
      categories: [
        { id: 1, name: "Restaurants", icon: "" },
        { id: 2, name: "Bathrooms", icon: "" },
        { id: 3, name: "Cafe", icon: "" },
        { id: 4, name: "Grocery", icon: "" },
        { id: 5, name: "Schools", icon: "" },
      ],
      selectedCategory: "",
      isSidebarOpen: false,
      plansPage: true,
      createPlan: false,
    };
  },
  mounted() {
    this.loadGoogleMapsScript();

    userService.getMe().then((res) => {
      if (!res.error) {
        console.log("Profile Picture:", res);

        planService.getPlansForMember(res.userId).then((res) => {
          if (!res.error) {
            this.plans = res;
            console.log("Plans:", this.plans);
          }
        });
      }
    });
  },
  methods: {
    loadGoogleMapsScript() {},
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    showPlans() {
      if (!this.isSidebarOpen) {
        this.isSidebarOpen = true;
      }
      this.plansPage = true;
      this.createPlan = false;
    },
    showCreatePlan() {
      if (!this.isSidebarOpen) {
        this.isSidebarOpen = true;
      }

      this.createPlan = true;
      this.plansPage = false;
    },
    clearSelection() {
      this.selectedPlan = null;
    },
    selectPlan(plan) {
      this.selectedPlan = plan;
    },
    showInputField() {
      this.showInput = true;
    },
    toggleCategorySelection(categoryName) {
      if (this.selectedCategory === categoryName) {
        document
          .querySelector(`[data-key='${categoryName}']`)
          .classList.remove("selected");
      } else {
        document
          .querySelector(`[data-key='${categoryName}']`)
          .classList.add("selected");
      }
      this.selectedCategory = categoryName;

      //unselect all other categories
      this.categories
        .filter((category) => category.name !== categoryName)
        .forEach((category) => {
          document
            .querySelector(`[data-key='${category.name}']`)
            .classList.remove("selected");
        });
    },
    addMember() {
      if (this.newMemberName.trim() !== "") {
        this.membersList.push(this.newMemberName);
        this.newMemberName = "";
      }
    },
    removeMember(index) {
      this.membersList.splice(index, 1);
    },
    async addPlan() {
      if (this.newPlanName.trim()) {
        this.placePicker = document.querySelector("#place-picker");
        if (this.placePicker) {
          this.placePicker.addEventListener("gmpx-placechange", () => {
            this.place = this.placePicker.value;
          });
        }

        planService
          .createPlan(
            this.newPlanName.trim(),
            this.currentUser.userId,
            [...this.membersList, this.currentUser.username],
            this.selectedCategory,
            this.place.formattedAddress,
            this.date
          )
          .then((res) => {
            // create trips for all members with their ids
            new Promise((resolve, reject) => {
              res.members.forEach((member) => {
                planService.createTrip(res.id, member.id, {});
              });
              resolve();
            }).then(() => {
              planService
                .getPlansForMember(this.currentUser.userId)
                .then((res) => {
                  if (!res.error) {
                    this.plans = res;
                  }
                });
              this.membersList = [];
              this.newPlanName = "";
              this.showInput = false;
              this.success = true;

              new Promise((resolve, reject) => {
                res.members.forEach((member) => {
                  userService.sendEmail(member).then((res) => {});
                });
                resolve();
              }).then(() => {
                console.log("Emails sent");
              });
            });
          });
      }
    },
    async confirmDelete(planId) {
      if (confirm("Are you sure you want to delete this plan?")) {
        await this.deletePlan(planId);
      }
    },
    async deletePlan(planId) {
      planService.deletePlan(planId).then((res) => {
        if (!res.error) {
          this.plans = this.plans.filter((plan) => plan.id !== planId);
          this.selectedPlan = null;
        }
      });
    },
    async updateMiddle(midpoint) {
      planService
        .updatePlan(this.selectedPlan.id, {
          address: midpoint,
          name: this.selectedPlan.name,
          category: this.selectedPlan.category,
          date: this.selectedPlan.date,
        })
        .then((res) => {
          console.log("response planservice", res);
        });

      //update the selected plan
      this.selectedPlan.address = midpoint;
    },
    async updateCurrentLocation(location) {
      this.selectedPlan.members.forEach((member) => {
        if (member.id === this.currentUser.userId) {
          member.Trips[0].startLocation = location;
          planService
            .updateTrip(
              this.selectedPlan.id,
              this.currentUser.userId,
              member.Trips[0].id,
              {
                startLocation: location,
              }
            )
            .then((resTrip) => {});
        }
      });
    },
    clearCurrentLocation() {
      this.selectedPlan.members.forEach((member) => {
        if (member.id === this.currentUser.userId) {
          member.Trips[0].startLocation = "";
          planService
            .updateTrip(
              this.selectedPlan.id,
              this.currentUser.userId,
              member.Trips[0].id,
              {
                startLocation: "",
              }
            )
            .then((resTrip) => {});
        }
      });
    },
    signout() {
      userService.storeToken(null);
      useUserStore().setUser(null);
      this.$router.push("/signup");
    },
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
.menu-wrapper-outer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 10px;

  @media (min-width: 577px) {
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
  }
}

.menu-wrapper {
  width: max-content;
  list-style: none;
  display: flex;

  @media (min-width: 577px) {
    flex-direction: column;
  }
}

.nav-btn,
.pfp {
  height: 32px;
  border-radius: var(--bs-border-radius);
  background-color: var(--color-background);
  display: flex;
  align-items: center;

  &:active {
    transform: translateY(2px);
  }

  &:hover,
  &:active,
  .selected {
    filter: brightness(0.9);
  }

  &.selected {
    box-shadow: 0 0 0 0.2em rgba(0, 123, 255, 0.6);
  }

  &::after {
    height: 32px;
    display: flex;
    align-items: center;
    content: "";
  }
}

.nav-btn::before {
  width: 32px;
  height: 32px;
  display: inline-block;
  content: "";
  background-position: center;
  background-repeat: no-repeat;
  background-size: 26px;
}

.pfp {
  object-fit: contain;
  height: 32px;
  width: 32px;
  object-position: center;
  cursor: pointer;
}

.explore-btn::before {
  background-image: url("@/assets/static/compass.svg");
}

.plans-btn::before {
  background-image: url("@/assets/static/plan.svg");
}

.add-btn::before {
  background-image: url("@/assets/static/plus.svg");
}

.logo-header {
  display: none;
  color: var(--primary);
  line-height: 40px;

  &::before {
    content: "";
    background-image: url("@/assets/static/logo.svg");
    background-position: center bottom;
    background-repeat: no-repeat;
    background-size: 80%;
    width: 30px;
    display: inline-block;
    height: 30px;
  }

  + hr {
    margin: 0;
  }
}

@media (min-width: 577px) {
  .nav-btn::after {
    content: attr(data-content);
  }
  .nav-btn::before {
    background-size: 20px;
  }
  .logo-header {
    display: inline-block;
  }
}

.side-bar-icon {
  margin-top: 18px;
  justify-content: center;
  align-items: center;
  display: flex;
}

.title {
  width: 100%;
}

.column-display {
  display: flex;
  flex-direction: column;
  float: top;
  height: 100%;
  align-items: center;
  padding: 5px 5px 15px 5px;

  .nav li {
    font-size: 0.75rem;
  }
}

.category-icon {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 5px;
  padding: 5px;
}

.category-icon.selected {
  background-color: var(--secondary);
}

#categoryContainer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  display: grid;
  grid-template-columns: auto auto auto;
}

.planContainer {
  display: flex;
  flex-direction: column;
  border: 1px solid black;
  border-radius: 10px;
  margin-bottom: 15px;

  a {
    /*!!! change this? add an id? */
    padding-top: 15px;
  }
}

#menuContainer {
  width: 280px;
  height: 100%;
  overflow-y: auto;
}

.dropdown {
  float: bottom;
}

.icon {
  margin-right: 10px;
}

.badge {
  background-color: var(--primary);
}
</style>
