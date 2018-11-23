import Dep from './dep'

class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        // 在new Watcher时保存初始值
        this.value = this.getValAndSetTarget()
    }
    getValAndSetTarget() {
        Dep.target = this
        let value = this.getValue(this.expr)
        Dep.target = null
        return value
    }
    getValue(expr) {
        let arr = expr.split('.')
        return arr.reduce((prev, next) => {
            return prev[next]
        }, this.vm.$data)
    }
    update() {
        let oldVal = this.value
        let newVal = this.getValue(this.expr)
        if (oldVal !== newVal) {
            this.cb && this.cb(newVal)
        }
    }
}

export default Watcher