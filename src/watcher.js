import Dep from "./dep";

class Watcher {
  constructor(vm, tag, expr, cb) {
    this.vm = vm;
    this.tag = tag; // e.g input.value
    this.expr = expr // e.g data.input.value + data.message
    this.cb = cb;
    // 在new Watcher时保存初始值
    this.value = this.getValAndSetTarget();
  }
  getValAndSetTarget() {
    Dep.target = this;
    let value = this.getValue(this.tag);
    Dep.target = null;
    return value;
  }
  getValue(tag) {
    let arr = tag.split(".");
    return arr.reduce((prev, next) => {
      return prev[next];
    }, this.vm.$data);
  }
  update() {
    let oldVal = this.value;
    let newVal = this.getValue(this.tag);
    this.cb && this.cb(newVal);
  }
}

export default Watcher;
