import http from '@/plugins/axios.mjs';

export const units = {
  state: {
    units: [],
  },
  getters: {
    units: (state) => state.units,
  },
  mutations: {
    SET_DATA_BY_PROPERTY(state, { property, data }) {
      state[property] = data;
    },
  },
  actions: {
    getAllUnits: async ({ commit }) => {
      try {
        const { data } = await http.get('unit/findAll')
        commit('SET_DATA_BY_PROPERTY', { property: 'units', data: data.units });
      } catch {}
    },
  },
};
