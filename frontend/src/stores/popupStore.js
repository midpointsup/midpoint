import { markRaw } from "vue";
import InviteForm from "../components/forms/InviteForm.vue";
import { defineStore } from "pinia";

export const usePopupStore = defineStore("popup", {
  state: () => ({
    popups: [
      {
        component: markRaw(InviteForm),
        show: false,
        pos: {
          x: 0,
          y: 160,
        },
        key: "invite",
        bounding: null,
      },
    ],
  }),
  actions: {
    show(id) {
      this.popups[id].show = true;
    },
    hide(id) {
      this.popups[id].show = false;
    },
    move(id, { x, y }) {
      this.popups[id].pos.x = x;
      this.popups[id].pos.y = y;
    },
    getPopups() {
      return this.popups;
    },
  },
});
