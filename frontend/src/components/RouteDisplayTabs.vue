<template>
  <ul class="nav nav-tabs">
    <li class="nav-item" role="presentation">
      <button
        class="nav-link active"
        id="my-route-tab"
        data-bs-toggle="tab"
        data-bs-target="#my-route"
        type="button"
        role="tab"
        aria-controls="home"
        aria-selected="true"
      >
        My Route
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button
        class="nav-link"
        id="home-tab"
        data-bs-toggle="tab"
        data-bs-target="#group-route"
        type="button"
        role="tab"
        aria-controls="home"
        aria-selected="true"
      >
        Group Routes
      </button>
    </li>
  </ul>
  <div class="tab-content" id="myTabContent">
    <div
      class="tab-pane fade show active"
      id="my-route"
      role="tabpanel"
      aria-labelledby="my-route-tab"
    >
      This is my route
      <MyRouteTab
        :planId="planId"
        :destination="destination">
      </MyRouteTab>
    </div>
    <div
      class="tab-pane fade"
      id="group-route"
      role="tabpanel"
      aria-labelledby="group-route-tab"
    >
      <ul class="list-group">
        <li
          v-for="(route, index) in routes"
          :key="route.id"
          class="list-group-item list-item"
        >
          <groupRouteCard
            :name="route.User.username"
            :startTime="route.startTime"
            endTime="end time"
            :startLocation="route.startLocation"
            :mode="route.transportationMethod"
            duration="1 hour"
            distance="20km"
            :color="colours[index]"
            :picture="route.User.picture"
            :destination="destination"
          ></groupRouteCard>
        </li>
        <div ref="directionsPanel"></div>
      </ul>
    </div>
  </div>
</template>

<script>
import groupRouteCard from "@/components/groupRouteCard.vue";
import planService from "../services/plan-service.js";
import io from "socket.io-client";
import { useUserStore } from "../stores/userStore.js";
import MyRouteTab from "./MyRouteTab.vue";

export default {
  props: {
    planId: String,
    destination: String,
  },
  data() {
    return {
      routes: [],
      directionsRenderers: [],
      directionsService: new google.maps.DirectionsService(),
      directionsArray: [],
      colours: [
        "#00BFFF", // Deep Sky Blue
        "#FF6347", // Tomato
        "#32CD32", // Lime Green
        "#FFD700", // Gold
        "#FF69B4", // Hot Pink
        "#1E90FF", // Dodger Blue
        "#3CB371", // Medium Sea Green
        "#FF7F50", // Coral
        "#9932CC", // Dark Orchid
        "#FFA500", // Orange
      ],
    };
  },
  components: {
    groupRouteCard,
    MyRouteTab,
  },
  mounted() {
    //const directionsService = new google.maps.DirectionsService();
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("connected");
      socket.emit("join-room", "room" + this.planId);
      console.log("socket id is", socket.id);
    });

    // Listen for the 'joinedRoom' event to confirm joining
socket.on("joined-room", (roomId) => {
  console.log(`Successfully joined room ${roomId}`);
  // Additional logic upon successfully joining the room can be added here
});


    //this.setDirectionRenderers();

    socket.on("trip", (trip) => {
      console.log("trip event");
      console.log(trip);
      //this.getGroupTrips();
      if (!trip.error) {
        //update route in data local
        this.routes.forEach((route, index) => {
          if (
            route.id === trip.id &&
            useUserStore().getUser().userId !== route.UserId
          ) {
            let oldRoute = JSON.parse(JSON.stringify(this.routes[index]));
            this.routes[index] = trip;
            this.drawRoute(trip, index, oldRoute);
          }
          console.log("inside here");
        });
      }
    });
    this.$nextTick(() => {
      this.getGroupTrips();
    });
    console.log(this.routes);

    // directionsRenderer.addListener("directions_changed", () => {
    //   console.log("directions changed");
    // });
  },
  methods: {
    getGroupTrips() {
      planService.getTrips(this.planId).then(async (response) => {
        if (response.error) {
          this.routes = response.data;
          console.log(response);
        } else {
          this.routes = response.trips;
          this.setDirectionRenderers();
          console.log(this.routes);
          await this.getDirections();
          console.log(response);
        }
      });
    },

    setDirectionRenderers() {
      this.routes.forEach((route, index) => {
        //let editable = route.User.id === this.$store.state.user.id;
        var directionsRenderer = new google.maps.DirectionsRenderer();
        if (route.UserId === useUserStore().getUser().userId) {
          directionsRenderer.setOptions({ draggable: true });
        }
        directionsRenderer.setOptions({
          polylineOptions: { strokeColor: this.colours[index] },
          suppressMarkers: true
        });
        this.directionsRenderers.push(directionsRenderer);
      });
    },

    checkSameRoute(route, index, oldRoute) {
      console.log("new route", route);
      console.log("old route", oldRoute);
      if (!route || !oldRoute) {
        console.log("route is null");
        return false;
      }
      if (route.startLocation === oldRoute.startLocation &&
        route.destination === oldRoute.destination &&
        route.transportationMethod === oldRoute.transportationMethod
      ) {
        if(route.waypoints && oldRoute.waypoints) {
          if(route.waypoints.length === oldRoute.waypoints.length) {
            for(let i = 0; i < route.waypoints.length; i++) {
              if(route.waypoints[i] !== oldRoute.waypoints[i]) {
                console.log("different waypoints");
                return false;
              }
            }
            console.log("same waypoints");
            return true;
          } else {
            console.log("different waypoints length");
            return false;
          }
        } else if (!route.waypoints && !oldRoute.waypoints) {
          console.log("no waypoints");
          return true;
        } else {
          console.log("different waypoints");
          return false;
        }
      }
      return false;
    },

    drawRoute(route, index, oldRoute) {
      if (this.checkSameRoute(route, index, oldRoute)) {
        console.log("same route");
        return;
      }
      console.log("all routes", this.routes);
      console.log(route);
      console.log(index);
      const travelModes = {
        DRIVE: google.maps.TravelMode.DRIVING,
        WALK: google.maps.TravelMode.WALKING,
        BIKE: google.maps.TravelMode.BICYCLING,
        TRANSIT: google.maps.TravelMode.TRANSIT,
      };

      if (route.waypoints && route.waypoints.length > 0) {
        const request = {
          origin: route.startLocation,
          destination: this.destination,
          waypoints: route.waypoints.map((waypoint) => {
            return {
              location: { placeId: waypoint },
              stopover: false,
            };
          }),
          travelMode: travelModes[route.transportationMethod],
        };
        //if (useUserStore().getUser().userId === route.UserId) {
        //return;
        //}
        this.directionsService.route(request, (result, status) => {
          if (status == "OK") {
            this.directionsRenderers[index].setDirections(result);

          } else if (status == "MAX_WAYPOINTS_EXCEEDED") {
            console.log("Too many waypoints");
            let newRoute = JSON.parse(JSON.stringify(this.routes[index]));
            newRoute.waypoints = [];
            console.log("new route before updating", newRoute);
            planService.updateTrip(
              this.planId,
              newRoute.UserId,
              newRoute.id,
              newRoute
            );
          }
          //handle zero results case
        });
      } else {
        const request = {
          origin: route.startLocation,
          destination: this.destination,
          travelMode: travelModes[route.transportationMethod],
        };
        this.directionsService.route(request, (result, status) => {
          if (status == "OK") {
            this.directionsRenderers[index].setDirections(result);
          } else if (status == "MAX_WAYPOINTS_EXCEEDED") {
            console.log("Too many waypoints");
            //add route too complex error
            let newRoute = JSON.parse(JSON.stringify(this.routes[index]));
            newRoute.waypoints = [];
            console.log("new route before updating", newRoute);
            planService.updateTrip(
              this.planId,
              newRoute.UserId,
              newRoute.id,
              newRoute
            );
            //this.drawRoute(this.routes[index], index);
          }
        });
      }
    },
    async getDirections() {
      //const directionsService = new google.maps.DirectionsService();
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
      });
      console.log("rendering2");
      this.routes.forEach((route) => {
        console.log(route);
      });
      console.log(this.routes);
      this.routes.forEach((route, index) => {
        console.log("rendering");
        /*
        var directionsRenderer = new google.maps.DirectionsRenderer();

        directionsRenderer.setOptions({
          polylineOptions: { strokeColor: this.colours[index] },
          suppressMarkers: true,
          draggable: true,
        });*/
        this.directionsRenderers[index].setMap(map);
        console.log(this.$refs.directionsPanel);
        this.directionsRenderers[index].setPanel(this.$refs.directionsPanel);
        console.log("user store", useUserStore().getUser());
        if (route.UserId === useUserStore().getUser().userId) {
          //this.directionsRenderers[index].setOptions({ draggable: true });
          this.directionsRenderers[index].addListener(
            "directions_changed",
            () => {
              console.log("directions changed");
              const directions =
                this.directionsRenderers[index].getDirections();
              console.log(directions);
              console.log(directions.geocoded_waypoints);
              let waypoints = [];
              directions.geocoded_waypoints.forEach((waypoint) => {
                console.log(waypoint);
                waypoints.push(waypoint.place_id);
              });
              let newRoute = JSON.parse(JSON.stringify(this.routes[index]));
              console.log("newRoute");
              console.log(newRoute);
              console.log(this.routes[index]);
              //check if waypoints are different
              // this.routes[index].waypoints.forEach((waypoint, index) => {
              //   if (waypoint !== waypoints[index]) {
              //     console.log("waypoints are different");
              //   }
              // });
              let diffWaypoints = JSON.stringify(this.routes[index].waypoints) !== JSON.stringify(waypoints);
              //let diffWaypoints = this.routes[index].waypoints !== waypoints;
              newRoute.waypoints = [...new Set(waypoints)];
              console.log("with waypoints", newRoute);
              if (diffWaypoints) {
                planService
                  .updateTrip(
                    this.planId,
                    newRoute.UserId,
                    newRoute.id,
                    newRoute
                  )
                  .then((response) => {
                    console.log(response);
                    if (!response.error) {
                      const oldRoute = JSON.parse(JSON.stringify(this.routes[index]));
                      if (response.trip) {
                        this.routes[index] = response.trip;
                        console.log("drawing route after update");
                        this.drawRoute(this.routes[index], index, oldRoute);
                      }
                    }
                    if (diffWaypoints && response.trip) {
                      // this.drawRoute(response.trip, index);
                    }
                  });
              }
              // planService.updateTrip(
              //   this.planId,
              //   newRoute.UserId,
              //   newRoute.id,
              //   newRoute
              // ).then(
              //   (response) => {
              //     console.log(response);
              //     if (!response.error) {
              //       this.routes[index] = response.trip;
              //       if (diffWaypoints && response.trip) {
              //         //this.drawRoute(this.routes[index], index);
              //       }
              //     }
              //     if (diffWaypoints && response.trip) {
              //  // this.drawRoute(response.trip, index);
              // }
              //   });
            }
          );
        }
        this.drawRoute(route, index, null);
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
  },
};
</script>

<style>
.list-item {
  padding: 5px;
}
</style>
