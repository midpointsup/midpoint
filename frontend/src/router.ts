import { createMemoryHistory, createRouter } from "vue-router";

import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import SignUp from "@/views/SignUp.vue";
import Landing from "@/views/Landing.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: SignUp },
  { path: "/landing", component: Landing },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
