<template>
<div class="container">
    <div class="row">
        <div class="col-2">
            <img
          :src="picture"
          alt=""
          width="32"
          height="32"
          class="rounded-circle profile-border"
          :style="{ borderColor: color }"
        />
        </div>
        <div class="col-10">
            <h6 class="card-content card-title">{{ name }}</h6>
        </div>
    </div>
    <div class="row">
         <div class="col-2"></div>
        <div class="col-10">
            <div class="card-content">
            {{startTime}} - {{endTime}}
            </div>
        </div>

    </div>
    <div class="row">
        <div class="col-2"></div>
        <div class="col-10">
            <div class="card-content">
            Stating at {{startLocation}}
            </div>
        </div>

    </div>
    <div class="row">
        <div class="col-4">
        <span class="badge">
            {{mode}}
        </span>
        </div>
        <div class="col-4">
        <span class="badge">
            {{duration}}
        </span>
        </div>
        <div class="col-4">
        <span class="badge">
            {{distance}}
        </span>
        </div>
    </div>


</div>
</template>

<script>
export default {
    /*data() {
        return {
            name: this.route.name,
            startTime: this.route.startTime,
            endTime: this.route.endTime,
            startLocation: this.route.startLocation,
            mode: this.route.mode,
            duration: this.route.duration,
            distance: this.route.distance
        };
    },*/
    props: {
        name: String,
        startTime: String,
        endTime: String,
        startLocation: String,
        mode: String,
        duration: String,
        distance: String,
        color: String,
        picture: String,
        destination: String
    },
    methods: {
       
    },
    mounted() {
     // this.getDirections().then (() => {
      //  console.log("Directions rendered");
      //})
    }
}

</script>

<style>
.card-content {
    margin-left: 4px;
}
.profile-border {
    border: 3px solid;
    border-radius: 50%;
    border-color: this.color;
}
</style>