import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import * as modules from './modules';
import DashboardChart from './modules/dashboardChart.mjs';

const store = createStore({
  modules: { ...modules, dashboardChart: DashboardChart },
  plugins: [
    createPersistedState({
      paths: ['auth'],
    }),
  ],
});
export default store;
