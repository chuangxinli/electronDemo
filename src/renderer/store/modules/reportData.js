

const state = {
    savePath: ''
}

const mutations = {
    GET_SAVE_PATH(state, payload){
        state.savePath = payload.savePath
    }
}

const actions = {
    GET_SAVE_PATH({commit}, payload) {
        commit('GET_SAVE_PATH', payload)
    }
}

export default {
    state,
    mutations,
    actions
}
