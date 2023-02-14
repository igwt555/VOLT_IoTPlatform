/* eslint-disable no-useless-catch */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
import http from '../../plugins/axios.mjs';

export const device = {
  state: {
    devices: [],
  },
  getters: {
    devices: state => state.devices,
    deviceById: state => id => state.devices.find(device => device.id === id),
    getDeviceError: state => state.error,
  },
  mutations: {
    GET_ALL_DEVICES: (state, { devices }) => {
      state.devices = devices;
    },
    ADD_ONE_DEVICE: (state, { device }) => {
      state.devices.push(device);
    },
    setError: (state, { error }) => {
      state.error = error.message;
      state.success = false;
    },
  },
  actions: {
    getAllDevices: async ({ commit }) => {
      try {
        const { data } = await http.get('device');
        commit('GET_ALL_DEVICES', data);
      } catch (error) {
        throw error;
      }
    },
    findByDeviceId: async ({ commit }, id) => {
      try {
        const res = await http.get(`device/${id}`);
        commit('ADD_ONE_DEVICE', res.data);
      } catch (error) {
        throw error;
      }
    },
    openDoor: async ({ commit }, data) => {
      const res = await http.post('device/openDoor', data);
      commit('openDoor', res.data);
    },
    assignToUser: async (_, data) => {
      try {
        await http.get('device/assign-to-user', data);
      } catch (error) {
        throw error;
      }
    },
    assignChamberToUser: async (_, data) => {
      try {
        await http.post('user/assign-chamber-user', data);
      } catch (error) {
        throw error;
      }
    },
    saveDeviceNote: async (_, data) => {
      await http.post('device/saveDeviceNote', data);
    },
    getDeviceNote: async (_, id) => {
      const res = await http.get(`device/getDeviceNote/${id}`);
      return res.data.note;
    },
  },
};
