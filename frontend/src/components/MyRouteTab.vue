<template>
<div>
    Inside of myroute
    <ul class="list-group">
        <li
          class="list-group-item list-item"
        >
          <groupRouteCard
            :startTime="trip.startTime"
            endTime="end time"
            :startLocation="trip.startLocation"
            :mode="trip.transportationMethod"
            duration="1 hour"
            distance="20km"
            :color="colours[index]"
            :picture="trip.User.picture"
            :destination="destination"
          ></groupRouteCard>
        </li>
      </ul>
</div>
</template>

<script>
import planService from '../services/plan-service';
import { useUserStore } from "../stores/userStore.js";

export default {
    props: {
        planId: String,
        destination: String,
    },
    data() {
        return {
            trip: null,
        };
    },
    async mounted() {
        await planService.getTrip(this.planId, useUserStore().getUser().userId).then((response) => {
            console.log("this is the response", response);
            if (response.trip) {
                this.trip = response.trip;
                console.log("these are the routes", this.trip);
            }
        })
        .catch((error) => {
        console.error("Failed to fetch trip:", error);
      });
    },
}
</script>

<style>
</style>