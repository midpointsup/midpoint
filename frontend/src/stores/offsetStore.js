import { defineStore } from "pinia";
import { useElementBounding } from "@vueuse/core";

export const useBoundingStore = defineStore("bounding", {
  state: () => ({
    bounding: {},
  }),
  actions: {
    setBounding(key, ref) {
      this.bounding[key] = useElementBounding(ref);
    },
    getBounding(key) {
      return this.bounding[key];
    },
  },
});
