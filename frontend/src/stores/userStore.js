import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    colour: null,
  }),
  actions: {
    setUser(user) {
      this.user = user;
    },
    getUser() {
      return this.user;
    },
    setColour(colour) {
      this.colour = colour;
    },
    getColour() {
      return this.colour;
    },
  },
});
