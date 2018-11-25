// 编译功能函数

const compileUtil = {
  updateText(text, node, vm, expr) {
      // console.log('compileUtil.updateText text is', text)
      node && (node.textContent = text)
    },
    //  在绑定有t-model节点的input上绑定事件, expr为t-model的表达式例如 'message.name'
    't-model': function (value, node, vm, expr) {
      node && (node.value = value)
      node.addEventListener('input', (e) => {
        this.setVal(vm.$data, expr, e.target.value)
      })
    },
    't-if': function (value, node, vm, expr) {
      const originalDisplay = window.getComputedStyle(node)
      node && (node.style.display = value ? originalDisplay : 'none')
    },
    't-show': function (value, node, vm, expr) {
      const originalVisible = window.getComputedStyle(node)
      node && (node.style.visibility = value ? originalVisible : 'hidden')
    },
    't-for': function (value, node, vm, expr) {
      // 截取 in 后的数组表达式
      const sliceBegin = expr.indexOf('in') + 3
      const arrName = expr.slice(sliceBegin)
      const arr = this.getVal(vm.$data, arrName)
      const reg = /\{\{([^}]+)\}\}/g
      if (!Array.isArray(arr)) {
        return console.warn('t-for value must be an array')
      }
      const parentElement = node.parentElement
      parentElement.removeChild(node)
      const baseNode = node.cloneNode(true)
      baseNode.removeAttribute('t-for')
      baseNode.setAttribute('is-t-for', "true")
      arr.forEach((item, index) => {
        let cloneNode = baseNode.cloneNode(true)
        cloneNode.textContent && (cloneNode.textContent = cloneNode.textContent.replace(reg, item))
        parentElement.appendChild(cloneNode)
      })
    },
    // 解析vm.data上的t-model绑定的值
    setVal(obj, expr, value) {
      let arr = expr.split('.')
      arr.reduce((prev, next) => {
        if (arr.indexOf(next) == arr.length - 1) {
          prev[next] = value
        } else {
          return prev[next]
        }
      }, obj)
    },
    // 解析vm.$data 上的 例如 'member.id'属性
    getVal(obj, expr) {
      let arr = expr.split('.')
      return arr.reduce((prev, next) => {
        return prev[next]
      }, obj)
    }
}

export default compileUtil