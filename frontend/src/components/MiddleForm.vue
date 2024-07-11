<template>
  <div class="middle-form-wrapper" v-if="showInput">
    What is your starting location?
    <form class="outer-middle-form">
      <form class="middle-form">
        <input
          class="form-control"
          type="text"
          placeholder="Enter location"
          autofocus
          v-model="startLoc"
        />
        <button @click="addLocation" class="btn">Done</button>
      </form>

      <label for="travelMode">Travel Mode:</label>
      <select class="form-select" v-model="travelMode">
        <option value="DRIVE">Drive</option>
        <option value="WALK">Walk</option>
        <option value="BIKE">Bike</option>
        <option value="TRANSIT">Transit</option>
      </select>
    </form>
  </div>
  <ul class="mb-auto middle-info">
    <li v-if="!showInput">
      <h6>Your starting location</h6>
      <div class="middle-form">
        <span class="location">{{ startLoc }}</span>
        <button @click="editLocation" class="btn">Edit</button>
      </div>
    </li>
  </ul>
  <slot></slot>
  <button class="btn" @click="generateMiddle">Meet in the middle!</button>
  <button class="btn" @click="getDirections">Get Directions</button>
</template>

<script>
import routeService from "../services/route-service.js";
export default {
  data() {
    return {
      showInput: !this.startLocation,
      startLoc: this.startLocation ?? "",
      midpoint: {},
      travelMode: "DRIVE", // Default travel mode
    };
  },
  props: {
    numMembers: Number,
    startLocation: String,
  },
  methods: {
    addLocation() {
      if (this.startLoc?.trim()) {
        this.showInput = false;
        this.$emit("add-location", this.startLoc);
      }
    },
    editLocation() {
      this.showInput = true;
      this.$emit("clear-location");
    },
    async generateMiddle() {
      console.log("generateMiddle", this.startLoc, this.travelMode);
      const location = [
        {
          address: this.startLoc,
          mode: this.travelMode,
          radius: 1500,
        },
      ];
      routeService.middle(location, "restaurant", "cruise").then((response) => {
        if (response) {
          this.displayPlaces(response.places).then(() => {
            console.log("displayPlaces");
          });
          this.midpoint = response.midpoint;
          console.log("response", response, this.midpoint);
        }
      });
    },
    async displayPlaces(places) {
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
          `${place.vicinity} <br>`;
        ("</div>");

        const infowindow = new google.maps.InfoWindow({
          content: contentString,
        });
        marker.addListener("click", () => {
          infowindow.open(map, marker);
        });
      });
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
        destination: this.midpoint.address,
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

.location {
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
}
</style>
