import { providerService } from '../../service/providerService.mjs';

const state = {
  providers: [],
  success: false,
  providerById: null,
};

export const provider = {
  state,

  // mutations
  mutations: {
    getAllProviders: (state, { providers }) => {
      state.providers = providers;
      state.success = true;
    },

    findByProviderId: (state, { provider }) => {
      state.providerById = provider;
      state.success = true;
    },
  },

  // getters
  getters: {
    providers: state => state.providers,
    providerById: state => state.providerById,
  },

  // actions
  actions: {
    createProvider: async ({ commit }, data) => {
      try {
        const res = await providerService.create(data);
        commit('getAllProviders', res.data);
      } catch (error) {
        console.log(error);
      }
    },

    getAllProviders: async ({ commit }) => {
      try {
        const res = await providerService.findAll();
        commit('getAllProviders', res.data);
      } catch (error) {
        console.log(error);
      }
    },

    findByProviderId: async ({ commit }, data) => {
      try {
        const res = await providerService.findByProviderId(data);
        commit('findByProviderId', res.data);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
