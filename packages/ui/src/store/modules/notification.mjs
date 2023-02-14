/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable import/prefer-default-export */
import http from '../../plugins/axios.mjs';

const state = {
};

export const notification = {
  state: {
    notifications: [],
    success: false,
  },
  getters: {
    notifications: state => state.notifications,
  },
  mutations: {
    findAllNotifications: (state, { notifications }) => {
      state.notifications = notifications;
      state.success = true;
    },
  },
  actions: {
    findAllNotifications: async ({ commit }) => {
      try {
        const res = await http.get('notification');
        commit('findAllNotifications', res.data);
      } catch (error) {
        throw error
      }
    },
  },
};
