// 编译功能函数

const compileUtil = {
  updateText(text, node, vm, expr) {
    // console.log('compileUtil.updateText text is', text)
    node && (node.textContent = text);
  },
  //  在绑定有t-model节点的input上绑定事件, expr为t-model的表达式例如 'message.name'
  "t-value": function(value, node, vm, expr) {
    node && (node.value = value);
    node.addEventListener("input", e => {
      this.setVal(vm.$data, expr, e.target.value);
    });
  },

  "t-bind": function (value, node, vm, expr, attrname) {
    node && node.setAttribute(attrname, value)
  },
  "t-if": function(value, node, vm, expr) {
    // const originalDisplay = node.style.display || 'block'
    node && (node.style.display = value ? "block" : "none");
  },
  "t-show": function(value, node, vm, expr) {
    const originalVisible = window.getComputedStyle(node);
    node && (node.style.visibility = value ? originalVisible : "hidden");
  },
  "t-class": function(value, node, vm, expr) {
    console.log('trigger t class')
    if (Array.isArray(value)) {
      value.forEach(item => {
        node.classList.add(item);
      });
    } else if ({}.toString.call(value) === "[object Object]") {
      // node.classList = [];
      Object.keys(value).forEach(classname => {
        if (value[classname]) {
          node.classList.add(classname);
        } else {
          node.classList.remove(classname);
        }
      });
    } else {
      console.warn("t-class must receive an array or object");
    }
  },
  "t-for": function(value, node, vm, expr, attrname, originalExpr) {
    // 截取 in 后的数组表达式
    const startIndex = originalExpr.indexOf("in") + 3;
    const arrNamePrefix = originalExpr.slice(startIndex)
    const arrName = arrNamePrefix.split('.').slice(1).join('.');
    const itemName = originalExpr.slice(0, startIndex - 4);
    const arr = this.getVal(vm.$data, arrName);
    const reg = /\{\{([^}]+)\}\}/g;
    if (!Array.isArray(arr)) {
      return console.warn("t-for value must be an array");
    }
    const parentElement = node.parentElement;
    parentElement.removeChild(node);
    const baseNode = node.cloneNode(true);
    baseNode.setAttribute("t-scope", arrNamePrefix);
    baseNode.setAttribute("t-itemname", itemName);
    baseNode.removeAttribute("t-for");
    baseNode.setAttribute("t-index", 0);
    baseNode.setAttribute("is-t-for", "true");
    arr.forEach((item, index) => {
      let cloneNode = baseNode.cloneNode(true);
      cloneNode.setAttribute("t-index", index);
      if (cloneNode.textContent) {
        let match = cloneNode.textContent.match(/\{\{([^}]+)\}\}/)[1];
        let execFn = new Function("item", `return ${match}`);
        let result = execFn(item);
        cloneNode.textContent = cloneNode.textContent.replace(reg, result);
      }
      parentElement.appendChild(cloneNode);
    });
  },

  // 解析vm.data上的t-model绑定的值
  setVal(obj, expr, value) {
    let arr = expr.split(".");
    arr.reduce((prev, next) => {
      if (arr.indexOf(next) == arr.length - 1) {
        prev[next] = value;
      } else {
        return prev[next];
      }
    }, obj);
  },
  // 解析vm.$data 上的 例如 'member.id'属性
  getVal(obj, expr) {
    let arr = expr.split(".");
    return arr.reduce((prev, next) => {
      return prev[next];
    }, obj);
  }
};

export default compileUtil;
