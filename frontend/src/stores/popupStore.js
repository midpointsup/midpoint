import { markRaw } from "vue";
import InviteForm from "@/components/forms/InviteForm.vue";
import { defineStore } from "pinia";
import RouteView from "@/components/RouteView.vue";

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
      {
        component: markRaw(RouteView),
        show: false,
        pos: {
          x: 0,
          y: 160,
        },
        key: "routeview",
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
    toggle(id) {
      this.popups[id].show = !this.popups[id].show;
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
