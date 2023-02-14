/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable import/prefer-default-export */
import http from '../../plugins/axios.mjs';

export const emailNotification = {
  state: {
    emailNotification: [],
    userEmailNotifications: [],
    sucess: false,
  },
  getters: {
    emailNotification: state => state.emailNotification,
    userEmailNotifications: state => state.userEmailNotifications,
  },
  mutations: {
    getAllEmailNoti: (state, { notification }) => {
      state.emailNotification = notification;
      state.sucess = true;
    },

    userEmailNotifications: (state, { userNotification }) => {
      state.userEmailNotifications = userNotification;
      state.success = true;
    },
  },
  actions: {
    getAllEmailNoti: async ({ commit }) => {
      try {
        const res = await http.get('email-notification/');
        commit('getAllEmailNoti', res.data);
      } catch (error) {
        throw error
      }
    },
    userEmailNotifications: async ({ commit }, userId) => {
      try {
        const res = await http.get(`email-notification/${userId}`);
        commit('userEmailNotifications', res.data);
      } catch (error) {
        throw error
      }
    },
  },
};
