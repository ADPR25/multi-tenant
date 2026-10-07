import "./assets/main.css";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.css";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.ts";
import VueApexCharts from "vue3-apexcharts";

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
});

const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  if (msg.includes("No match found for location with path")) {
    return;
  }
  originalWarn(...(args as [unknown, ...unknown[]]));
};

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(VueApexCharts);

app.mount("#app");
