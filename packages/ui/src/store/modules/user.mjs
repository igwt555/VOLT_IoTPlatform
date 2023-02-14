/* eslint-disable no-plusplus */
/* eslint-disable no-useless-catch */
/* eslint-disable arrow-parens */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import http from '../../plugins/axios.mjs';

export const user = {
  state: {
    users: [],
    selectedUser: null,
    report: [],
    orgUsers: null,
    alerts: null,
    reservations: null,
    alertIssues: null,

  },
  getters: {
    users: (state) => state.users,
    alertIssues: (state) => state.alertIssues,
    selectedUser: (state) => state.selectedUser,
    userReport: (state) => state.report,
    emailError: (state) => state.error,
    orgUsers: (state) => state.orgUsers,
    tempAlerts: (state) => state?.alerts?.map(({ id, description, value }) => ({ id,
      label: description.replaceAll('-', ' '),
      value,
    })),
    createUserError: (state) => state.createUserError,
    userReservations: state => state.reservations,
  },
  mutations: {
    SET_DATA_BY_PROPERTY(state, { property, data }) {
      state[property] = data;
    },
    ADD_NEW_USER_TO_USERS: (state, user) => {
      state.users.push(user);
    },
    SET_USER_ALERTS: (state, payload) => {
      payload.totalAlerts.forEach(element => {
        if (
          payload.alerts[0].Alerts.filter(e => e.id === element.id).length > 0
        ) {
          element.value = true;
        } else {
          element.value = false;
        }
      });
      state.alerts = payload.totalAlerts;
      state.alertIssues = payload.alertIssues;
    },
    SET_USER_RESERVATIONS: (state, { reservations }) => {
      state.reservations = reservations;
    },
  },
  actions: {
    createUsers: async ({ commit }, data) => {
      try {
        const res = await http.post('user', data);
        commit('SET_DATA_BY_PROPERTY', {
          property: 'users',
          data: res.data.users,
        });
      } catch {
        // do nothing, if an error occurs, the user will be notified there was a problem
      }
    },
    getUsers: async ({ commit }) => {
      try {
        const res = await http.get('user');
        commit('SET_DATA_BY_PROPERTY', {
          property: 'users',
          data: res.data.users,
        });
      } catch {
        // do nothing, if an error occurs, the user will be notified there was a problem
      }
    },
    createUser: async ({ commit }, data) => {
      try {
        const res = await http.post('user/create', data);
        commit('ADD_NEW_USER_TO_USERS', res.data.user);
      } catch {
        // do nothing, if an error occurs, the user will be notified there was a problem
      }
    },
    getUser: async ({ commit }, id) => {
      try {
        const res = await http.get(`user/user/${id}`);
        commit('SET_DATA_BY_PROPERTY', {
          property: 'selectedUser',
          data: res.data.user,
        });
      } catch {
        // do nothing, if an error occurs, the user will be notified there was a problem
      }
    },
    // Does this work?
    updateUser: async ({ commit }, data) => {
      try {
        const res = await http.post(`user/updateUser/${data.id}`, data.body);
        commit('SET_DATA_BY_PROPERTY', {
          property: 'selectedUser',
          data: res.data.user,
        });
      } catch {
        // do nothing, if an error occurs, the user will be notified there was a problem
      }
    },
    assignBay: async (_, data) => {
      await http.post('user/assignBay', data);
    },
    userReport: async ({ commit }, data) => {
      try {
        const res = await http.get(`user/report/${data}`);
        commit('SET_DATA_BY_PROPERTY', {
          property: 'report',
          data: res.data.report,
        });
      } catch {
        // do nothing, if an error occurs, the user will be notified there was a problem
      }
    },
    unassignDeviceToUser: async (_, data) => {
      try {
        await http.post('/user/unassign-device-user', data);
      } catch (error) {
        throw error;
      }
    },
    unassignChamberToUser: async (_, data) => {
      try {
        await http.post('/user/unassign-chamber-user', data);
      } catch (error) {
        throw error;
      }
    },
    assignDeviceToUser: async (_, data) => {
      await http.post('user/assign-device-user', data);
    },
    getUsersByOrgId: async ({ commit }, data) => {
      try {
        const res = await http.post('user/user-by-orgid', data);
        commit('SET_DATA_BY_PROPERTY', {
          property: 'orgUsers',
          data: res.data.users,
        });
      } catch (error) {
        console.log(error);
      }
    },
    getUserAlerts: async ({ commit }, payload) => {
      try {
        const userAlerts = await http.get(`user/get-Alerts/${payload}`);
        commit('SET_USER_ALERTS', userAlerts.data);
      } catch (error) {
        console.log(error);
      }
    },
    toggleAlerts: async ({ commit }, payload) => {
      const toggleAlerts = await http.post('user/alerts', payload);
      commit('SET_USER_ALERTS', toggleAlerts.data);
    },
    uploadCSV({ dispatch }, file) {
      return new Promise((resolve, reject) => {
        // let users = JSON.parse(localStorage.getItem('users') || []);
        // let users = JSON.parse([]);
        let users = [];
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = async () => {
          const csv = reader.result;
          const u = await dispatch('csvToJSON', csv);
          users = [...users, ...u];
        };

        reader.onerror = (e) => {
          reject(e);
        };

        reader.onloadend = () => {
          localStorage.setItem('users', JSON.stringify(users));
          resolve(users);
        };
      });
    },
    csvToJSON(_, csv) {
      const lines = csv.split('\n');
      const result = [];
      const headers = lines?.[0]?.trim().split(',');
      for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines?.[i]?.trim()?.split(',');
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
        }
        if (obj.id !== '') result.push(obj);
      }
      return result;
    },
    getReservations: async ({ commit }, id) => {
      try {
        const reservations = await http.get(`user/reservations/${id}`);
        commit('SET_USER_RESERVATIONS', reservations.data);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
