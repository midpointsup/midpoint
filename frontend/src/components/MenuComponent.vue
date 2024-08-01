<template>
  <div class="menu-wrapper-outer gap-3">
    <ul class="menu-wrapper gap-3 ps-0 mb-0">
      <h4 class="logo-header mb-0">idpoint</h4>
      <hr />
      <li
        v-for="page in pages"
        :key="page"
        :class="'nav-btn ' + getPageClasses(page)"
        @click="openSidebar"
        :data-content="page"
      ></li>
    </ul>
    <div class="dropdown">
      <a
        href="#"
        class="d-flex align-items-center link-dark text-decoration-none rounded-circle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <img
          v-if="currentUser?.picture"
          :src="currentUser.picture"
          class="pfp"
        />
        <img v-else src="@/assets/static/user.png" alt="" class="pfp" />
      </a>
      <div class="dropdown-menu text-small shadow">
        <button class="dropdown-item" @click="signout">Sign out</button>
      </div>
    </div>
  </div>

  <SidebarComponent
    v-if="selectedPlan && isSidebarOpen && currentPage === 'My Plans'"
    class="nav nav-pills flex-column mb-auto"
    :currentPage="selectedPlan.name"
    :canGoBack="true"
    @goBack="goBack"
  >
    <MiddleForm
      :startLocation="
        selectedPlan.members.find((member) => member.id === currentUser.userId)
          .Trips[0].startLocation
      "
      :selectedPlan="selectedPlan"
      :currentUser="currentUser"
      @add-location="updateCurrentLocation"
      @generate-midpoint="updateMiddle"
    >
      <MembersList
        :members="selectedPlan.members"
        :selectedPlan="selectedPlan"
        :you="currentUser"
      ></MembersList>
    </MiddleForm>
    <a
      v-if="selectedPlan?.address"
      @click="togglePopup"
      class="btn btn-primary w-100 mt-3"
      >Toggle Routes</a
    >
    <button
      v-if="selectedPlan.ownerId === currentUser.userId"
      @click="confirmDelete(selectedPlan.id)"
      class="btn btn-danger mt-3 w-100"
    >
      Delete Plan
    </button>
  </SidebarComponent>
  <SidebarComponent v-else-if="isSidebarOpen" :currentPage="currentPage">
    <ExploreList v-if="currentPage === 'Explore'" />
    <AddPlanForm
      v-else-if="currentPage === 'Add Plan'"
      :currentUser="currentUser"
    />
    <ul
      v-else-if="currentPage === 'My Plans'"
      class="px-0 pt-2 d-flex flex-column gap-3 plansWrapper"
    >
      <li
        v-for="plan in myPlans"
        :key="'plan' + plan.id"
        :ref="'plan' + plan.id"
        class="planContainer"
        :style="{ 'border-color': plan.colour }"
        @click="selectPlan(plan)"
      >
        <h6 class="mt-2">{{ plan.name }}</h6>
        <hr class="mt-1" />
        <span>{{ plan.address ? plan.address : "TBD" }}</span>
        <div class="d-flex my-2">
          <div
            v-for="member in [...plan.members, plan.owner]
              .filter((member) => member.id !== currentUser.userId)
              .splice(0, 4)"
          >
            <img
              v-if="member.picture"
              :src="member.picture"
              class="rounded-circle pfp-small"
            />
            <img
              v-else
              src="@/assets/static/user.png"
              class="rounded-circle pfp-small"
            />
          </div>
          <div
            v-if="plan.members.length > 4"
            class="rounded-circle pfp-count text-truncate"
            :style="{ 'background-color': plan.colour }"
          >
            {{ `+${plan.memberCount - 4}` }}
          </div>
        </div>
        <span class="badge">{{ plan.date && plan.date.slice(0, 10) }}</span>
      </li>
      <li v-if="myPlans.length === 0">
        <p class="form-text">No plans yet. Add a plan to get started!</p>
      </li>
    </ul>
  </SidebarComponent>
</template>

<script>
import { useUserStore } from "@/stores/userStore.js";
import userService from "@/services/userService.js";
import planService from "@/services/planService.js";
import SidebarComponent from "@/components/SidebarComponent.vue";
import AddPlanForm from "@/components/forms/AddPlanForm.vue";
import { notificationMixin } from "@/mixins/notificationMixin.js";
import io from "socket.io-client";
import MiddleForm from "@/components/forms/MiddleForm.vue";
import MembersList from "@/components/MembersList.vue";
import RouteDisplayTabs from "@/components/RouteDisplayTabs.vue";
import ExploreList from "@/components/ExploreList.vue";
import { usePlanStore } from "@/stores/planStore.js";
import { usePopupStore } from "@/stores/popupStore";

export default {
  mixins: [notificationMixin],
  components: {
    SidebarComponent,
    AddPlanForm,
    MiddleForm,
    MembersList,
    RouteDisplayTabs,
    ExploreList,
  },
  data() {
    return {
      isSidebarOpen: false,
      pages: ["Explore", "My Plans", "Add Plan"],
      currentPage: "",
      myPlans: [],
      presetPlans: [],
      currentPlan: null,
      socket: null,
    };
  },
  methods: {
    openSidebar(event) {
      const content = event.target.dataset.content;
      if (this.isSidebarOpen && this.currentPage === content) {
        this.isSidebarOpen = false;
        this.currentPage = "";
      } else {
        this.isSidebarOpen = true;
        this.currentPage = content;
      }
      if (content === "My Plans") {
        this.getMyPlans();
      }
      if (!this.openSidebar) {
        usePlanStore().setPlan(null);
      }
    },
    getPageClasses(name) {
      const selected =
        this.isSidebarOpen && this.currentPage === name ? "selected" : "";
      switch (name) {
        case "Explore":
          return selected + " explore-btn";
        case "My Plans":
          return selected + " plans-btn";
        case "Add Plan":
          return selected + " add-btn";
        default:
          return selected;
      }
    },
    signout() {
      userService.storeToken(null);
      useUserStore().setUser(null);
      this.$router.push("/signup");
    },
    selectPlan(plan) {
      if (this.currentPlan) {
        this.$refs[`plan${this.currentPlan.id}`][0].classList.remove("active");
      }
      planService.getPlan(+plan.id).then((res) => {
        if (!res.error) {
          usePlanStore().setPlan(res);
        }
      });
      this.currentPlan = plan;
      this.$refs[`plan${plan.id}`][0].classList.add("active");
    },
    getMyPlans() {
      planService.getPlans().then((res) => {
        this.myPlans = !res.error ? res : null;
      });
    },
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
      }
    },
    updateMiddle(midpoint) {
      planService
        .updatePlan(this.selectedPlan.id, {
          address: midpoint,
          name: this.selectedPlan.name,
          category: this.selectedPlan.category,
          date: this.selectedPlan.date,
        })
        .then((res) => {
          if (!res.error) {
            this.myPlans = this.myPlans.map((plan) => {
              if (plan.id === this.selectedPlan.id) {
                plan.address = midpoint;
              }
              return plan;
            });
            this.selectedPlan.address = midpoint;
          }
        });

      usePopupStore().show(1);
    },
    updateCurrentLocation(location) {
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
    confirmDelete(planId) {
      if (confirm("Are you sure you want to delete this plan?")) {
        planService.deletePlan(planId).then((res) => {
          if (!res.error) {
            this.myPlans = this.myPlans.filter((plan) => plan.id !== planId);
            usePlanStore().setPlan(null);
            this.currentPlan = null;
            this.notifySuccess("Plan deleted successfully.");
          }
        });
      }
    },
    goBack() {
      usePlanStore().setPlan(null);
    },
    togglePopup() {
      usePopupStore().toggle(1);
    },
  },
  computed: {
    currentUser() {
      return useUserStore().getUser();
    },
    selectedPlan() {
      return usePlanStore().getPlan();
    },
  },
  mounted() {
    this.socket = io("http://localhost:3000");

    this.socket.on("connect", () => {
      this.socket.emit("join-user", "user" + this.currentUser.userId);
    });

    this.socket.on("planCreate", (plans) => {
      this.getMyPlans();
      this.notifySuccess("You have been added to a new plan!");
    });

    this.socket.on("planDelete", (planId) => {
      this.notifyWarning("A plan you were part of has been deleted.");
      if (this.currentPlan && this.currentPlan.id === planId) {
        this.currentPlan = null;
        usePlanStore().setPlan(null);
      }
      this.getMyPlans();
    });

    if (this.currentUser.userId) {
      this.getMyPlans();
    }
  },
  beforeUnmount() {
    this.disconnectSocket();
  },
};
</script>

<style>
.menu-wrapper-outer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  position: fixed;
  bottom: 0px;
  left: 0px;
  z-index: 100;
  background-color: var(--color-background);
  width: 100%;
  height: var(--menu-height);

  @media (min-width: 577px) {
    position: relative;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    width: max-content;
    padding: 20px;
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

.pfp {
  object-fit: contain;
  border-radius: 50%;
  height: 32px;
  width: 32px;
  object-position: center;
  margin-right: 1rem;

  @media (min-width: 577px) {
    margin-right: 2px;
  }
}

.nav-btn {
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
  &.selected {
    filter: brightness(0.9);
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

  .pfp {
    width: 40px;
    height: 40px;
  }
}

.plansWrapper {
  height: 100%;
  overflow-y: auto;
  padding-bottom: 80px;
}

.planContainer {
  list-style-type: none;
  background-color: var(--color-background);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  border: 1px solid;
  cursor: pointer;

  &:hover {
    background-color: var(--color-background-secondary);
  }

  &.active {
    background-color: var(--secondary);
  }

  &:active {
    transform: translateY(3px);
  }
}

.pfp-small {
  width: 25px;
  margin-right: -5px;
}

.pfp-count {
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>
