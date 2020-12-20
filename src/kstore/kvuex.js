// 实现一个插件
let _Vue
class Store {
  constructor(options = {}) {
    // 需要保存一下 mutations以及actions
    this._mutations = options.mutations
    this._actions = options.actions

    // 创建响应式的state
    this._vm = new _Vue({
      // 借助vue 的响应式
      data () {
        // data 这个对象中个key最终都会被代理到vue这个实例中去
        return {
          // 不希望被代理,就加上$
          $$state: options.state
        }
      }
    })
    
    // 修改this 的指向
    this.commit = this.commit.bind(this)
    this.dispatch = this.dispatch.bind(this)
  }
  // 暴露给外界的方法,让用户可以访问
  get state () {
    return this._vm._data.$$state
  }
  set state (v) {
    // 不允许对state直接做替换, 所有的操作都是可控的
    console.error('please use replaceState to reset state')
  }
  // 实现commit方法
  // 修改state
  // this.$store.commit('add', 1)
  commit (type, payload) {
    // 获取type对应的mutation
    const entry = this._mutations[type]

    if (!entry) {
      // 如果不存在就做一次警告
      console.error('unknown mutation')
      return
    }

    // 传入state作为参数,
    entry(this.state, payload)
  }

  // 实现dispatch方法
  dispatch (type, payload) {
    // 获取type对应的actions
    const entry = this._actions[type]

    if (!entry) {
      // 如果不存在就做一次警告
      console.error('unknown action')
      return
    }

    // 传入Stores实例做参数(上下文),
    return entry(this, payload)
  }
}

function install(Vue) {
  _Vue = Vue
  // 混入
  Vue.mixin({
    beforeCreate() {
      // 判断是否有store选项
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}

// 导出的对象就是Vuex
export default { Store, install }