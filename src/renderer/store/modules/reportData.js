const state = {
  savePath: '',
  appPath: '',
  dataPath: ''
}

const mutations = {
  GET_SAVE_PATH(state, payload){
    state.savePath = payload.savePath
  },
  GET_APP_PATH(state, payload){
    state.appPath = payload.appPath
  },
  GET_DATA_PATH(state, payload){
    state.dataPath = payload.dataPath
  }
}

const actions = {
  GET_SAVE_PATH({commit}, payload) {
    commit('GET_SAVE_PATH', payload)
  },
  GET_APP_PATH({commit}, payload) {
    commit('GET_APP_PATH', payload)
  },
  GET_DATA_PATH({commit}, payload){
    commit('GET_DATA_PATH', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
