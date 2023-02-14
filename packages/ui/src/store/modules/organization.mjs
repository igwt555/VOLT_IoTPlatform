/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable import/prefer-default-export */
import http from '../../plugins/axios.mjs';

export const organization = {
  state: {
    organization: {},
    success: false,
    error: '',
    childOrgs: [],
  },
  getters: {
    organizationName: state => state.organization?.name,
    alertPhoneNumber: state => state.organization?.settings?.alertPhoneNumbers,
    organization: state => state.organization,
    childOrgs: state => state.childOrgs,
    getError: state => state.error,
    flatOrgs: state => {
      const flatTree = (
        key => () => ({ children = [], ...object }) => [{ ...object }, ...children.flatMap(flatTree(key))]
      )(0);

      return state.childOrgs.flatMap(flatTree()).map(elm => ({ name: elm.label, value: elm.key }));
    },
  },
  mutations: {
    updateCompany: (state, { organization }) => {
      state.organization = organization;
    },
    // eslint-disable-next-line no-unused-vars
    getChildOrgs: (state, { organizations, flatOrgs }) => {
      state.childOrgs = organizations;
    },
  },
  actions: {
    getOrganization: async ({ commit }, id) => {
      const res = await http.get(`organization/${id}`);
      commit('updateCompany', res.data);
    },
    // eslint-disable-next-line no-unused-vars
    addOrganization: async ({ commit }, data) => {
      console.log(data);
      const res = await http.post('organization/createSubOrg/', data);
      console.log(res);
    },
    editOrganization: async ({ commit }, data) => {
      await http.post('organization', data);
    },
    uploadManual: async ({ commit }, data) => {
      await http.post('organization/uploadManual', data);
    },
    downloadManual: async () => {
      const res = await http.post('organization/downloadManual');
      return res;
    },
    deleteOrganization: async ({ commit }, data) => {
      await http.delete('organization/delete-org', data);
    },
    getChildOrgs: async ({ commit }, data) => {
      const res = await http.post('organization/get-child-orgs', data);
      commit('getChildOrgs', res.data);
    },
    updateCompany: async ({ commit }, data) => {
      const res = await http.post('organization', data);
      commit('updateCompany', res.data);
    },
    updateCompanyLogo: async ({ commit }, data) => {
      const res = await http.post('organization', data);
      commit('updateCompany', res.data);
      commit('removeError');
    },
    updateAzureAdSecret: async ({ commit }, data) => {
      const res = await http.post('organization/createAzureADSecret', data);
      return res.data;
    },
    googleUsers: async (_, data) => {
      try {
        const res = await http.post('/google/syncUsers', data);
        return res.data;
      } catch (error) {
        // commit('setError', error.response.data);
      }
    },
    // eslint-disable-next-line no-empty-pattern
    authGoogle: async ({ }, data) => {
      try {
        const res = await http.post('/google/authenticate', data);
        return res.data;
      } catch (error) {
        // commit('setError', error.response.data);
      }
    },
    stopWebhook: async () => {
      try {
        const res = await http.post('/google/stopWebhook');
        return res.data;
      } catch (error) {
        // commit('setError', error.response.data);
      }
    },
    updateAlertPhoneNumber: async ({ commit }, data) => {
      const res = await http.post('organization/update/alertPhoneNumbers', data);
      commit('updateCompany', res.data);
    },
    deleteEvents: async ({ commit }) => {
      await http.delete('events/otto');
    },
    publish: async (_, data) => {
      await http.post('/organization/updateKwiqiqSetting', data);
    },
  },
};
