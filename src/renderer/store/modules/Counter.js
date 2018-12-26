const fs = require('fs')
//let jsonObj = fs.readFileSync()
const state = {
  main: 1231312312312312312312,
  jsonArr: []
}

const mutations = {
  DECREMENT_MAIN_COUNTER (state) {
    state.main--
  },
  INCREMENT_MAIN_COUNTER (state) {
    state.main++
  },
  CHANGE_jSON_OBJ(state, obj){
     state.jsonArr = obj.jsonArr
  }
}

const actions = {
  someAsyncTask ({ commit }) {
    // do something async
    commit('INCREMENT_MAIN_COUNTER')
  }
}

export default {
  state,
  mutations,
  actions
}
