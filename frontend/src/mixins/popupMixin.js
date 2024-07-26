import { markRaw } from "vue";
import InviteForm from "../components/forms/InviteForm.vue";

export const popupMixin = {
  data() {
    return {
      popups: [
        {
          component: markRaw(InviteForm),
          show: true,
          pos: {
            x: 0,
            y: 0,
          },
          key: "invite",
          bounding: null,
        },
        {
          component: markRaw(InviteForm),
          show: true,
          pos: {
            x: 200,
            y: 0,
          },
          key: "aaaaaaa",
          bounding: null,
        },
      ],
    };
  },
  methods: {
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
  },
};