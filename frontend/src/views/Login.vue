<template>
    <div id="layout">
     <LoginForm></LoginForm>
     <Map></Map>
    </div>
  </template>
  
  <script>
    import LoginForm from '../components/LoginForm.vue';  
    import Map from '../components/Map.vue';
  export default {

    components: {
      LoginForm, Map
    },
  };
  </script>
  
  <style>
  #layout {
    flex: 1;
    display: flex;
    position: relative;
  }
  </style>
  