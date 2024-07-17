<template>
<ul class="nav nav-tabs">
<li class="nav-item" role="presentation">
    <button class="nav-link active" id="my-route-tab" data-bs-toggle="tab" data-bs-target="#my-route" type="button" role="tab" aria-controls="home" aria-selected="true">My Route</button>
</li>
<li class="nav-item" role="presentation">
    <button class="nav-link " id="home-tab" data-bs-toggle="tab" data-bs-target="#group-route" type="button" role="tab" aria-controls="home" aria-selected="true">Group Routes</button>
</li>
</ul>
<div class="tab-content" id="myTabContent">
  <div class="tab-pane fade show active" id="my-route" role="tabpanel" aria-labelledby="my-route-tab">This is my route

  </div>
  <div class="tab-pane fade" id="group-route" role="tabpanel" aria-labelledby="group-route-tab">
    <ul class="list-group">
      <li v-for="(route, index) in routes" :key="route.id" class="list-group-item list-item">
        <groupRouteCard
        :name="route.User.username"
        :startTime=route.startTime
        endTime="end time"
        :startLocation=route.startLocation
        :mode=route.transportationMethod
        duration="1 hour"
        distance="20km"
        :color="colours[index]"
        :picture="route.User.picture"
        :destination="destination"></groupRouteCard>
        </li>
    </ul>
  </div>
</div>
</template>

<script>
import groupRouteCard from "@/components/groupRouteCard.vue";
import planService from "../services/plan-service.js";
export default {
  props: {
    planId: String,
    destination: String
  },
  data() {
    return {
      routes: [],
      colours: [
      '#00BFFF', // Deep Sky Blue
      '#FF6347', // Tomato
      '#32CD32', // Lime Green
      '#FFD700', // Gold
      '#FF69B4', // Hot Pink
      '#1E90FF', // Dodger Blue
      '#3CB371', // Medium Sea Green
      '#FF7F50', // Coral
      '#9932CC', // Dark Orchid
      '#FFA500'  // Orange
    ]
    }
  },
components: {
  groupRouteCard
},
mounted() {
  this.getGroupTrips();
  console.log(this.routes)

},
methods: {
  getGroupTrips() {
    planService.getTrips(this.planId).then(async (response) => {
      if (response.error) {
        this.routes = response.data;
        console.log(response)
      } else {
        this.routes = response.trips;
        console.log(this.routes)
        await this.getDirections();
        console.log(response)
      }
    });
  },
  async getDirections() {
      const directionsService = new google.maps.DirectionsService();
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
      });
      console.log("rendering2")
      this.routes.forEach(route => {
        console.log(route)
      });
      console.log(this.routes)
      this.routes.forEach((route, index) => {
        console.log("rendering")
        var directionsRenderer = new google.maps.DirectionsRenderer();
    
      directionsRenderer.setOptions({ polylineOptions: { strokeColor: this.colours[index]} });
      directionsRenderer.setMap(map);

      const travelModes = {
        DRIVE: google.maps.TravelMode.DRIVING,
        WALK: google.maps.TravelMode.WALKING,
        BIKE: google.maps.TravelMode.BICYCLING,
        TRANSIT: google.maps.TravelMode.TRANSIT,
      };

      const request = {
        origin:  route.startLocation,
        destination: this.destination,
        travelMode: travelModes["DRIVE"],
      };
      directionsService.route(request, (result, status) => {
        if (status == "OK") {
          directionsRenderer.setDirections(result);
        }
      });
      });
      
    },
  /*
  displayGroupRoutes() {
    // get all group routes
    routes = getGroupRoutes();//fill this
    routes.forEach(route => {
      //display each route
    });
  }
    */
}
}
</script>

<style>
.list-item {
  padding: 5px;
}
</style>