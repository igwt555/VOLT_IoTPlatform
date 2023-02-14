/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
import http from '../../plugins/axios.mjs';

export const kbDevices = {
  state: {
    kbDevice: [],
    allKbDevice: [],
  },
  getters: {
    kbDevice: state => state.kbDevice,
    getKbDevice: state => state.allKbDevice,
  },
  mutations: {
    findById: (state, { kbDevice }) => {
      state.kbDevice = kbDevice;
    },
    getKbDevice: (state, { allKbDevice }) => {
      state.allKbDevice = allKbDevice;
    },
  },
  actions: {
    findById: async ({ commit }, id) => {
      try {
        const { data } = await http.get(`kb-device/${id}`);
        commit('findById', data);
      } catch (error) {
        throw error
      }
    },
    getKbDevices: async ({ commit }) => {
      try {
        const { data } = await http.get('kb-device');
        commit('getKbDevice', data);
      } catch (error) {
        throw error
      }
    },
  },
};
