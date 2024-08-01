<template>
  <div class="explore-list" v-if="selectedPreset === null">
    <p class="mt-3 mb-2">Select a Plan Template</p>
    <div v-for="preset in presets" :key="preset.id" class="preset-item">
      <h6 class="mt-3">{{ preset.name }}</h6>
      <p class="preset-description">{{ preset.description }}</p>
      <ul class="activities-list">
        <li v-for="activity in preset.activities" :key="activity.name">
          {{ activity.name }}
          <span class="form-text">{{ activity.duration }} mins</span>
        </li>
      </ul>
      <button @click="selectPreset(preset)" class="preset-btn">
        Go on this plan!
      </button>
    </div>
  </div>
  <div v-else>
    <a @click="selectedPreset = null" class="back-btn mt-3">Back</a>
    <AddPlanForm
      :template="true"
      :templateName="selectedPreset.name"
      @createPlan="createPlanFromTemplate"
      :currentUser="currentUser"
    >
      <p class="preset-description">{{ selectedPreset.description }}</p>
      <ul class="activities-list">
        <li v-for="activity in selectedPreset.activities" :key="activity.name">
          {{ activity.name }}
          <span class="form-text">{{ activity.duration }} mins</span>
        </li>
      </ul>
    </AddPlanForm>
  </div>
</template>

<script>
import AddPlanForm from "@/components/forms/AddPlanForm.vue";
import planService from "@/services/planService.js";

export default {
  components: {
    AddPlanForm,
  },
  data() {
    return {
      selectedPreset: null,
      presets: [
        {
          id: 1,
          name: "Movie Date",
          description: "Enjoy a relaxing movie date with dinner.",
          activities: [
            { name: "Watch Movie", duration: 120, category: "Cinemas" },
            { name: "Dinner", duration: 60, category: "Restaurants" },
          ],
        },
        {
          id: 2,
          name: "City Tour",
          description:
            "Explore the city with a museum visit, lunch, and a city walk.",
          activities: [
            { name: "Visit Museum", duration: 90, category: "Museums" },
            { name: "Lunch", duration: 60, category: "Restaurants" },
            { name: "City Walk", duration: 120, category: "Parks" },
          ],
        },
        {
          id: 3,
          name: "Beach Day",
          description:
            "Spend a day at the beach with swimming, sunbathing, and beach volleyball.",
          activities: [
            { name: "Swimming", duration: 60, category: "Beaches" },
            { name: "Beach Volleyball", duration: 90, category: "Sports" },
          ],
        },
        {
          id: 4,
          name: "Mountain Hike",
          description: "Enjoy a day of hiking and a picnic in the mountains.",
          activities: [
            { name: "Hiking", duration: 180, category: "Hiking" },
            { name: "Picnic", duration: 60, category: "Parks" },
          ],
        },
      ],
    };
  },
  methods: {
    selectPreset(preset) {
      console.log("Selected Preset:", preset);
      this.selectedPreset = preset;
    },
    createPlanFromTemplate(preset) {
      planService.createPlan(
        preset.planName,
        preset.membersList,
        this.selectedPreset.activities[0].category,
        preset.date,
        preset.planColour
      );
      preset.onSuccess();
    },
  },
};
</script>

<style scoped>
.explore-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.preset-item {
  margin: 10px 0;
  background: var(--color-background);
  margin: 5px 0;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.preset-btn {
  background-color: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  margin: 10px 0px;

  &:hover {
    background-color: var(--dark-green);
  }
  &:active {
    transform: translateY(3px);
  }
}

.activities-list {
  list-style-type: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.preset-description {
  font-style: italic;
  color: #666666;
  margin-bottom: 10px;
}
</style>
