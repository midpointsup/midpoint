<template>
  <gmpx-place-picker id="place-picker" placeholder="Enter A Location"></gmpx-place-picker>
  <div id="infowindow-content">
    <span id="place-name" class="title" style="font-weight: bold"></span><br />
    <span id="place-address"></span>
  </div>
</template>

<script>
import '@googlemaps/extended-component-library/place_picker.js';
</script>

<style>
</style>