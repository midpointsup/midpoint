import { createMemoryHistory, createRouter } from "vue-router";

import Home from "@/views/Home.vue";
import Landing from "@/views/Landing.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/landing", component: Landing },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
