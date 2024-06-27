import { createMemoryHistory, createRouter } from "vue-router";

import HomePage from "@/views/HomePage.vue";
import LoginPage from "@/views/LoginPage.vue";
import SignUpPage from "@/views/SignUpPage.vue";
import LandingPage from "@/views/LandingPage.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/login", component: LoginPage },
  { path: "/signup", component: SignUpPage },
  { path: "/landing", component: LandingPage },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
