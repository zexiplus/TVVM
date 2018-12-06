import Observer from './observer'
import Compiler from './compiler'
import Focuser from './focuser'
import Lifecycle from './lifycycle'

class TVVM {
  constructor(options) {
    // 初始化参数， 把el， data等进行赋值与绑定
    // data如果是函数就取返回值， 如果不是则直接赋值
    // 初始化焦点管理对象
    new Focuser(this, options)
    // 初始化生命周期对象
    new Lifecycle(options, this)
    // beforeCreate
    this.callHook('beforeCreate')

    this.$data = typeof options.data === "function" ? options.data() : options.data;
    this.methods = options.methods
    // 数据代理, 把data对象属性代理到vm实例上
    this.proxy(this.$data, this);
    this.proxy(options.methods, this);

    // 把$el真实的dom节点编译成vdom, 并解析相关指令
    if (options.el) {
      // 数据劫持,
      new Observer(this.$data);
      // created
      this.callHook('created')
      // beforeMounte
      this.callHook('beforeMount')
      new Compiler(options.el, this);
      this.focuser.generateIndexMap()
      // mounted 此时可以访问 this.$el
      this.callHook('mounted')
    }
  }
  // 数据代理, 访问/设置 this.a 相当于访问设置 this.data.a
  proxy(data, proxyTarget) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(proxyTarget, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key];
        },
        set(newValue) {
          // if (proxyTarget[key] !== undefined) {
          //   console.warn(`key ${key} has already in Target`);
          // }
          data[key] = newValue;
        }
      });
    });
  }
}

export default TVVM;
