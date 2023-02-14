/* eslint-disable no-param-reassign */
import http from '../../plugins/axios.mjs';

export const dashboardChart = {
  state: {
    success: false,
    error: '',
    dashboard1: [],
    dashboard2: [],
    dashboard3: [],
    dashboard5: [],
    siteData: [],
    dashboard6: [],
    dashboard8: [],
    dashboard9: [],
  },
  getters: {
    dashboard1Data: state => state.dashboard1,
    dashboard2Data: state => state.dashboard2,
    dashboard3Data: state => state.dashboard3,
    dashboard5Data: state => state.dashboard5,
    siteData: state => state.siteData,
    dashboard6Data: state => state.dashboard6,
    dashboard8Data: state => state.dashboard8,
    dashboard9Data: state => state.dashboard9,
  },
  mutations: {
    getDashboard1Data: (state, data) => {
      state.dashboard1 = data;
      state.success = true;
    },
    getDashboard2Data: (state, data) => {
      state.dashboard2 = data;
      state.success = true;
    },
    getDashboard3Data: (state, data) => {
      state.dashboard3 = data;
      state.success = true;
    },
    getDashboard5Data: (state, data) => {
      state.dashboard5 = data;
      state.success = true;
    },
    getSiteData: (state, { sites }) => {
      state.siteData = sites;
      state.success = true;
    },
    getDashboard6Data: (state, data) => {
      state.dashboard6 = data;
      state.success = true;
    },
    getDashboard8Data: (state, data) => {
      state.dashboard8 = data;
      state.success = true;
    },
    getDashboard9Data: (state, data) => {
      state.dashboard9 = data;
      state.success = true;
    },
  },
  actions: {
    getDashboard1Data: async ({ commit }) => {
      try {
        const res = await http.get('dashboard-chart/dashboard1');
        commit('getDashboard1Data', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },
    getDashboard2Data: async ({ commit }) => {
      try {
        const res = await http.get('dashboard-chart/dashboard2');
        commit('getDashboard2Data', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },
    getDashboard3Data: async ({ commit }) => {
      try {
        const res = await http.get('dashboard-chart/dashboard3');
        commit('getDashboard3Data', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },
    getDashboard5Data: async ({ commit }) => {
      try {
        const res = await http.get('dashboard-chart/dashboard5');
        commit('getDashboard5Data', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },
    getSiteData: async ({ commit }) => {
      try {
        const res = await http.get('dashboard-chart/get-site-data');
        commit('getSiteData', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },
    getDashboard6Data: async ({ commit }) => {
      try {
        const res = await http.get('dashboard-chart/dashboard6');
        commit('getDashboard6Data', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },
    getDashboard8Data: async ({ commit }) => {
      try {
        const res = await http.get('dashboard-chart/dashboard8');
        commit('getDashboard8Data', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },
    getDashboard9Data: async ({ commit }) => {
      try {
        const res = await http.get('dashboard-chart/dashboard9');
        commit('getDashboard9Data', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },
  },
};

export default dashboardChart;
