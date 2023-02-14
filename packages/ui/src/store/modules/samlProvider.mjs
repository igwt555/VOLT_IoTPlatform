/* eslint-disable no-param-reassign */
import { samlProviderService } from '../../service/samlProvider.mjs';

// eslint-disable-next-line import/prefer-default-export
export const samlProvider = {
  state: {
    samlProviders: [],
    samlDetails: null,
  },
  mutations: {
    setAllSAMLProviders: (state, data) => {
      state.samlProviders = data.SAMLProvider;
    },
    SAMLProvider: (state, { SAMLProvider }) => {
      state.samlDetails = SAMLProvider;
      state.success = true;
    },
  },
  getters: {
    samlProviders: state => state.samlProviders,
    samlDetails: state => state.samlDetails,
  },
  actions: {
    getSAMLProviders: async ({ commit }) => {
      try {
        const res = await samlProviderService.getSamlProviders();
        commit('setAllSAMLProviders', res.data);
      } catch (error) {
        console.log(error);
      }
    },
    getSAMLProvider: async ({ commit }, data) => {
      try {
        const res = await samlProviderService.getSamlProvider(data);
        commit('SAMLProvider', res.data);
      } catch (error) {
        console.log(error);
      }
    },
    updateSAMLProvider: async ({ commit }, data) => {
      try {
        await samlProviderService.updateSamlProvider(data.id, data.body);
        const res = await samlProviderService.getSamlProviders();
        commit('setAllSAMLProviders', res.data);
      } catch (error) {
        console.log(error);
      }
    },
    deleteSAMLProvider: async ({ commit }, data) => {
      try {
        await samlProviderService.deleteSAMLProvider(data);
        const res = await samlProviderService.getSamlProviders();
        commit('setAllSAMLProviders', res.data);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
