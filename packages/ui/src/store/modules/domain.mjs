import { domainService } from '../../service/domainService';

const state = {
  domains: [],
  newDomain: null,
  success: false,
};

export const domain = {
  state,

  mutations: {
    setAllDomain: (state, data) => {
      state.domains = data.domains;
      state.success = data.success;
    },
    setNewDomain: (state, data) => {
      state.newDomain = data.domain;
    },
  },

  getters: {
    domains: state => state.domains,
    newDomain: state => state.newDomain,
  },

  actions: {
    getAllDomain: async ({ commit }) => {
      try {
        const res = await domainService.findAll();
        commit('setAllDomain', res.data);
      } catch (error) {
        console.log(error);
      }
    },
    createDomain: async ({ commit }, data) => {
      try {
        const res = await domainService.create(data);
        commit('setNewDomain', res.data);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
