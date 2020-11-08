// 实现一个插件
// 1. 返回一个函数
// 2. 或者返回一个对象,它有一个install方法


let _Vue = null
/**
 * @class VueRouter
 * @param options 选项
 */

class VueRouter {
  constructor(options) {
    // options 配置选项: router - 路由表
    this.$options = options

    // 缓存path 和route的映射关系
    this.routeMap = {}

     // 找到当前url对于的组件
    this.$options.routes.forEach(route => {
      this.routeMap[route.path] = route
    })

    // 需要定义一个响应式的current属性
    const initial = window.location.hash.slice(1) || '/'
    // defineReactive 给一个对象定义响应式数据
    _Vue.util.defineReactive(this, 'current', initial)

    // 监控url的变化
    window.addEventListener('hashchange', this.onHashChange.bind(this))

  }
  onHashChange () {
    this.current = window.location.hash.slice(1)
    console.log(this.current)
  }
}

VueRouter.install = function(Vue) {
  // 引用Vue构造函数,在上面的VueRouter中使用
  _Vue= Vue
  // 1. 挂载$router
  // 利用混入,延迟执行
  Vue.mixin({
    // 此处的this 指的是vue根实例
    beforeCreate() {
      if(this.$options.router) {
        Vue.prototype.$router = this.$options.router
      }
    }
  })

  // 2. 定义两个全局组件router-link, router-view
  Vue.component('router-link', {
    // 定义传入的参数
    props: {
      to: {
        type: String,
        require: true
      }
    },
    render(h) {
      // <router-link to="/home"/>
      // <a href="#/home">XXX</a>
      // 通用性更好
      return h('a',{
        attrs: {
          href: '#' + this.to
        }
      }, this.$slots.default)
      // 需要当前环境支持jsx
      // return <a href={'#' + this.to}> {this.$slots.default}</a>
    }
  })
  Vue.component('router-view', {
    render(h) {
      // 找到当前的url对应的组件
      const { routeMap, current } = this.$router
      const component = routeMap[current] ? routeMap[current].component : null
      return h(component)
    }
  })
}

export default VueRouter