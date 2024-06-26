<template>
  <div class="column-display">
    <ul class="nav nav-pills nav-flush flex-column mb-auto text-center">
      <li @click="toggleSidebar" v-if="!isSidebarOpen">
        <a
          href="#"
          class="nav-link py-3"
          aria-current="page"
          title=""
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          data-bs-original-title="Home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            class="bi bi-grid"
            viewBox="0 0 16 16"
          >
            <path
              d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"
            />
          </svg>
        </a>
      </li>
      <li v-else @click.prevent="toggleSidebar">
        <a
          href="#"
          class="nav-link py-3"
          title=""
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          data-bs-original-title="Dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            class="bi bi-x"
            viewBox="0 0 16 16"
          >
            <path
              d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
            />
          </svg>
        </a>
      </li>
      <li>
        <a
          @click="showPlans"
          title="Plans"
          href="#"
          class="nav-link link-dark side-bar-icon"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            class="bi bi-backpack"
            viewBox="0 0 16 16"
          >
            <path
              d="M4.04 7.43a4 4 0 0 1 7.92 0 .5.5 0 1 1-.99.14 3 3 0 0 0-5.94 0 .5.5 0 1 1-.99-.14M4 9.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5zm1 .5v3h6v-3h-1v.5a.5.5 0 0 1-1 0V10z"
            />
            <path
              d="M6 2.341V2a2 2 0 1 1 4 0v.341c2.33.824 4 3.047 4 5.659v5.5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5V8a6 6 0 0 1 4-5.659M7 2v.083a6 6 0 0 1 2 0V2a1 1 0 0 0-2 0m1 1a5 5 0 0 0-5 5v5.5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5V8a5 5 0 0 0-5-5"
            />
          </svg>
        </a>
        Plans
      </li>
      <li>
        <a
          @click="showCreatePlan"
          title="addPlan"
          href="#"
          class="nav-link link-dark side-bar-icon"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            class="bi bi-plus"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"
            />
          </svg>
        </a>
        Add Plan
      </li>
    </ul>

    <div class="dropdown">
      <a
        href="#"
        class="d-flex align-items-center link-dark text-decoration-none"
        id="dropdownUser2"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <img
          src="https://avatars.githubusercontent.com/u/57234754?s=400&u=7928d03725e3a137f7c37cd146c6cf0177b4765a&v=4"
          alt=""
          width="32"
          height="32"
          class="rounded-circle"
        />
      </a>
      <ul
        class="dropdown-menu text-small shadow"
        aria-labelledby="dropdownUser2"
      >
        <li><a class="dropdown-item" href="#">Settings</a></li>
        <li><a class="dropdown-item" href="#">Profile</a></li>
        <li>
          <hr class="dropdown-divider" />
        </li>
        <li>
          <a class="dropdown-item" href="#"
            ><RouterLink to="/login">Sign out</RouterLink></a
          >
        </li>
      </ul>
    </div>
  </div>

  <div v-if="isSidebarOpen" id="menu">
    <div
      class="d-flex flex-column flex-shrink-0 p-3 bg-light"
      style="width: 280px; height: 100%"
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
          <h4>{{ selectedPlan }}</h4>
          <ul class="nav nav-pills flex-column mb-auto">
            <li>
              <h6>Members</h6>
            </li>

            <li>
              <h6>Bookmarks</h6>
            </li>

            <li>
              <h6>Recommendations</h6>
            </li>
          </ul>
          <button @click="clearSelection" class="btn mt-3">Back</button>
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
              <a href="#" class="nav-link link-dark">
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
                {{ plan }}
                <hr />
                <!-- tags -->
                <p>Scarborough Town Center</p>
                <span class="badge">Jan 18-24</span>
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
            class="badge badge-pill bg-primary"
            v-for="(member, index) in membersList"
            :key="index"
          >
            {{ member }}
            <button @click="removeMember(index)" class="btn btn-sm">x</button>
          </span>
        </div>

        <br />
        Where do you want to meet?
        <input
          class="form-control"
          type="text"
          placeholder="Enter location"
          autofocus
        />

        <br />
        Select Categories
        <div id="categoryContainer">
          <div
            v-for="category in categories"
            :key="category.id"
            :data-key="category.id"
            class="category-icon"
            @click="toggleCategorySelection(category.id)"
          >
            <!-- <img :src="category.icon" :alt="category.name"
                        :class="{'selected': selectedCategoryIds.includes(category.id)}"> -->
            <span>{{ category.name }}</span>
          </div>
        </div>

        <br />
        Date
        <input
          class="form-control"
          type="text"
          placeholder="Enter date"
          autofocus
        />
        <button @click="addPlan" class="btn mt-3">Create</button>
      </div>
    </div>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
export default {
  data() {
    return {
      showInput: false,
      newPlanName: "",
      plans: ["Spiders", "Lunch Buddies"],
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
      selectedCategoryIds: [],
      isSidebarOpen: false,
      plansPage: true,
      createPlan: false,
    };
  },
  methods: {
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
    toggleCategorySelection(categoryId) {
      const index = this.selectedCategoryIds.indexOf(categoryId);
      if (index > -1) {
        document
          .querySelector(`[data-key='${categoryId}']`)
          .classList.remove("selected");
        this.selectedCategoryIds.splice(index, 1);
      } else {
        document
          .querySelector(`[data-key='${categoryId}']`)
          .classList.add("selected");
        this.selectedCategoryIds.push(categoryId);
      }
    },
    addMember() {
      if (this.newMemberName.trim() !== "") {
        this.membersList.push(this.newMemberName);
        this.newMemberName = ""; // Clear the input field
      }
    },
    removeMember(index) {
      this.membersList.splice(index, 1); // Remove the member at the given index
    },
    addPlan() {
      if (this.newPlanName.trim()) {
        this.plans.push(this.newPlanName.trim());
        this.newPlanName = ""; // Reset input field
        this.showInput = false; // Hide input field
      }
    },
  },
};
</script>

<style>
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
