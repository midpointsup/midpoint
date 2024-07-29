import { defineStore } from "pinia";

export const usePlanStore = defineStore("plan", {
  state: () => ({
    plan: null,
  }),
  actions: {
    setPlan(plan) {
      this.plan = plan;
    },
    getPlan() {
      return this.plan;
    },
    updateSelectedPlan(address) {
      this.plan.address = address;
    }
  },
});
