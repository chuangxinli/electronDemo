//const fs = require('fs')
//let jsonObj = fs.readFileSync()
const state = {
  num: 1234,
  jsonArr1: []
}

const mutations = {
  DECREMENT_MAIN_COUNTER (state, payload) {
    if (payload && payload.num) {
      state.num -= payload.num
    } else {
      state.num--
    }
  },
  INCREMENT_MAIN_COUNTER (state, payload) {
    if (payload && payload.num) {
      state.num += payload.num
    } else {
      state.num++
    }
  },
  //导入成功  payload => {jsonArr: [{},{},{}]}
  CHANGE_jSON_ARR(state, payload){
    //state.jsonArr.concat(payload.jsonArr)
    state.jsonArr1 = payload.jsonArr
  },
  //上传成功 payload => {localId: Number}
  DELETE_ONE_PAPER(state, payload){
    for (let i = 0, len = state.jsonArr1.length; i < len; i++) {
      if (!state.jsonArr1[i]) {
        continue
      } else if (payload.localId == state.jsonArr1[i].localId) {
        state.jsonArr1.splice(i, 1)
      }
    }
  },
  //修改某个试卷 payload => {paper: {}}
  CHANGE_ONE_PAPER(state, payload){
    for (let i = 0, len = state.jsonArr1.length; i < len; i++) {
      if (payload.paper.localId === state.jsonArr1[i].localId) {
        state.jsonArr1.splice(i, 1, payload.paper)
      }
    }
  }
}

const actions = {
  INCREMENT_MAIN_COUNTER ({commit}, payload) {
    commit('INCREMENT_MAIN_COUNTER', payload)
  },
  DECREMENT_MAIN_COUNTER ({commit}, payload) {
    commit('DECREMENT_MAIN_COUNTER', payload)
  },
  CHANGE_jSON_ARR ({commit}, payload) {
    commit('CHANGE_jSON_ARR', payload)
  },
  DELETE_ONE_PAPER ({commit}, payload) {
    commit('DELETE_ONE_PAPER', payload)
  },
  CHANGE_ONE_PAPER ({commit}, payload) {
    commit('CHANGE_ONE_PAPER', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
