/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable import/prefer-default-export */
import http from '../../plugins/axios.mjs';

export const accessMethod = {
  state: {
    accessMethod: [],
    userAccessMethod: [],
  },
  mutations: {
    findAll: (state, { accessMethod }) => {
      state.accessMethod = accessMethod;
    },
    allAccessMethod: (state, { accessMethod }) => {
      state.accessMethod = accessMethod;
    },
    userAccessMethod: (state, { userAccessMethod }) => {
      state.userAccessMethod = userAccessMethod;
    },
  },
  getters: {
    accessMethod: state => state.accessMethod,
    userAccessMethod: state => state.userAccessMethod,
  },
  actions: {
    findAll: async ({ commit }) => {
      const res = await http.get('access-method');
      commit('findAll', res.data);
    },
    createAccessMethod: async ({ commit }, data) => {
      const res = await http.post('access-method', data);
      commit('allAccessMethod', res.data);
    },
    assingAccess: async ({ commit }, data) => {
      const res = await http.post('access-method/create', data);
      commit('userAccessMethod', res.data);
    },
    assignAccessMethod: async ({ commit }, data) => {
      const res = await http.post('access-method/assign-user', data);
      commit('assignUser', res.data);
    },
    findAccessMethodByUserId: async ({ commit }, userId) => {
      const res = await http.get(`access-method/${userId}`);
      commit('userAccessMethod', res.data);
    },
    unassignUser: async (_, data) => {
      await http.post('access-method/unassign-user', data);
    },
  },
};
