class Dep {
    constructor() {
        this.subs = []
    }
    addSubs(watcher) {
        this.subs.push(watcher) // 添加订阅者
    }
    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}

export default Dep