<template>
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
                (member) => member.id === currentUser.id
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
            v-if="selectedPlan.ownerId === currentUser.id"
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
        <gmpx-place-picker id="place-picker" for-map="map"></gmpx-place-picker>
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
</template>

<script>
import "https://unpkg.com/@googlemaps/extended-component-library@0.6";
import MiddleForm from "@/components/MiddleForm.vue";
import MembersList from "@/components/MembersList.vue";
import userService from "../services/userService.js";
import planService from "../services/planService.js";
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
      currentUser: {
        name: "",
        profilePicture: "",
        id: "",
      },
    };
  },
  mounted() {
    this.loadGoogleMapsScript();

    userService.getMe().then((res) => {
      if (!res.error) {
        console.log("Profile Picture:", res);
        this.currentUser.profilePicture = res.picture;
        this.currentUser.name = res.username;
        this.currentUser.id = res.id;

        planService.getPlansForMember(res.id).then((res) => {
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
            this.currentUser.id,
            [...this.membersList, this.currentUser.name],
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
              planService.getPlansForMember(this.currentUser.id).then((res) => {
                if (!res.error) {
                  this.plans = res;
                }
              });
              this.membersList = [];
              this.newPlanName = "";
              this.showInput = false;
              this.success = true;
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
        if (member.id === this.currentUser.id) {
          member.Trips[0].startLocation = location;
          planService
            .updateTrip(
              this.selectedPlan.id,
              this.currentUser.id,
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
        if (member.id === this.currentUser.id) {
          member.Trips[0].startLocation = "";
          planService
            .updateTrip(
              this.selectedPlan.id,
              this.currentUser.id,
              member.Trips[0].id,
              {
                startLocation: "",
              }
            )
            .then((resTrip) => {});
        }
      });
    },
  },
};
</script>