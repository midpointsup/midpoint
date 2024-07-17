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
          @gmpx-placechange="handleLocationChange"
        ></gmpx-place-picker>
        <div id="infowindow-content">
          <span id="place-name" class="title" style="font-weight: bold"></span
          ><br />
          <span id="place-address"></span>
        </div>
        <button @click="addLocation" class="btn">Done</button>
      </form>

      <label for="travelMode">Travel Mode:</label>
      <select class="form-select" v-model="travelMode">
        <option value="DRIVE">Drive</option>
        <option value="WALK">Walk</option>
        <option value="BIKE">Bike</option>
        <option value="TRANSIT">Transit</option>
      </select>

      <label for="radius">Radius:</label>
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
      </div>
      <br />
    </li>
  </ul>
  <slot></slot>
  <button class="btn" @click="generateMiddle">Meet in the middle!</button>
  <br />
  <button class="btn" @click="getDirections">Get Directions</button>
</template>

<script>
import routeService from "../services/route-service.js";
import planService from "../services/plan-service.js";
export default {
  data() {
    return {
      showInput: !this.startLocation,
      startLoc: this.startLocation ?? "",
      midpoint: this.selectedPlan?.address ?? "",
      travelMode:
        this.selectedPlan?.members.find(
          (member) => member.id === this.currentUser.id
        ).Trips[0].transportationMethod === ""
          ? "DRIVE"
          : this.selectedPlan?.members.find(
              (member) => member.id === this.currentUser.id
            ).Trips[0].transportationMethod,
      radius: this.selectedPlan?.members.find(
        (member) => member.id === this.currentUser.id
      ).Trips[0].radius,
    };
  },
  props: {
    startLocation: String,
    selectedPlan: Object,
    currentUser: Object,
  },
  mounted() {
    this.placePicker = document.getElementById("place-picker");
    if (this.placePicker) {
      this.placePicker.addEventListener("gmpx-placechange", () => {
        const place = this.placePicker.value;
        this.startLoc = this.placePicker.value.formattedAddress;

        if (!place.location) {
          window.alert("No details available for input: '" + place.name + "'");
          this.infowindow.close();
          return;
        }

        this.infowindowContent.children["place-name"].textContent =
          place.displayName;
        this.infowindowContent.children["place-address"].textContent =
          place.formattedAddress;
      });
    }
  },
  methods: {
    handleLocationChange(newLocation) {
      this.startLoc = newLocation.target.value.formattedAddress;
    },
    addLocation() {
      if (this.startLoc?.trim()) {
        this.showInput = false;
        this.$emit("add-location", this.startLoc);

        // get the trip id of the current user from the selectedPlan id
        const tripId = this.selectedPlan.members.find(
          (member) => member.id === this.currentUser.id
        ).Trips[0].id;

        planService
          .updateTrip(this.selectedPlan.id, this.currentUser.id, tripId, {
            transportationMethod: this.travelMode,
            startLocation: this.selectedPlan.startLocation,
            endLocation: this.selectedPlan.endLocation,
            startTime: this.selectedPlan.startTime,
            radius: this.radius,
          })
          .then((response) => {
            this.selectedPlan.members.find(
              (member) => member.id === this.currentUser.id
            ).Trips[0].transportationMethod = this.travelMode;
          });
      }
    },
    editLocation() {
      this.showInput = true;
      this.$emit("clear-location");
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
              window.alert("No midpoint found");
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
        window.alert("No places found");
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
          infowindow.open(map, marker);
        });

        google.maps.event.addListener(infowindow, "domready", () => {
          const buttonId = `updateMidpointBtn${place.name}`;
          document.getElementById(buttonId).addEventListener("click", () => {
            this.updateMidpoint(place.vicinity);
          });
        });
      });
    },
    updateMidpoint(location) {
      this.midpoint = location;
      this.$emit("generate-midpoint", location);
      window.alert("Midpoint succesfully updated");
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
