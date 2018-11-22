class Dep {
    constructor() {
        this.subs = []
    }
    addSubs(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        // console.log('notified')
        this.subs.forEach(watcher => watcher.update())
    }
}

export default Dep