import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import router from "@/router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap";
import "./assets/main.css";
import "./assets/base.css";
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

const app = createApp(App);

app.use(createPinia());

app.use(PrimeVue, {
  theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.dark-mode',
      }
  }
});

app.use(router);

app.mount("#app");
