import Dep from "./dep";

class Watcher {
  /**
   * 
   * @param {*} vm 
   * @param {*} watchTarget | watch target in data e.g input.value
   * @param {*} expr | expresion in {{data.input.value + 1}} e.g 'data.input.value + 1' 
   * @param {*} bindAttrName | t-bind node attribute name e.g :id="data.tid" --> id
   * @param {*} cb | update callback
   */
  constructor(vm, watchTarget, expr, bindAttrName, cb) {
    this.vm = vm;
    this.watchTarget = watchTarget;
    this.expr = expr; 
    this.bindAttrName = bindAttrName;
    this.cb = cb;
    this.value = this.getValAndSetTarget(); // save value when first compiled
  }
  getValAndSetTarget() {
    Dep.target = this;
    let value = this.getValue(this.watchTarget, this.vm.$data);
    Dep.target = null;
    return value;
  }
  getValue(tag, base) {
    let arr = tag.split(".");
    return arr.reduce((prev, next) => {
      return prev[next];
    }, base);
  }
  update() {
    let oldVal = this.value;
    let newVal = this.getValue(this.watchTarget, this.vm.$data);
    this.cb && this.cb(newVal, this.bindAttrName, this.expr);
  }
}

export default Watcher;
