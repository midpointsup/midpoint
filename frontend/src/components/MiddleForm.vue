<template>
  <div class="middle-form-wrapper" v-if="showInput">
    What is your starting location?
    <form class="outer-middle-form">
      <form class="middle-form">
        <gmpx-place-picker
          placeholder="Enter a place"
          id="place-picker"
          for-map="map"
          :value="startLoc"
          @gmpx-placechange="handleLocationChange($event, 'start')"
        ></gmpx-place-picker>
        <div id="infowindow-content">
          <span id="place-name" class="title" style="font-weight: bold"></span
          ><br />
          <span id="place-address"></span>
        </div>
        <button :disabled="!startLoc" @click="addLocation" class="btn">
          Done
        </button>
      </form>

      <label for="travelMode">Travel Mode:</label>
      <select class="form-select" v-model="travelMode">
        <option value="DRIVE">Drive</option>
        <option value="WALK">Walk</option>
        <option value="BIKE">Bike</option>
        <option value="TRANSIT">Transit</option>
      </select>

      <label for="radius">Radius of Midpoint:</label>
      <input
        v-model="radius"
        type="number"
        placeholder="ie: 100m"
        class="form-control"
        id="radius"
      />
    </form>
  </div>
  <ul class="mb-auto middle-info">
    <li v-if="!showInput">
      <h6>Your starting location</h6>
      <div class="middle-form">
        <span class="display-info">{{ startLoc }}</span>
        <button @click="editLocation" class="btn">Edit</button>
      </div>
      <div class="info-form">
        <h6>Travel Mode</h6>
        <span class="display-info">{{ this.travelMode }}</span>
        <h6>Radius</h6>
        <span class="display-info">{{ this.radius }}</span>

        <h6>Midpoint</h6>
        <div class="middle-form">
          <span v-if="!editMidpoint" class="display-info">{{
            this.midpoint
          }}</span>
          <gmpx-place-picker
            v-if="editMidpoint"
            id="place-picker-midpoint"
            placeholder="Enter Midpoint"
            @gmpx-placechange="handleLocationChange($event, 'midpoint')"
          ></gmpx-place-picker>
          <div v-if="!editMidpoint" id="infowindow-content">
            <span id="place-name" class="title" style="font-weight: bold"></span
            ><br />
            <span id="place-address"></span>
          </div>

          <button @click="editMidpointAddress" class="btn">
            {{ editMidpoint ? "Done" : "Edit" }}
          </button>
        </div>
      </div>
      <br />
    </li>
  </ul>
  <slot></slot>
  <button class="btn" :disabled="!allLocationsVerified" @click="generateMiddle">
    Meet in the middle!
  </button>
  <br />
  <button class="btn" :disabled="midpoint == ''" @click="getDirections">
    Get Directions
  </button>
</template>

<script>
import routeService from "../services/route-service.js";
import planService from "../services/plan-service.js";
import { notificationMixin } from "@/mixins/notificationMixin.js";
import io from "socket.io-client";

export default {
  mixins: [notificationMixin],
  data() {
    return {
      editMidpoint: false,
      editedMidpoint: "",
      showInput: !this.startLocation,
      startLoc: this.startLocation ?? "",
      midpoint: this.selectedPlan?.address ?? "",
      travelMode:
        this.selectedPlan?.members.find(
          (member) => member.id === this.currentUser.userId
        ).Trips[0].transportationMethod === ""
          ? "DRIVE"
          : this.selectedPlan?.members.find(
              (member) => member.id === this.currentUser.userId
            ).Trips[0].transportationMethod,
      radius: this.selectedPlan?.members.find(
        (member) => member.id === this.currentUser.userId
      ).Trips[0].radius,
      allLocationsVerified: this.selectedPlan.members.every(
        (member) => member.Trips[0].startLocation !== ""
      ),
      currentInfoWindow: null,
      socket: null,
    };
  },
  props: {
    startLocation: String,
    selectedPlan: Object,
    currentUser: Object,
  },
  mounted() {
    this.initPlacePicker("place-picker");
    this.initPlacePicker("place-picker-midpoint");

    this.socket = io("http://localhost:3000");

    this.socket.on("connect", () => {
      this.socket.emit("join-room", "room" + this.selectedPlan.id);
    });

    this.socket.on("planUpdate", (data) => {
      this.notifySuccess("Midpoint updated", data);
      this.midpoint = data.address;
    });

    this.socket.on("trip", (data) => {
      this.selectedPlan.members = this.selectedPlan.members.map((member) => {
        if (member.id === data.UserId) {
          member.Trips[0] = data;
        }
        return member;
      });
      this.allLocationsVerified = this.selectedPlan.members.every(
        (member) => member.Trips[0].startLocation !== ""
      );
    });
  },
  beforeUnmount() {
    this.disconnectSocket();
  },
  methods: {
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
      }
    },
    initPlacePicker(id) {
      const placePickerEl = document.getElementById(id);
      if (placePickerEl) {
        placePickerEl.addEventListener("gmpx-placechange", () => {
          if (id === "place-picker-midpoint") {
            this.editedMidpoint = placePickerEl.value?.formattedAddress;
          } else {
            const place = placePickerEl.value;
            this.startLoc = placePickerEl.value?.formattedAddress;

            if (!place || !place.location) {
              this.notifyError(
                "No details available for input. Please try again.'"
              );
              this.infowindow.close();
              return;
            }
          }
        });
      }
    },
    handleLocationChange(newLocation, locationType) {
      if (locationType === "midpoint") {
        this.editedMidpoint = newLocation.target.value.formattedAddress;
      } else if (locationType === "start") {
        this.startLoc = newLocation.target.value.formattedAddress;
      }
    },
    addLocation() {
      if (this.startLoc?.trim()) {
        this.showInput = false;

        // get the trip id of the current user from the selectedPlan id
        const tripId = this.selectedPlan.members.find(
          (member) => member.id === this.currentUser.userId
        ).Trips[0].id;

        planService
          .updateTrip(this.selectedPlan.id, this.currentUser.userId, tripId, {
            transportationMethod: this.travelMode,
            startLocation: this.startLoc,
            endLocation: this.selectedPlan.endLocation,
            startTime: this.selectedPlan.startTime,
            radius: this.radius,
          })
          .then((response) => {
            this.selectedPlan.members.find(
              (member) => member.id === this.currentUser.userId
            ).Trips[0].transportationMethod = this.travelMode;
            this.allLocationsVerified = this.selectedPlan.members.every(
              (member) => member.Trips[0].startLocation !== ""
            );
            this.notifySuccess("Starting location added");
          });
      }
    },
    editLocation() {
      this.showInput = true;
      this.$emit("add-location", "");
      this.allLocationsVerified = false;
      this.startLoc = "";
    },
    async generateMiddle() {
      const locations = this.selectedPlan.members.map(
        (member) => member.Trips[0]
      );

      routeService
        .middle(locations, this.selectedPlan.category, "cruise")
        .then((response) => {
          if (response) {
            if (!response.midpoint) {
              this.notifyError("No midpoint found");
              return;
            }
            this.displayPlaces(response.places).then(() => {});
            this.midpoint = response.midpoint.address;
            this.$emit("generate-midpoint", this.midpoint);
          }
        });
    },
    async displayPlaces(places) {
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
            this.currentInfoWindow.close();
          }
          infowindow.open(map, marker);
          this.currentInfoWindow = infowindow;
        });

        google.maps.event.addListener(infowindow, "domready", () => {
          const buttonId = `updateMidpointBtn${place.name}`;
          document.getElementById(buttonId).addEventListener("click", () => {
            this.updateMidpoint(place.vicinity);
          });
        });
      });
    },
    editMidpointAddress() {
      if (this.editMidpoint && this.editedMidpoint) {
        this.updateMidpoint(this.editedMidpoint);
      }
      this.editMidpoint = !this.editMidpoint;
    },
    updateMidpoint(location) {
      this.midpoint = location;
      this.$emit("generate-midpoint", location);
    },
    async getDirections() {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer();
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
      });
      directionsRenderer.setMap(map);

      const travelModes = {
        DRIVE: google.maps.TravelMode.DRIVING,
        WALK: google.maps.TravelMode.WALKING,
        BIKE: google.maps.TravelMode.BICYCLING,
        TRANSIT: google.maps.TravelMode.TRANSIT,
      };

      const request = {
        origin: this.startLoc,
        destination: this.midpoint,
        travelMode: travelModes[this.travelMode],
      };
      directionsService.route(request, (result, status) => {
        if (status == "OK") {
          directionsRenderer.setDirections(result);
        } else if (status == "ZERO_RESULTS") {
          this.notifyError(
            "No route found. Please update your midpoint or starting point."
          );
        } else {
          this.notifyError("Directions request failed due to " + status);
        }
      });
    },
  },
};
</script>

<style>
.middle-form-wrapper {
  margin: 10px 0px;
}

.outer-middle-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.middle-form {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100%;
}

.middle-info {
  margin-top: 20px;
  padding: 0;
  list-style: none;
}

.display-info {
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
}

.info-form {
  display: flex;
  flex-direction: column;
}
</style>
