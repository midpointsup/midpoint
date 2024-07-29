import { createWebHistory, createRouter } from "vue-router";

import HomePage from "@/views/HomePage.vue";
import SignPage from "@/views/SignPage.vue";
import { useUserStore } from "@/stores/userStore.js";
import userService from "@/services/userService.js";

const routes = [
  { path: "/", component: HomePage },
  { path: "/signin", component: SignPage, props: { type: "in" } },
  { path: "/signup", component: SignPage, props: { type: "up" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  console.log(userStore.getUser());
  if (
    userStore.getUser() !== null ||
    to.path === "/signin" ||
    to.path === "/signup"
  ) {
    next();
    return;
  }
  userService
    .getMe()
    .then((user) => {
      if (user.error) {
        userStore.setUser(null);
        next("/signup");
      } else {
        userStore.setUser(user);
        next();
      }
    })
    .catch(() => {
      if (to.path !== "/signin" && to.path !== "/signup") {
        next("/signup");
      } else {
        next();
      }
    });
});

export default router;
