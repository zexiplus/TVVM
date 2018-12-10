class Lifecycle {
  constructor(options, vm) {
    this.hooks = {};
    this.init(options, vm);
    vm.lifecycle = this;
    vm.callHook = this.callHook.bind(this);
  }

  init(options, vm) {
    const {
      beforeCreate,
      created,
      beforeMount,
      mounted,
      beforeUpdate,
      updated,
      beforeDestory,
      destoried
    } = options;
    const hooks = {
      beforeCreate,
      created,
      beforeMount,
      mounted,
      beforeUpdate,
      updated,
      beforeDestory,
      destoried
    };
    Object.keys(hooks).forEach((key, index) => {
      if (hooks[key] === undefined) {
        hooks[key] = emptyFn;
      }
      if (hooks[key] instanceof Function) {
        hooks[key] = hooks[key].bind(vm);
      } else {
        console.warn("lifecycle hooks must be a function");
        hooks[key] = emptyFn;
      }
    });
    this.hooks = hooks;
  }

  callHook(fnName) {
    // fnName in this.hooks && this.hooks[fnName]()
    this.hooks[fnName]();
  }
}

function emptyFn() {
  return;
}

export default Lifecycle;
