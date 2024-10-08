<template>
  <ul class="nav nav-tabs">
    <li class="nav-item" role="presentation">
      <button
        class="nav-link active route-title-btn"
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
        class="nav-link route-title-btn"
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
      <div class="mt-3">
        My Current Route
        <ul class="list-group">
          <li
            class="list-group-item list-item route-list-item"
            v-if="myCurrRoute"
          >
            <RouteCard
              :route="myCurrRoute"
              :destination="destination"
              :mode="currTrip.transportationMethod"
              @click="displayCurrRouteOnMap"
            >
              <div class="row">
                <a
                  class="route-btn link btn-outline-primary mt-3"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="`#collapseCurrent`"
                  aria-expanded="false"
                  :aria-controls="`collapseCurrent`"
                  @click="clickCurrentDirections"
                >
                  Get Directions
                </a>
              </div>
            </RouteCard>
            <div class="row">
              <div class="collapse" :id="`collapseCurrent`">
                <div class="card card-body" id="directionsDisplayCurrent"></div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div>
        <h6>Other Suggested Route(s)</h6>
        <div>
          <ul class="list-group">
            <div
              v-for="(route, index) in myRoutes"
              :key="route.summary"
              class="list-group-item list-item route-list-item"
            >
              <div>
                <RouteCard
                  :route="route"
                  :destination="destination"
                  :mode="currTrip.transportationMethod"
                >
                  <div class="row route-btn-container">
                    <a
                      class="link btn-outline-primary route-btn"
                      type="button"
                      data-bs-toggle="collapse"
                      :data-bs-target="`#collapse${index}`"
                      aria-expanded="false"
                      :aria-controls="`collapse${index}`"
                      @click="toggleExpandedButton(index)"
                    >
                      Preview
                    </a>
                    <a
                      class="link btn-outline-primary route-btn"
                      type="button"
                      @click="selectRoute(index)"
                    >
                      Reset Route
                    </a>
                  </div>
                </RouteCard>
              </div>
              <div class="row" v-if="expandedButton === index">
                <div class="collapse show" :id="`collapse${index}`">
                  <div
                    class="card card-body"
                    :id="`directionsDisplay${index}`"
                  ></div>
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
            :startLocation="route.startLocation"
            :mode="route.transportationMethod"
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
import planService from "@/services/planService.js";
import io from "socket.io-client";
import { useUserStore } from "@/stores/userStore.js";
import RouteCard from "@/components/routeCard.vue";
import { notificationMixin } from "@/mixins/notificationMixin.js";
import { usePlanStore } from "@/stores/planStore.js";

export default {
  mixins: [notificationMixin],
  props: {
    planId: String,
    destination: String,
  },
  data() {
    return {
      socket: null,
      routes: [],
      myRoutes: [],
      onMyRouteTab: true,
      currTrip: null,
      myCurrRoute: null,
      expandedDirections: false,
      directionsRenderer: new google.maps.DirectionsRenderer(),
      previewDirectionsRenderer: new google.maps.DirectionsRenderer(),
      currRouteRenderer: new google.maps.DirectionsRenderer(),
      directionsRenderers: [],
      expandedButton: null,
      directionsService: new google.maps.DirectionsService(),
      directionsArray: [],
    };
  },
  computed: {
    colours() {
      const plan = usePlanStore().getPlan();
      return plan.members.map((member) => member.colour);
    },
  },
  components: {
    groupRouteCard,
    RouteCard,
  },
  mounted() {
    this.socket = io("http://localhost:3000");

    this.socket.on("connect", () => {
      this.socket.emit("join-room", "room" + this.planId);
    });

    // Listen for the 'joinedRoom' event to confirm joining
    this.socket.on("joined-room", (roomId) => {});

    this.socket.on("planUpdate", (plan) => {
      if (plan.address !== this.destination) {
        this.updateProp(plan.address);
        if (this.onMyRouteTab) {
          this.displayMyRoutesTab();
        } else {
          this.displayGroupRoutesTab();
        }
      }
    });

    this.socket.on("trip", (trip) => {
      if (!trip.error) {
        //update route in data local
        this.routes.forEach((route, index) => {
          if (
            route.id === trip.id &&
            useUserStore().getUser().userId !== route.UserId
          ) {
            if (
              route.startLocation !== trip.startLocation ||
              route.transportationMethod !== trip.transportationMethod
            ) {
              this.routes[index] = trip;
              this.drawRoute(trip, index, null);
            } else {
              let oldRoute = JSON.parse(JSON.stringify(this.routes[index]));
              this.routes[index] = trip;
              this.drawRoute(trip, index, oldRoute);
            }
          }
          if (
            route.id === trip.id &&
            useUserStore().getUser().userId === route.UserId
          ) {
            if (
              (route.startLocation !== trip.startLocation &&
                trip.startLocation !== "") ||
              (route.transportationMethod !== trip.transportationMethod &&
                trip.transportationMethod !== "")
            ) {
              this.routes[index] = trip;
              if (this.onMyRouteTab) {
                this.displayMyRoutesTab();
              } else {
                this.displayGroupRoutesTab();
              }
              this.currTrip = trip;
              this.setCurrentRouteRenderer();
            }
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
  watch: {
    destination() {
      if (this.onMyRouteTab) {
        this.displayMyRoutesTab();
      } else {
        this.displayGroupRoutesTab();
      }
    },
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

    updateProp(newDestination) {
      this.$emit("update:destination", newDestination);
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

    clickCurrentDirections() {
      this.expandedDirections = !this.expandedDirections;
      this.displayCurrRouteOnMap();
      this.currRouteRenderer.setPanel(
        document.getElementById(`directionsDisplayCurrent`)
      );
    },

    validRoute(startLocation, destination, transportationMethod) {
      return startLocation && destination && transportationMethod;
    },

    setCurrentRouteRenderer() {
      if (
        !this.currTrip ||
        !this.validRoute(
          this.currTrip.startLocation,
          this.destination,
          this.currTrip.transportationMethod
        )
      ) {
        this.currRouteRenderer.setMap(null);
        return;
      }
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
        draggable: true,
      });
      let request = {
        origin: this.currTrip.startLocation,
        destination: this.destination,
        travelMode: travelModes[this.currTrip.transportationMethod],
      };

      if (this.currTrip && this.currTrip.waypoints.length > 0) {
        request = {
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
      }

      if (this.currTrip.transportationMethod === "TRANSIT") {
        request.waypoints = [];
      }

      this.directionsService.route(request, (result, status) => {
        if (status == "OK") {
          this.currRouteRenderer.setDirections(result);
          this.myCurrRoute = result.routes[0];
          this.currRouteRenderer.setPanel(
            document.getElementById(`directionsDisplayCurrent`)
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
        } else if (
          status == "MAX_WAYPOINTS_EXCEEDED" ||
          status == "INVALID_REQUEST"
        ) {
          let newRoute = JSON.parse(JSON.stringify(this.currTrip));
          newRoute.waypoints = [];
          planService.updateTrip(
            this.planId,
            newRoute.UserId,
            newRoute.id,
            newRoute
          );
        } else if (status == "ZERO_RESULTS") {
          this.notifyError(
            "No route found. Please update your midpoint, transportation mode or starting point."
          );
        }
      });
    },

    drawMyCurrentRoute(route, oldRoute) {
      if (
        !route ||
        !this.validRoute(
          route.startLocation,
          this.destination,
          route.transportationMethod
        )
      ) {
        this.currRouteRenderer.setMap(null);
        return;
      }
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

        if (route.transportationMethod === "TRANSIT") {
          request.waypoints = [];
        }

        this.directionsService.route(request, (result, status) => {
          if (status == "OK") {
            this.currRouteRenderer.setDirections(result);
          } else if (
            status == "MAX_WAYPOINTS_EXCEEDED" ||
            status == "INVALID_REQUEST"
          ) {
            let newRoute = JSON.parse(JSON.stringify(this.currTrip));
            newRoute.waypoints = [];
            planService.updateTrip(
              this.planId,
              newRoute.UserId,
              newRoute.id,
              newRoute
            );
          } else if (status == "ZERO_RESULTS") {
          }
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
          } else if (
            status == "MAX_WAYPOINTS_EXCEEDED" ||
            status == "INVALID_REQUEST"
          ) {
            //add route too complex error
            let newRoute = JSON.parse(JSON.stringify(this.currTrip));
            newRoute.waypoints = [];
            planService.updateTrip(
              this.planId,
              newRoute.UserId,
              newRoute.id,
              newRoute
            );
          } else if (status == "ZERO_RESULTS") {
          }
        });
      }
    },

    getSuggestedRoutes() {
      if (
        !this.currTrip ||
        !this.validRoute(
          this.currTrip.startLocation,
          this.destination,
          this.currTrip.transportationMethod
        )
      ) {
        this.directionsRenderer.setMap(null);
        return;
      }
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
      };
      this.directionsService.route(request, (result, status) => {
        if (status == "OK") {
          this.directionsRenderer.setDirections(result);
          this.myRoutes = result.routes;
          this.directionsRenderer.setPanel(
            document.getElementById(`defaultDirectionsDisplay`)
          );
        } else if (status == "ZERO_RESULTS") {
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

    selectRoute() {
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
        this.directionsRenderer.setMap(null);
        this.directionsRenderer = new google.maps.DirectionsRenderer();
      });
      await this.getCurrentRoute();
      this.getSuggestedRoutes();
      this.setCurrentRouteRenderer();
      this.onMyRouteTab = true;
    },

    async displayGroupRoutesTab() {
      // get all group routes
      this.directionsRenderer.setMap(null);
      this.currRouteRenderer.setMap(null);
      this.directionsRenderers.forEach((directionsRenderer) => {
        this.directionsRenderer.setMap(null);
        this.directionsRenderer = new google.maps.DirectionsRenderer();
      });
      await this.getGroupTrips();
      this.onMyRouteTab = false;
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
      this.directionsRenderers = [];
      this.routes.forEach((route, index) => {
        let directionsRenderer = new google.maps.DirectionsRenderer();
        if (route.UserId === useUserStore().getUser().userId) {
          directionsRenderer.setOptions({ draggable: true });
        } else {
          directionsRenderer.setOptions({ draggable: false });
        }
        directionsRenderer.setOptions({
          polylineOptions: { strokeColor: this.colours[index] },
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
      if (
        !route ||
        !this.validRoute(
          route.startLocation,
          this.destination,
          route.transportationMethod
        )
      ) {
        this.directionsRenderers[index].setMap(null);
        return;
      }
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
        if (route.transportationMethod === "TRANSIT") {
          request.waypoints = [];
        }
        this.directionsService.route(request, (result, status) => {
          if (status == "OK") {
            this.directionsRenderers[index].setDirections(result);
          } else if (
            status == "MAX_WAYPOINTS_EXCEEDED" ||
            status == "INVALID_REQUEST"
          ) {
            let newRoute = JSON.parse(JSON.stringify(this.routes[index]));
            newRoute.waypoints = [];
            planService.updateTrip(
              this.planId,
              newRoute.UserId,
              newRoute.id,
              newRoute
            );
            this.drawRoute(newRoute, index, route);
          } else if (status == "ZERO_RESULTS") {
          }
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
          } else if (
            status == "MAX_WAYPOINTS_EXCEEDED" ||
            status == "INVALID_REQUEST"
          ) {
            //add route too complex error
            let newRoute = JSON.parse(JSON.stringify(this.routes[index]));
            newRoute.waypoints = [];
            planService.updateTrip(
              this.planId,
              newRoute.UserId,
              newRoute.id,
              newRoute
            );
          } else if (status == "ZERO_RESULTS") {
          }
        });
      }
    },
    async getDirections() {
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
      });
      this.routes.forEach((route, index) => {
        if (
          !route ||
          !this.validRoute(
            route.startLocation,
            this.destination,
            route.transportationMethod
          )
        ) {
          if (this.directionsRenderers[index]) {
            this.directionsRenderers[index].setMap(null);
          }
          return;
        } else {
          this.directionsRenderers[index].setMap(map);
        }

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

.btn-route {
  margin: 5px;
  max-width: 80%;
  width: 70%;
}
</style>
