
<template>
  <div class="px-1">
    <label for="placePicker" class="py-2">{{ locationQuestion }}</label>
    <form class="d-flex gap-1 mb-2">
      <gmpx-place-picker
        placeholder="Enter a place"
        id="placePicker"
        for-map="map"
        @gmpx-placechange="handleLocationChange($event, 'start')"
      ></gmpx-place-picker>
      <button :disabled="!startLoc" class="btn-location btn-done" @click="addStartingLocation" type="button"></button>
    </form>
  </div>

  <Stepper value="1">
    <StepItem v-for="(trip, index) in currentTrips" :key="`step${index}`" :value="`${index + 1}`">
      <Step>{{ !trip.startLocation ? "No Location" : trip.startLocation }}</Step>
      <StepPanel v-slot="{ activateCallback }" class="rounded py-2 pe-3">
        <form class="d-flex gap-2 flex-column">
          <span>{{ trip.category }}</span>

          <label for="travelMode">Travel Mode:</label>
          <select class="form-select" v-model="travelMode[index]" id="travelMode">
            <option value="DRIVE">Drive</option>
            <option value="WALK">Walk</option>
            <option value="BIKE">Bike</option>
            <option value="TRANSIT">Transit</option>
          </select>

          <label for="radius">Radius from Midpoint (m):</label>
          <input
            v-model="radius[index]"
            type="number"
            placeholder="100"
            class="form-control"
            id="radius"
          />
          <button
            class="btn mt-2"
            :disabled="!allLocationsVerified[index]"
            @click="generateMiddle(index, () => activateCallback(`${index + 2}`))"
            type="button"
          >
            Meet in the middle!
        </button>
        </form>
      </StepPanel>
    </StepItem>
  </Stepper>
</template>


<script>
import Stepper from 'primevue/stepper';
import StepItem from 'primevue/stepitem';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';

import { usePlanStore } from '@/stores/planStore.js';
import { useUserStore } from '@/stores/userStore.js';
import MiddleForm from '@/components/forms/MiddleForm.vue';
import "@googlemaps/extended-component-library/place_picker.js";

import planService from '@/services/planService.js';
import { notificationMixin } from '@/mixins/notificationMixin.js';
import routeService from '@/services/routeService.js';
import io from "socket.io-client";

export default {
  mixins: [notificationMixin],
  components: {
      Stepper,
      Step,
      StepPanel,
      StepItem,
      MiddleForm,
  },
  emits: ["generate-midpoint"],
  data() {
    return {
      currentTrips: [],
      startLoc: null,
      travelMode: [],
      radius: [],
      socker: null,
    };
  },
  mounted() {
    this.initPlacePicker("placePicker");
    this.currentTrips = this.selectedPlan.members.find((member) => member.id === this.currentUser.userId).Trips.sort((a, b) => a.id - b.id) ?? [];
    this.travelMode = this.currentTrips.map((trip) => trip.transportationMethod === "" ? "DRIVE" : trip.transportationMethod);
    this.radius = this.currentTrips.map((trip) => trip.radius ?? 100);

    this.socket = io("http://localhost:3000");

    this.socket.on("connect", () => {
      this.socket.emit("join-room", "room" + this.selectedPlan.id);
    });

    // this.socket.on("trip", (data) => {
    //   const plan = this.selectedPlan;
    //   plan.members = plan.members.map((member) => {
    //     if (member.id === data.UserId) {
    //       member.Trips = member.Trips.map((trip) => {
    //         if (trip.id === data.id) {
    //           trip = data;
    //         }
    //         return trip;
    //       });
    //     }
    //     return member;
    //   });
    //   console.log(plan);
    //   debugger;
    //   usePlanStore().setPlan(plan);
    // });
  },
  computed: {
    currentUser() {
      return useUserStore().getUser();
    },
    selectedPlan() {
      return usePlanStore().getPlan();
    },
    allLocationsVerified() {
      const plan = usePlanStore().getPlan();
      const startLocations = [];
      plan.members.forEach((member) => {
        const trips = member.Trips.sort((a, b) => a.id - b.id);
        for (let i = 0; i < trips.length; i++) {
          startLocations[i] = (startLocations.length > i ? startLocations[i] : true) && trips[i].startLocation !== "";
        }
      });
      return startLocations;
    },
    locationQuestion() {
      return this.currentTrips[0]?.startLocation ? "Change your starting location:" : "Enter your starting location:";
    }
  },
  methods: {
    handleLocationChange(newLocation) {
      this.startLoc = newLocation.target.value?.formattedAddress ?? null;
    },
    addStartingLocation() {
      if (this.startLoc?.trim()) {
        const trip = this.currentTrips[0];
        planService
          .updateTrip(this.selectedPlan.id, this.currentUser.userId, trip.id, {
            ...trip,
            startLocation: this.startLoc,
          })
          .then(() => {
            this.notifySuccess("Starting location changed successfully!");
          });
      }
    },
    initPlacePicker(id) {
      const placePickerEl = document.getElementById(id);
      if (placePickerEl) {
        placePickerEl.addEventListener("gmpx-placechange", () => {
          const place = placePickerEl.value;
          if (id === "place-picker-midpoint") {
            this.editedMidpoint = place?.formattedAddress;
          } else {
            this.startLoc = place?.formattedAddress;
          }
          if (!place || !place.location) {
            this.notifyError(
              "No details available for input. Please try again."
            );
          }
        });
      }
    },
    generateMiddle(index, goToNextStep) {
      const locations = this.selectedPlan.members.map((member) => member.Trips.sort((a, b) => a.id - b.id)[index]);
      routeService
        .middle(locations, locations[0].category)
        .then((response) => {
          if (response) {
            if (!response.midpoint) {
              this.notifyError("No midpoint found");
              return;
            }
            this.displayPlaces(response.places, index, goToNextStep);
          }
        });
    },
    displayPlaces(places, index, goToNextStep) {
      if (places.length === 0) {
        this.notifyError("No places found");
        return;
      }
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: places[0].geometry.location,
      });
      places.forEach((place) => {
        const marker = new google.maps.Marker({
          position: place.geometry.location,
          map,
          title: place.name,
        });

        const contentString =
          '<div id="content">' +
          `${place.name} <br>` +
          `${place.vicinity} <br>` +
          `<button class="btn" id="updateMidpointBtn${place.name}">Meet here</button>`;
        ("</div>");

        const infowindow = new google.maps.InfoWindow({
          content: contentString,
        });
        marker.addListener("click", () => {
          if (this.currentInfoWindow) {
            this.currentInfoWindow?.close();
          }
          infowindow.open(map, marker);
          this.currentInfoWindow = infowindow;
        });

        google.maps.event.addListener(infowindow, "domready", () => {
          const buttonId = `updateMidpointBtn${place.name}`;
          document.getElementById(buttonId).addEventListener("click", () => {
            this.updateMidpoint(place.vicinity, index, goToNextStep);
          });
        });
      });
    },
    updateMidpoint(midpoint, index, goToNextStep) {
      this.selectedPlan.members.forEach((member) => {
        const trips = member.Trips.sort((a, b) => a.id - b.id);
        planService.updateTrip(this.selectedPlan.id, member.id, trips[index].id, {
          ...trips[index],
          endLocation: midpoint,
        }).then((res) => {
          console.log(this.currentTrips)
          this.currentTrips = this.currentTrips.map((trip) => {
            if (trip.id === res.id) {
              trip = res;
            }
            return trip;
          });
          goToNextStep();
          if (index + 1 < trips.length) {
            planService.updateTrip(this.selectedPlan.id, member.id, trips[index + 1].id, {
              ...trips[index + 1],
              startLocation: midpoint,
            }).then(() => {
              this.notifySuccess("Midpoint updated successfully!");
            });
          } else {
            this.notifySuccess("Midpoint updated successfully!");
          }
        })
      });
    },
  }
};

</script>

<style>
.btn-location {
  background-size: 20px;
  background-repeat: no-repeat;
  background-color: var(--primary);
  background-position: center;
  border: none;
  cursor: pointer;
  width: 50px;
  height: 40px;
  border-radius: 4px;
  padding: 0;
  margin: 0;

  &:hover:not(:disabled) {
    filter: brightness(0.8);
  }

  &:disabled {
    cursor: not-allowed;
    border: 1px solid var(--black);
    background-color: var(--color-background-secondary);
  }
}

.btn-done {
  background-image: url(@/assets/static/check2.svg);
}

.btn-edit {
  background-image: url(@/assets/static/pencil.svg);
}
</style>