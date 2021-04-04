// Object.defineProperty()
// 对传入对象的key进行一次拦截, 对某个对象的某个key做拦截
function definReactive(obj, key, val) {
  // 如果val 是对象, 则需要继续递归处理
  observe(val)
  Object.defineProperty(obj, key, {
    get() {
      console.log('get', key)
      return val
    },
    set(newValue) {
      if(val !== newValue) {
        // 如果newValue 是对象也需要做响应式处理
        observe(newValue)
        val = newValue
        console.log('set', key, val)
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
	Object.keys(obj).forEach(key => {
		definReactive(obj, key, obj[key])
	})
}

function set(obj, key, val) {
  // 进行响应式处理
  definReactive(obj, key, val)
}

const obj = {foo: 'foo', bar: 'bar', baz: {a: 1}}
observe(obj)

// definReactive(obj, 'foo', 'foo')
// obj.foo
// obj.foo = 'foooooooooooooo1212'
// obj.baz.a = 11
// obj.baz = {
//   a: 11
// }

set(obj, 'dong', 'dong')
obj.dong = 'dong11'
