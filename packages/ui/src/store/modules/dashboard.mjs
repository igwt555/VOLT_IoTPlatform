/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
import http from '../../plugins/axios.mjs';
import SocketioService from '../../service/socketServices.mjs';

export const dashboard = {
  state: {
    success: false,
    error: '',
    deviceCharging: [],
    avgChargeTime: [],
    aciveUsers: [],
    connectivity: [],
    alert: [],
    deviceReturned: [],
    locations: [],
    socket: {
      status: null,
      newConnection: null,
    },
  },
  getters: {
    deviceCharging: state => state.deviceCharging,
    avgChargeTime: state => state.avgChargeTime,
    aciveUsers: state => state.aciveUsers,
    connectivity: state => state.connectivity,
    alert: state => state.alert,
    deviceReturned: state => state.deviceReturned,
    locationsData: state => state.locations,
  },
  mutations: {
    getDeviceCharging: (state, { deviceCharging }) => {
      state.deviceCharging = deviceCharging;
      state.success = true;
    },

    getAvgChargeTime: (state, { avgChargeTime }) => {
      state.avgChargeTime = avgChargeTime;
      state.success = true;
    },

    getActiveUsers: (state, { aciveUsers }) => {
      state.aciveUsers = aciveUsers;
      state.success = true;
    },

    getConnectivity: (state, { connectivity }) => {
      state.connectivity = connectivity;
      state.success = true;
    },

    getAlerts: (state, { alert }) => {
      state.alert = alert;
      state.success = true;
    },

    getDevicereturned: (state, { deviceReturned }) => {
      state.deviceReturned = deviceReturned;
      state.success = true;
    },

    getLocations: (state, { locations }) => {
      state.locations = locations;
      state.success = true;
    },
  },
  actions: {
    startSocketConnection: async ({ _state, _commit }) => {
      await SocketioService.setupSocketConnection();
    },
    disconnectSocketConnection: async ({ _commit }) => {
      await SocketioService.disconnect();
    },
    getDeviceCharging: async ({ commit }) => {
      try {
        const res = await http.get('dashboard/device-charging');
        commit('getDeviceCharging', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },

    getAvgChargeTime: async ({ commit }) => {
      try {
        const res = await http.get('dashboard/avg-charge-time');
        commit('getAvgChargeTime', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },

    getActiveUsers: async ({ commit }) => {
      try {
        const res = await http.get('dashboard/active-users');
        commit('getActiveUsers', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },

    getConnectivity: async ({ commit }) => {
      try {
        const res = await http.get('dashboard/connectivity');
        commit('getConnectivity', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },

    getAlerts: async ({ commit }) => {
      try {
        const res = await http.get('dashboard/alerts');
        commit('getAlerts', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },

    getDevicereturned: async ({ commit }) => {
      try {
        const res = await http.get('dashboard/devicereturned');
        commit('getDevicereturned', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },

    getLocations: async ({ commit }) => {
      try {
        const res = await http.get('dashboard/locations');
        commit('getLocations', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },

  },

};
