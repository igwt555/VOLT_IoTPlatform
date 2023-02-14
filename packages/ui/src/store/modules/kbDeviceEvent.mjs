/* eslint-disable arrow-body-style */
/* eslint-disable no-useless-catch */
/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable import/prefer-default-export */
import http from '../../plugins/axios.mjs';

export const kbDeviceEvent = {
  state: {
    kbDeviceEvents: [],
    kbDeviceEvent: [],
    eventDataByKbDeviceId: null,
    notReturnedDevices: null,
    recentActivity: null,
  },
  getters: {
    kbDeviceEvents: state => state.kbDeviceEvents,
    kbDeviceEvent: state => state.kbDeviceEvent,

    eventDataByKbDeviceId: state => state.eventDataByKbDeviceId,
    notReturnedDevicesGetter: state => state.notReturnedDevices,
    recentActivity: state => state.recentActivity,
  },
  mutations: {
    SET_ALL_DEVICE_EVENTS: (state, { deviceEvents }) => {
      state.kbDeviceEvents = deviceEvents;
    },
    SET_DEVICE_EVENT: (state, { deviceEvent }) => {
      const index = state.kbDeviceEvents.findIndex(({ id }) => id === deviceEvent.id);

      if (index > 0) {
        state.kbDeviceEvents[index] = deviceEvent;
      } else {
        state.kbDeviceEvents.push(deviceEvent);
      }
    },
    getEventByDeviceId: (state, { deviceEvent }) => {
      state.kbDeviceEvent = deviceEvent;
    },
    getRecentEventByDeviceId: (state, { recentActivity }) => {
      state.recentActivity = recentActivity;
    },
    eventDataByKbDeviceId: (state, { deviceEvent }) => {
      state.eventDataByKbDeviceId = deviceEvent;
    },
    notReturnedKbDevices: (state, { deviceEvents }) => {
      state.notReturnedDevices = deviceEvents;
    },
  },
  actions: {
    allDeviceEvent: async ({ commit }, param) => {
      try {
        const { data } = await http.post('/kb-device-event', param);
        commit('SET_ALL_DEVICE_EVENTS', data);
        return data.deviceEvents;
      } catch (error) {
        throw error;
      }
    },

    getEventByDeviceId: async ({ commit }, deviceId) => {
      try {
        const { data } = await http.get(`kb-device-event/${deviceId}`);
        commit('getEventByDeviceId', data);
      } catch (error) {
        throw error;
      }
    },

    getRecentEventByDeviceId: async ({ commit }, deviceId) => {
      try {
        const { data } = await http.get(`kb-device-event/recent-activity/${deviceId}`);
        commit('getRecentEventByDeviceId', data);
      } catch (error) {
        throw error;
      }
    },

    getEventByKbDeviceId: async ({ commit }, kbDeviceId) => {
      try {
        const { data } = await http.get(`kb-device-event/device/${kbDeviceId}`);
        commit('eventDataByKbDeviceId', data);
      } catch (error) {
        throw error;
      }
    },

    notReturnedKbDevices: async ({ commit }) => {
      try {
        const res = await http.get('kb-device-event/not-returned/kb-devices');
        commit('notReturnedKbDevices', res.data);
      } catch (error) {
        throw error;
      }
    },
    updateChamberStatus: async ({ commit }, payload) => {
      try {
        await http.post('/update-chamber-status', payload);
        const { data } = await http.get(`kb-device-event/${payload.deviceId}`);
        commit('getEventByDeviceId', data);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
