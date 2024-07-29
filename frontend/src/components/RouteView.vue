<template>
  <RouteDisplayTabs
    v-if="selectedPlan && selectedPlan.address"
    :planId="selectedPlan.id"
    :destination="selectedPlan.address"
    @update:destination="updateTabProp"
  ></RouteDisplayTabs>
</template>


<script>
import RouteDisplayTabs from "@/components/RouteDisplayTabs.vue";
import { usePlanStore } from "@/stores/planStore";

export default {
  components: {
    RouteDisplayTabs,
  },
  computed: {
    selectedPlan() {
      return usePlanStore().getPlan();
    },
  },
  methods: {
    updateTabProp(destination) {
      usePlanStore().updateSelectedPlan(destination);
    },
  },
};
</script>