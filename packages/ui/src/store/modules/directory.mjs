import { directoryService } from '../../service/directoryService';

const state = {
  directorys: [],
  selectDirectory: null,
  newDirectory: null,
  createDirError: null,
  directoryById: null,
  deleteDirMsg: null,
  deleteDirError: null,
  success: false,
};

export const directory = {
  state,

  mutations: {
    setAllDirectorys: (state, data) => {
      state.directorys = data.directorys;
    },
    newDirectory: (state, { data }) => {
      if (data.success) {
        state.newDirectory = data.directory;
        state.success = data.success;
        state.createDirError = null;
      }
    },
    createDirError: (state, { error }) => {
      state.createDirError = error.message;
      state.success = error.success;
    },
    findByDirectoryId: (state, data) => {
      state.directoryById = data.directory;
      state.success = data.success;
    },
    deleteDirMsg: (state, data) => {
      state.deleteDirMsg = data.message;
      state.deleteDirError = null;
      state.success = data.success;
    },
    deleteDirError: (state, { error }) => {
      state.deleteDirError = error.message;
      state.success = error.success;
    },
  },

  getters: {
    directorys: state => state.directorys,
    newDirectory: state => state.newDirectory,
    createDirError: state => state.createDirError,
    directoryById: state => state.directoryById,
    deleteDirMsg: state => state.deleteDirMsg,
    deleteDirError: state => state.deleteDirError,
  },

  actions: {
    getAllDirectorys: async ({ commit }) => {
      try {
        const res = await directoryService.findAll();
        commit('setAllDirectorys', res.data);
      } catch (error) {
        console.log(error);
      }
    },
    createDirectory: async ({ commit }, data) => {
      try {
        const res = await directoryService.create(data);
        commit('newDirectory', res);
      } catch (error) {
        const err = error?.response;
        commit('createDirError', err.data);
      }
    },
    getDirectoryById: async ({ commit }, directoryId) => {
      try {
        const res = await directoryService.findByDirectoryId(directoryId);
        commit('findByDirectoryId', res.data);
      } catch (error) {
        console.log(error);
      }
    },
    updateDirectory: async ({ commit }, data) => {
      try {
        const res = await directoryService.updateDirectory(data.id, data.body);
        commit('setAllDirectorys', res.data);
      } catch (error) {
        console.log(error);
      }
    },
    deleteDirectory: async ({ commit }, data) => {
      try {
        const res = await directoryService.deleteDirectory(data);
        commit('deleteDirMsg', res.data);
      } catch (error) {
        const err = error?.response;
        commit('deleteDirError', err.data);
      }
    },
  },
};
