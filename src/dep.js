class Dep {
  constructor() {
    this.subs = [];
  }
  addSubs(watcher) {
    this.subs.push(watcher); // add subscribers
  }
  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}

export default Dep;
