/* eslint-disable no-shadow */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-param-reassign */
import http from '../../plugins/axios.mjs';

export const bays = {
  state: {
    bays: [],
    success: false,
  },
  getters: {
    bays: state => state.bays,
  },
  mutations: {
    findByUnitId: (state, { bays }) => {
      state.bays = bays;
      state.success = true;
    },
  },
  actions: {
    findBaysByUnitId: async ({ commit }, unitId) => {
      try {
        const { data } = await http.get(`bay/${unitId}`);
        commit('findByUnitId', data);
      } catch (error) {
        throw error;
      }
    },
  },
};
