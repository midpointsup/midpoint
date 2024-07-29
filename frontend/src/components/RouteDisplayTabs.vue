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
        @click="displayMyRoutesTab"
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
        @click="displayGroupRoutesTab"
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
      <div>
        My Current Route
        <ul class="list-group">
          <li class="list-group-item list-item" v-if="myCurrRoute">
            <RouteCard
              :route="myCurrRoute"
              :destination="destination"
              :mode="currTrip.transportationMethod"
              @click="displayCurrRouteOnMap"
            ></RouteCard>
          </li>
        </ul>
      </div>
      <div>
        Suggested Routes
        <div>
          <ul class="list-group">
            <div
              v-for="(route, index) in myRoutes"
              :key="route.summary"
              class="list-group-item list-item"
            >
              <div>
                <RouteCard
                  :route="route"
                  :destination="destination"
                  :mode="currTrip.transportationMethod"
                ></RouteCard>
                <div class="row">
                  <button
                    class="btn btn-outline-primary"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#collapse${index}`"
                    aria-expanded="false"
                    :aria-controls="`collapse${index}`"
                    @click="toggleExpandedButton(index)"
                  >
                    Preview
                  </button>
                  <button
                    class="btn btn-outline-primary"
                    type="button"
                    @click="selectRoute(index)"
                  >
                    Select Route
                  </button>
                </div>
              </div>
              <div class="row" v-if="expandedButton === index">
                <div class="collapse show" :id="`collapse${index}`">
                  <div class="card card-body" :id="`directionsDisplay${index}`">
                    direction display
                  </div>
                </div>
              </div>
            </div>
          </ul>
        </div>
      </div>
      <div id="directions"></div>
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
import groupRouteCard from "@/components/GroupRouteCard.vue";
import planService from "../services/plan-service.js";
import io from "socket.io-client";
import { useUserStore } from "../stores/userStore.js";
import RouteCard from "@/components/RouteCard.vue";

export default {
  props: {
    planId: String,
    destination: String,
  },
  data() {
    return {
      socket: null,
      routes: [],
      myRoutes: [],
      currTrip: null,
      myCurrRoute: null,
      directionsRenderer: new google.maps.DirectionsRenderer(),
      previewDirectionsRenderer: new google.maps.DirectionsRenderer(),
      currRouteRenderer: new google.maps.DirectionsRenderer(),
      directionsRenderers: [],
      expandedButton: null,
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
    RouteCard,
  },
  mounted() {
    this.socket = io("https://api.midpoint.live");

    this.socket.on("connect", () => {
      this.socket.emit("join-room", "room" + this.planId);
    });

    // Listen for the 'joinedRoom' event to confirm joining
    this.socket.on("joined-room", (roomId) => {});

    this.socket.on("trip", (trip) => {
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
        });
      }
    });

    this.$nextTick(async () => {
      this.getGroupTrips();
      await this.getCurrentRoute();
      this.getSuggestedRoutes();
      this.setCurrentRouteRenderer();
    });
  },
  beforeUnmount() {
    this.disconnectSocket();
  },

  unmounted() {
    this.directionsRenderer.setMap(null);
    this.currRouteRenderer.setMap(null);
    this.directionsRenderers.forEach((directionsRenderer) => {
      directionsRenderer.setMap(null);
    });
  },

  methods: {
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
      }
    },

    toggleExpandedButton(index) {
      if (this.expandedButton === index) {
        this.expandedButton = null;
      } else {
        this.expandedButton = index;
        const map = new google.maps.Map(document.getElementById("map"), {
          zoom: 7,
        });
        this.directionsRenderer.setMap(map);
        this.setRouteIndex(index);
        this.$nextTick(() => {
          this.directionsRenderer.setPanel(
            document.getElementById(`directionsDisplay${index}`)
          );
          this.previewDirectionsRenderer.setMap(null);
          this.previewDirectionsRenderer.setPanel(
            document.getElementById(`directionsDisplay${index}`)
          );
        });
      }
    },

    async getCurrentRoute() {
      await planService
        .getTrip(this.planId, useUserStore().getUser().userId)
        .then((response) => {
          if (response.trip) {
            this.currTrip = response.trip;
          }
        })
        .catch((error) => {
          console.error("Failed to fetch trip:", error);
        });
    },

    setCurrentRouteRenderer() {
      const travelModes = {
        DRIVE: google.maps.TravelMode.DRIVING,
        WALK: google.maps.TravelMode.WALKING,
        BIKE: google.maps.TravelMode.BICYCLING,
        TRANSIT: google.maps.TravelMode.TRANSIT,
      };

      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
      });
      this.currRouteRenderer.setMap(map);
      this.currRouteRenderer.setOptions({
        polylineOptions: { strokeColor: "#3CB371" },
        draggable: true,
      });
      const request = {
        origin: this.currTrip.startLocation,
        destination: this.destination,
        travelMode: travelModes[this.currTrip.transportationMethod],
        waypoints: this.currTrip.waypoints.map((waypoint) => {
          return {
            location: { placeId: waypoint },
            stopover: false,
          };
        }),
      };

      this.directionsService.route(request, (result, status) => {
        if (status == "OK") {
          this.currRouteRenderer.setDirections(result);
          this.myCurrRoute = result.routes[0];
          this.currRouteRenderer.setPanel(
            document.getElementById(`directionsDisplay0`)
          );

          this.currRouteRenderer.addListener("directions_changed", () => {
            const directions = this.currRouteRenderer.getDirections();
            let waypoints = [];
            directions.geocoded_waypoints.forEach((waypoint) => {
              waypoints.push(waypoint.place_id);
            });
            let newRoute = JSON.parse(JSON.stringify(this.currTrip));
            let diffWaypoints =
              JSON.stringify(this.currTrip.waypoints) !==
              JSON.stringify(waypoints);
            newRoute.waypoints = [...new Set(waypoints)];
            if (diffWaypoints) {
              planService
                .updateTrip(this.planId, newRoute.UserId, newRoute.id, newRoute)
                .then((response) => {
                  if (!response.error) {
                    if (response.trip) {
                      this.currTrip = response.trip;
                    }
                  }
                });
            }
          });
        }
      });
    },

    drawMyCurrentRoute(route, oldRoute) {
      if (this.checkSameRoute(route, oldRoute)) {
        return;
      }
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
        this.directionsService.route(request, (result, status) => {
          if (status == "OK") {
            this.currRouteRenderer.setDirections(result);
          } else if (status == "MAX_WAYPOINTS_EXCEEDED") {
            let newRoute = JSON.parse(JSON.stringify(this.currTrip));
            newRoute.waypoints = [];
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
            this.currRouteRenderer.setDirections(result);
          } else if (status == "MAX_WAYPOINTS_EXCEEDED") {
            //add route too complex error
            let newRoute = JSON.parse(JSON.stringify(this.currTrip));
            newRoute.waypoints = [];
            planService.updateTrip(
              this.planId,
              newRoute.UserId,
              newRoute.id,
              newRoute
            );
          }
        });
      }
    },

    getSuggestedRoutes() {
      const travelModes = {
        DRIVE: google.maps.TravelMode.DRIVING,
        WALK: google.maps.TravelMode.WALKING,
        BIKE: google.maps.TravelMode.BICYCLING,
        TRANSIT: google.maps.TravelMode.TRANSIT,
      };

      this.expandedButton = null;

      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
      });

      this.directionsRenderer.setMap(map);
      this.directionsRenderer.setOptions({
        polylineOptions: { strokeColor: "#3CB371" },
      });
      const request = {
        origin: this.currTrip.startLocation,
        destination: this.destination,
        travelMode: travelModes[this.currTrip.transportationMethod],
        provideRouteAlternatives: true,
      };
      this.directionsService.route(request, (result, status) => {
        if (status == "OK") {
          this.directionsRenderer.setDirections(result);
          this.directionsRenderer.setRouteIndex(0);
          this.myRoutes = result.routes;
          this.directionsRenderer.setPanel(
            document.getElementById(`directionsDisplay0`)
          );
        }
      });
    },

    setRouteIndex(index) {
      try {
        this.directionsRenderer.setRouteIndex(index);
      } catch (error) {
        console.error("Failed to set route index", error);
      }
    },

    selectRoute(index) {
      this.directionsRenderer.setRouteIndex(index);
      const directions = this.directionsRenderer.getDirections();
      let waypoints = [];
      directions.geocoded_waypoints.forEach((waypoint) => {
        waypoints.push(waypoint.place_id);
      });
      let newRoute = JSON.parse(JSON.stringify(this.currTrip));
      newRoute.waypoints = [...new Set(waypoints)];

      planService
        .updateTrip(
          this.planId,
          this.currTrip.UserId,
          this.currTrip.id,
          newRoute
        )
        .then((response) => {
          if (!response.error) {
            if (response.trip) {
              this.currTrip = response.trip;
            }
            this.displayCurrRouteOnMap();
          }
        });
    },

    displayCurrRouteOnMap() {
      // get current route
      // display current route
      this.directionsRenderer.setMap(null);
      this.setCurrentRouteRenderer();
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
      });
      this.currRouteRenderer.setMap(map);

      // Close all expanded buttons
      this.expandedButton = null;
    },

    async displayMyRoutesTab() {
      // get all my routes
      this.directionsRenderers.forEach((directionsRenderer) => {
        directionsRenderer.setMap(null);
      });
      await this.getCurrentRoute();
      this.getSuggestedRoutes();
      this.setCurrentRouteRenderer();
    },

    async displayGroupRoutesTab() {
      // get all group routes
      this.directionsRenderer.setMap(null);
      this.currRouteRenderer.setMap(null);
      await this.getGroupTrips();
    },

    getGroupTrips() {
      planService.getTrips(this.planId).then(async (response) => {
        if (response.error) {
          this.routes = response.data;
        } else {
          this.routes = response.trips;
          this.setDirectionRenderers();
          await this.getDirections();
        }
      });
    },

    setDirectionRenderers() {
      this.routes.forEach((route, index) => {
        var directionsRenderer = new google.maps.DirectionsRenderer();
        if (route.UserId === useUserStore().getUser().userId) {
          directionsRenderer.setOptions({ draggable: true });
        }
        directionsRenderer.setOptions({
          polylineOptions: { strokeColor: this.colours[index] },
          suppressMarkers: true,
        });
        this.directionsRenderers.push(directionsRenderer);
      });
    },

    checkSameRoute(route, oldRoute) {
      if (!route || !oldRoute) {
        return false;
      }
      if (
        route.startLocation === oldRoute.startLocation &&
        route.destination === oldRoute.destination &&
        route.transportationMethod === oldRoute.transportationMethod
      ) {
        if (route.waypoints && oldRoute.waypoints) {
          if (route.waypoints.length === oldRoute.waypoints.length) {
            for (let i = 0; i < route.waypoints.length; i++) {
              if (route.waypoints[i] !== oldRoute.waypoints[i]) {
                return false;
              }
            }
            return true;
          } else {
            return false;
          }
        } else if (!route.waypoints && !oldRoute.waypoints) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    },

    drawRoute(route, index, oldRoute) {
      if (this.checkSameRoute(route, oldRoute)) {
        return;
      }
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
        this.directionsService.route(request, (result, status) => {
          if (status == "OK") {
            this.directionsRenderers[index].setDirections(result);
          } else if (status == "MAX_WAYPOINTS_EXCEEDED") {
            let newRoute = JSON.parse(JSON.stringify(this.routes[index]));
            newRoute.waypoints = [];
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
            //add route too complex error
            let newRoute = JSON.parse(JSON.stringify(this.routes[index]));
            newRoute.waypoints = [];
            planService.updateTrip(
              this.planId,
              newRoute.UserId,
              newRoute.id,
              newRoute
            );
          }
        });
      }
    },
    async getDirections() {
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
      });
      this.routes.forEach((route, index) => {
        this.directionsRenderers[index].setMap(map);
        this.directionsRenderers[index].setPanel(this.$refs.directionsPanel);
        if (route.UserId === useUserStore().getUser().userId) {
          this.directionsRenderers[index].addListener(
            "directions_changed",
            () => {
              const directions =
                this.directionsRenderers[index].getDirections();
              let waypoints = [];
              directions.geocoded_waypoints.forEach((waypoint) => {
                waypoints.push(waypoint.place_id);
              });
              let newRoute = JSON.parse(JSON.stringify(this.routes[index]));
              let diffWaypoints =
                JSON.stringify(this.routes[index].waypoints) !==
                JSON.stringify(waypoints);
              newRoute.waypoints = [...new Set(waypoints)];
              if (diffWaypoints) {
                planService
                  .updateTrip(
                    this.planId,
                    newRoute.UserId,
                    newRoute.id,
                    newRoute
                  )
                  .then((response) => {
                    if (!response.error) {
                      const oldRoute = JSON.parse(
                        JSON.stringify(this.routes[index])
                      );
                      if (response.trip) {
                        this.routes[index] = response.trip;
                        this.drawRoute(this.routes[index], index, oldRoute);
                      }
                    }
                  });
              }
            }
          );
        }
        this.drawRoute(route, index, null);
      });
    },
  },
};
</script>

<style>
.list-item {
  padding: 5px;
}
</style>
