const state = {
  savePath: '',
  appPath: '',
  errReportList: []
}

const mutations = {
  GET_SAVE_PATH(state, payload){
    state.savePath = payload.savePath
  },
  GET_APP_PATH(state, payload){
    state.appPath = payload.appPath
  },
  ADD_ERR_REPORTLIST(state, payload){
    state.errReportList.push(payload.errReport)
  },
  DELETE_ERR_REPORTLIST(state, payload){
    if(payload.index == -1){
      state.errReportList = []
    }else{
      state.errReportList.splice(payload.index, 1)
    }
  },
}

const actions = {
  GET_SAVE_PATH({commit}, payload) {
    commit('GET_SAVE_PATH', payload)
  },
  GET_APP_PATH({commit}, payload) {
    commit('GET_APP_PATH', payload)
  },
  ADD_ERR_REPORTLIST({commit}, payload){
    commit('ADD_ERR_REPORTLIST', payload)
  },
  DELETE_ERR_REPORTLIST({commit}, payload){
    commit('DELETE_ERR_REPORTLIST', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
