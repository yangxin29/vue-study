import Vue from 'vue'
import Vuex from './kvuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    // state是如何获取的
    add(state) {
      state.count++
    }
  },
  actions: {
    // 这里的上下文是啥,为什么可以结构出commit
    add({commit}) {
      setTimeout(() => {
        commit('add')
      }, 1000);
    }
  },
  modules: {
  }
})
