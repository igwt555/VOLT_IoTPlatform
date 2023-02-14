/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable import/prefer-default-export */
import http from '../../plugins/axios.mjs';

export const permission = {
  state: {
    success: false,
    error: '',
    Permission: [],
    getPermissionById: [],
    RoleByPermission: [],
  },
  getters: {
    Permission: state => state.Permission,
    Permissionerror: state => state.error,
    Permissionsuccess: state => state.success,
    getPermissionById: state => state.getPermissionById,
    RoleByPermission: state => state.RoleByPermission,
  },
  mutations: {
    getPermission: (state, { permissions }) => {
      state.Permission = permissions;
      state.success = true;
    },
    setError: (state, { error }) => {
      state.error = error?.message;
      state.success = false;
    },
    getPermissionById: (state, { permission }) => {
      state.getPermissionById = permission;
      state.success = true;
    },
    getRoleByPermission: (state, { permission }) => {
      state.RoleByPermission = permission;
      state.success = true;
    },
  },
  actions: {
    getPermission: async ({ commit }) => {
      try {
        const res = await http.get('permission/getPermissions');
        commit('getPermission', res.data);
      } catch (error) {
        if (!error?.response?.data) return commit('setError', 'An unknown issue occured');
        commit('setError', error.response.data);
      }
    },
    getPermissionById: async ({ commit }, data) => {
      try {
        const res = await http.get(`rolePermission/getPermissionById?roleId=${data?.roleId}`);
        commit('getPermissionById', res.data);
      } catch (error) {
        if (!error?.response?.data) return commit('setError', 'An unknown issue occured');
        commit('setError', error.response.data);
      }
    },
    createRolePermission: async ({ commit }, data) => {
      try {
        const res = await http.post('rolePermission/createRolePermission', data);
        console.log(res);
      } catch (error) {
        if (!error?.response?.data) return commit('setError', 'An unknown issue occured');
        commit('setError', error.response.data);
      }
    },
    deletePermission: async ({ commit }, data) => {
      try {
        await http.delete(`rolePermission/deleteRolePermission?roleId=${data.roleId}&permissionId=${data.permissionId}`, data);
      } catch (error) {
        if (!error?.response?.data) return commit('setError', 'An unknown issue occured');
        commit('setError', error.response.data);
      }
    },
    getPermissionByRoleId: async ({ commit }, data) => {
      try {
        const res = await http.get(`rolePermission/getPermissionByRoleId?roleId=${data.roleId}`);
        commit('getRoleByPermission', res.data);
      } catch (error) {
        if (!error?.response?.data) return commit('setError', 'An unknown issue occured');
        commit('setError', error.response.data);
      }
    },
  },
};
