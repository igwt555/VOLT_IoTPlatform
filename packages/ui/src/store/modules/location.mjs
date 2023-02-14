/* eslint-disable no-empty */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import http from '../../plugins/axios.mjs';

export const location = {
  state: {
    locations: [],
    locationDevices: [],
    unassignedLocations: [],
  },
  getters: {
    locations: state => state.locations,
    locationDevices: state => state.locationDevices,
    deviceLocationByDeviceId: state => deviceId => state.locations.find(location => location.device_id === deviceId),
    unassignLocations: state => state.locations.filter(location => location.device_id === null),
    unassignedLocations: state => state.unassignedLocations,
  },
  mutations: {
    FIND_UNASSIGNED_LOCATIONS(state, { unassignLocation }) {
      state.unassignedLocations = unassignLocation;
    },
    SET_UNASSIGNED_LOCATIONS(state, unassignLocation) {
      state.unassignedLocations = unassignLocation;
    },
    SET_LOCATIONS(state, { locations }) {
      state.locations = locations;
    },
    SET_LOCATION_BY_ID(state, { location }) {
      const index = state.locations.findIndex(({ id }) => id === location.id);
      if (index) {
        state.locations[index] = { ...location };
      } else {
        state.locations.push(location);
      }
    },
    SET_DEVICE_BY_LOCATION(state, Devices) {
      state.locationDevices = Devices.deviceLocation;
    },
  },
  actions: {
    createLocation: async ({ commit }, locationData) => {
      try {
        if (locationData?.isOtto) {
          const res = await http.post('location/otto', locationData?.data);
          commit('SET_LOCATION_BY_ID', res.data.data);
        } else {
          const res = await http.post('location', locationData?.data);
          commit('SET_LOCATION_BY_ID', res.data.data);
        }
      } catch { }
    },
    getAllLocations: async ({ commit }) => {
      try {
        const res = await http.get('location');
        commit('SET_LOCATIONS', res.data);
      } catch { }
    },
    findLocationByDeviceId: async ({ commit }, deviceId) => {
      try {
        const res = await http.get(`location/${deviceId}`);
        commit('SET_LOCATION_BY_ID', res.data);
      } catch { }
    },
    findDeviceByLocation: async ({ commit }, data) => {
      try {
        if (data?.isOtto) {
          const res = await http.get(`/location/otto/${data.locationId}`);
          commit('SET_DEVICE_BY_LOCATION', res.data);
        }
      } catch {}
    },
    findUnassignedLocations: async ({ commit }, data) => {
      try {
        if (data?.isOtto) {
          const res = await http.get('location/otto/unassign/location');
          commit('SET_UNASSIGNED_LOCATIONS', res.data);
        } else {
          const res = await http.get('location/unassign/location');
          commit('FIND_UNASSIGNED_LOCATIONS', res.data);
        }
      } catch { }
    },
    changeLocation: async ({ commit }, data) => {
      try {
        if (data?.isOtto) {
          const res = await http.post('/location/otto/change-location', data?.data);
          commit('SET_LOCATION_BY_ID', res.data);
        } else {
          const res = await http.post('location/change-location', data?.data);
          commit('SET_LOCATION_BY_ID', res.data);
        }
      } catch { }
    },
    removeAssignLocation: async ({ commit }, data) => {
      try {
        if (data?.isOtto) {
          const res = await http.post('/location/otto/remove-assign-location', { locationId: data.locationId });
          commit('SET_DEVICE_BY_LOCATION', res.data);
        } else {
          const res = await http.post('location/remove-assign-location', data);
          commit('SET_LOCATION_BY_ID', res.data);
        }
      } catch { }
    },
    updatelocation: async ({ commit }, data) => {
      try {
        const res = await http.post('location/update-location', data);
        commit('SET_LOCATIONS', res.data);
      } catch {}
    },
    deleteLocation: async ({ commit }, data) => {
      try {
        if (data?.isOtto) {
          const locationId = {
            locationId: data?.locationId,
          };
          const res = await http.delete(`/location/otto/delete-location/${locationId.locationId}`);
          commit('SET_LOCATIONS', res.data);
        } else {
          const res = await http.delete(`location/delete-location/${data.locationId}`);
          commit('SET_LOCATIONS', res.data);
        }
      } catch { }
    },
  },
};
