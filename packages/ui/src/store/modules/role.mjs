/* eslint-disable import/prefer-default-export */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import http from '../../plugins/axios.mjs';

export const role = {
  state: {
    success: false,
    error: '',
    roles: [],
  },
  getters: {
    roles: state => state.roles,
    roleerror: state => state.error,
    rolesuccess: state => state.success,
    updateRoleError: state => state.updateRoleError,
    deleteRoleError: state => state.deleteRoleError,
  },
  mutations: {
    getroles: (state, { roles }) => {
      state.roles = roles;
      state.success = true;
    },
    setError: (state, { error }) => {
      state.error = error?.message;
      state.success = false;
    },
    updateRoles: (state, _data) => {
      state.success = true;
      state.updateRoleError = null;
    },
    setUpdateRoleError: (state, { error }) => {
      state.updateRoleError = error.message;
    },
    deleteRoles: (state, _data) => {
      state.success = true;
      state.deleteRoleError = null;
    },
    setDeleteError: (state, { error }) => {
      state.deleteRoleError = error.message;
    },
  },
  actions: {
    getRoles: async ({ commit }) => {
      try {
        const res = await http.get('role/getRoles');
        commit('getroles', res.data);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },

    addRole: async ({ commit }, data) => {
      try {
        const res = await http.post('role/createRole', data);
        console.log(res);
      } catch (error) {
        commit('setError', error.response.data);
      }
    },
    updateRoles: async ({ commit }, data) => {
      try {
        const res = await http.post('role/updateRole', data);
        commit('updateRoles', res.data);
      } catch (error) {
        const err = error?.response;
        commit('setUpdateRoleError', err.data);
      }
    },
    delete_Role: async ({ commit }, data) => {
      try {
        const res = await http.delete(`role/deleteRole/${data.id}`);
        commit('deleteRoles', res.data);
      } catch (error) {
        const err = error?.response;
        commit('setDeleteError', err.data);
      }
    },
  },
};
