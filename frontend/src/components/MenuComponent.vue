<template>
  <div class="menu-wrapper-outer gap-3">
    <ul class="menu-wrapper gap-3 ps-0 mb-0">
      <h4 class="logo-header mb-0">idpoint</h4>
      <hr />
      <li v-for="page in pages" :key="page" :class="'nav-btn ' + getPageClasses(page)" @click="openSidebar"
        :data-content="page"></li>
    </ul>
    <div class="dropdown">
      <a href="#" class="d-flex align-items-center link-dark text-decoration-none rounded-circle"
        data-bs-toggle="dropdown" aria-expanded="false">
        <img v-if="currentUser.picture" :src="currentUser.picture" class="pfp" />
        <img v-else src="@/assets/static/user.png" alt="" class="pfp" />
      </a>
      <div class="dropdown-menu text-small shadow">
        <a class="dropdown-item" href="#">Settings</a>
        <a class="dropdown-item" href="#">Profile</a>
        <hr class="dropdown-divider" />
        <button class="dropdown-item" @click="signout">Sign out</button>
      </div>
    </div>
  </div>

  <SidebarComponent v-if="isSidebarOpen" :currentPage="currentPage">
    <ul v-if="currentPage === 'My Plans'">
      <li v-for="plan in plans" :key="plan" class="planContainer" @click="selectPlan(plan)">
        <a href="#" class="nav-link link-dark" :id="plan.id">
          {{ plan.name }}
          <hr />
          <p>{{ plan.address ? plan.address : "TBD" }}</p>
          <span class="badge">{{
            plan.date && plan.date.slice(0, 10)
          }}</span>
        </a>
      </li>
    </ul>
    <AddPlanForm v-else-if="currentPage === 'Add Plan'" />
  </SidebarComponent>
</template>

<script>
import { useUserStore } from "@/stores/userStore.js";
import userService from "@/services/userService.js";
import planService from '@/services/planService.js';
import SidebarComponent from "@/components/SidebarComponent.vue";
import AddPlanForm from "@/components/forms/AddPlanForm.vue";

export default {
  mixins: [notificationMixin],
  components: {
    SidebarComponent,
    AddPlanForm,
  },
  data() {
    return {
      isSidebarOpen: true,
      pages: ["Explore", "My Plans", "Add Plan"],
      currentPage: "Add Plan",
      myPlans: [],
      presetPlans: [],
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
    },
    getPageClasses(name) {
      const selected = this.isSidebarOpen && this.currentPage === name ? "selected" : "";
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
  },
  computed: {
    currentUser() {
      console.log(useUserStore().getUser());
      return useUserStore().getUser();
    },
    plans() {
      return this.currentPage === "My Plans" ? this.myPlans : this.presetPlans;
    },
  },
  mounted() {
    if (this.currentUser.userId) {
      planService.getPlansForMember(this.currentUser.userId).then((res) => {
        if (!res.error) {
          this.myPlans = res;
          console.log(this.myPlans);
        }
      });
    }
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

  +hr {
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
</style>
