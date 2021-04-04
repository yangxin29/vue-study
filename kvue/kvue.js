// 实现kvue 的构造函数
// 1. 将data做响应式处理


// Object.defineProperty()
// 对传入对象的key进行一次拦截, 对某个对象的某个key做拦截
function definReactive(obj, key, val) {
  // 如果val 是对象, 则需要继续递归处理
  observe(val)
  // Dep创建的最佳时刻
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    get() {
      console.log('get', key)
      // 依赖收集
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set(newValue) {
      if(val !== newValue) {
        // 如果newValue 是对象也需要做响应式处理
        observe(newValue)
        val = newValue
        console.log('set', key, val)
        // console.log(watchers)
        // watchers.forEach(w => w.update())
        // 通知更新
        dep.notify()
      }
    }
  })
}

// 遍历指定数据对象中的每个key,并拦截他们
function observe(obj) {
	// 判断是否是一个对象
	if(typeof obj !== 'object' || obj === null) {
		return obj
	}
	// Object.keys(obj).forEach(key => {
	// 	definReactive(obj, key, obj[key])
	// })
  // 每遇到一个对象,就创建一个Observer的实例
  // 创建一个Observer 实例去做拦截操作
  new Observer(obj)
}

function set(obj, key, val) {
  // 进行响应式处理
  definReactive(obj, key, val)
}

// proxy代理函数: 让用户可以直接访问data里的属性
function proxy(vm, key) {
  Object.keys(vm[key]).forEach(k => {
    Object.defineProperty(vm, k, {
      get() {
        return vm[key][k]
      },
      set(v) {
        vm[key][k] = v
      }
    })
  })
}

// 根据value 类型做不同的操作(数组和对象)
class Observer {
  constructor(value) {
    this.value = value
    // 应该需要判断value 类型, 然后对对象和数组进行不同的操作
    // 这里只处理对象
    // 遍历对象
    this.walk(value)
  }

  walk(obj) {
    Object.keys(obj).forEach(key => {
      definReactive(obj, key, obj[key])
    })
  }
}

class kvue {
  constructor(options) {
    // 0: 保存options
    this.$options = options
    this.$data = options.data
    // 1. 将data做响应式处理
    observe(this.$data)
    // 2. 为$data做代理
    proxy(this, '$data')
    // 3. 编译模板
    new Compile('#app', this)
  }
}

class Compile {
  // el - 宿主元素, vm - kvue 实例
  constructor(el, vm) {
    this.$el = document.querySelector(el)
    this.$vm = vm
    // 解析模板
    if (this.$el) {
      // 执行编译方法
      this.compile(this.$el)
    }
  }
  compile(el) {
    // el是宿主元素
    // 遍历,判断当前遍历元素的类型
    el.childNodes.forEach(node => {
      if (node.nodeType === 1) {
        // console.log('编译元素', node.nodeName)
        // 节点编译
        this.compileElement(node)
      } else if(this.isInter(node)) {
        // 文本, {{xxxx}}
        // console.log('编译文本', node.textContent, RegExp.$1)
        // 将文本转义一下
        this.compileText(node)
      }
      // 递归 ,判断node是否还有child
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node)
      }
    })
  }

  // 判断插值表达式
  isInter(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  // 编译文本
  compileText(node) {
    // node.textContent = this.$vm[RegExp.$1]
    this.update(node, RegExp.$1, 'text')
  }

  // 编译元素节点: 分析指令, @事件
  compileElement(node) {
    // 获取属性遍历值
    const nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach(attr => {
      // 指令: k-xxx 开头
      const attrName = attr.name
      const exp = attr.value
      if (this.isDirective(attrName)) {
        const dir = attrName.substring(2) // 得到xxx
        // 指令的实际的操作方法
        this[dir] && this[dir](node, exp)
      }
      // 处理事件
      
    })
  }

  // 判断是否是指令
  isDirective(attrName) {
    return attrName.indexOf('k-') === 0
  }
  // 执行text指令对应的更新函数
  text(node, exp) {
    // node.textContent = this.$vm[exp]
    //需要调用update方法
    this.update(node, exp, 'text')
  }
  // k-text 对应的操作函数
  textUpdater(node, val) {
    node.textContent = val
  }
  // k-html 对应的操作函数
  html(node, exp) {
    // node.innerHTML = this.$vm[exp]
    this.update(node, exp, 'html')
  }
  htmlUpdater(node, val) {
    node.innerHTML = val
  }
  // 提取update, 初始化和更新函数创建
  update(node, exp, dir) {
    const fn = this[dir+'Updater']
    // 初始化过程
    fn && fn(node, this.$vm[exp])
    // 更新
    new Watcher(this.$vm, exp, function(val) {
      fn && fn(node, val)
    })
  }
}

// Watcher: 跟视图中的依赖是一对一的关系 1:1
// const watchers = []
class Watcher {
  constructor(vm, key, updaterFn) {
    this.vm = vm
    this.key = key
    this.updaterFn = updaterFn
    // 依赖收集
    // watchers.push(this)
    Dep.target = this
    this.vm[this.key] // 触发上面的get
    Dep.target = null
  }

  update() {
    this.updaterFn.call(this.vm, this.vm[this.key])
  }
}
// 和某个key, 一一对应, 管理多个Watcher, 数据更新时通知他们做更新工作
class Dep {
  constructor() {
    this.deps = []
  }

  addDep(watcher) {
    this.deps.push(watcher)
  }

  notify() {
    this.deps.forEach(watcher => watcher.update())
  }
}