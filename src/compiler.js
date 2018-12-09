import Watcher from "./watcher";
import compileUtil from "./compileUtil";

const privateDirectives = ['is-t-for', 't-index', 't-scope', 't-itemname'];
const REG_STRING_MAP = {
  'T_BIND': '(^t-bind:|^:)',
  'EVENT_BIND':  '^@',
  'DATA_BIND': '\{\{([^}]+)\}\}', // 数据绑定 e.g {{expression}}
  'JAVASCRIPT_VARIABLE': '^[a-zA-Z_]+[a-zA-Z_\d]*',    // javascript合法变量名 e.g name , age...
  'JAVASCRIPT_EXPRESSION': '(^[a-zA-Z_]+[a-zA-Z_\d]*)(\.[a-zA-Z_]+[a-zA-Z\d]*)*', // javascript属性值表达式 e.g person.info.age
}

class Compiler {
  constructor(el, vm) {
    // 把dom节点挂载在Complier实例上
    this.el = this.getDOM(el);
    // 把mvvm实例挂载在complier实例上
    this.vm = vm;
    // debugger
    if (this.el) {
      // 如果存在再编译成文档片段
      // 编译解析出相应的指令 如 t-text, t-model, {{}}
      // 保存原有dom节点到fragment文档片段， 并做替换

      // 转化为文档片段并存到内存中去
      let fragment = this.toFragment(this.el);

      // 编译节点
      this.compile(fragment);

      // 把编译后的文档片段重新添加到document中
      this.el.appendChild(fragment);
    } else {
      // 没有找到el根节点给出警告
      console.error(`can not find element named ${el}`);
    }
    this.vm.$el = this.el
  }

  // 编译节点，如果子节点是node节点， 递归调用自身和compileNode， 如果不是 则调用 compileText
  compile(parentNode) {
    let childNodes = parentNode.childNodes;
    childNodes.forEach((node, index) => {
      // 不编译code代码节点
      if (node.tagName === 'CODE') return
      if (this.isElement(node)) {
        this.compile(node);
        this.compileNode(node);
      } else if (this.isText(node)) {
        this.compileText(node);
      }
    });
  }

  // 编译文本节点, 待优化
  compileText(node) {
    // 测试文本节点含有 {{val}} 的 regexp
    let reg = /\{\{([^}]+)\}\}/;
    // 拿到文本节点的文本值
    let text = node.textContent;
    if (reg.test(text)) {
      // 去掉{{}} 保留 value
      if (node.parentElement.getAttribute("t-for") || node.parentElement.getAttribute("is-t-for")) {

      } else {
        // 捕获{{expr}} 双花括号中的表达式
        let expr = text.match(reg)[1]
        // 捕获data的属性表达式
        let dataAttrReg = /data(\.[a-zA-Z_]+[a-zA-Z_\d]*)+(\(\))*/g;
        let watcherList = expr.match(dataAttrReg)
        let methodReg = /\.([a-zA-Z_]+[a-zA-Z_\d])+(\(\))/

        // 例如取出{{message}} 中的 message, 交给compileUtil.updateText 方法去查找vm.data的值并替换到节点
        // let textValue = this.getData(attrName, this.vm.$data);
        let execFn = new Function('data', `return ${expr}`)
        let data = this.vm.$data
        let value = execFn(data)
        compileUtil.updateText(value, node, this.vm);

        // 给每个attribute上设置watcher
        watcherList = watcherList.map(item => {
          let attr = item.replace(methodReg, '')
          attr = attr.split('.').slice(1).join('.')
          new Watcher(this.vm, attr, expr , function(value) {
            let expr = this.expr
            let execFn = new Function('data', `return ${expr}`)
            let data = this.vm.$data
            let val = execFn(data)
            compileUtil.updateText(val, node, this.vm);
          })
          return attr
        })
      }
    }
  }

  // 传入表达式， 获得属性值
  getData(expr, data) {
    // 传入 expr 形如 'group.member.name', 找到$data上对应的属性值并返回
    let arr = expr && expr.split(".");
    let ret = arr.reduce((prev, next) => {
      return prev[next];
    }, data);
    return ret;
  }

  // 编译node节点 分析t指令， 待优化
  compileNode(node) {
    let attrs = node.getAttributeNames();
    // 把t-指令(不包括t-index)属性存到一个数组中
    let directiveAttrs = attrs.filter((attrname) => {
      return this.isDirective(attrname) && !this.isTFocus(attrname)
    });

    directiveAttrs.forEach(item => {
      let expr = node.getAttribute(item); // 属性值
      expr = expr.split('.').slice(1).join('.')
      new Watcher(this.vm, expr, expr, (value) => {
        compileUtil[item](value, node, this.vm, expr);
      })
      let value = this.getData(expr, this.vm.$data);
      if (compileUtil[item]) {
        compileUtil[item](value, node, this.vm, expr);
      } else if (!this.isPrivateDirective(item) && !this.isEventBinding(item)) {
        console.warn(`can't find directive ${item}`);
      }
    });

    // 焦点记录逻辑
    if (attrs.includes('t-index')) {
      let focusIndex = node.getAttribute('t-index')
      node.setAttribute('tabindex', this.vm.focuser.tid)
      this.vm.focuser.addFocusMap(focusIndex, node)
    }

    // @event 事件绑定逻辑
    let eventBindAttrs = attrs.filter(this.isEventBinding);
    eventBindAttrs.forEach(item => {
      let expr = node.getAttribute(item)
      let eventName = item.slice(1)
      let reg = /\(([^)]+)\)/
      let hasParams = reg.test(expr)
      let fnName = expr.replace(reg, '')
      let fn = this.getData(fnName, this.vm)

      if (node.getAttribute('is-t-for')) { // 是 t-for 循环生成的列表, 则事件绑定在父元素上
        let parentElement = node.parentElement
        parentElement.addEventListener(eventName, (event) => {
          if (event.target.getAttribute('is-t-for')) {
            if (hasParams) {
                let params = expr.match(reg)[1].split(',').map(item => {
                    return this.getData(item.trim(), this.vm.$data)
                })
                // 取到 事件回调函数 的参数值
                let param = this.getData(event.target.getAttribute('t-scope'), this.vm.$data)[event.target.getAttribute('t-index')]
                fn.call(this.vm, param)
            } else {
              fn.call(this.vm)
            }
          }
        })
      } else { // 非 t-for循环生成的元素
        if (hasParams) { // fn含有参数
          let params = expr.match(reg)[1].split(',').map(item => {
              return this.getData(item.trim(), this.vm.$data)
          })
          node.addEventListener(eventName, fn.bind(this.vm, ...params))
        } else { // fn不含参数
          node.addEventListener(eventName, fn.bind(this.vm))
        }
      }
    });
  }

  isPrivateDirective(text) {
    return privateDirectives.includes(text);
  }

  // 判断是否是事件绑定
  isEventBinding(text) {
    const reg = /^@/;
    return reg.test(text);
  }

  // 判断节点属性是否是t指令
  isDirective(attrname) {
    return attrname.includes("t-") || attrname.indexOf(':') === 0;
  }

  // 判断是否是t-index
  isTFocus(attrname) {
    return attrname === 't-index'
  }

  isTFor(attrname) {
    return attrname === 't-for'
  }

  isTBind(attrname) {
    return /(^t-bind:|^:)/.test(attrname)
  }

  // 根据传入的值， 如果是dom节点直接返回， 如果是选择器， 则返回相应的dom节点
  getDOM(el) {
    if (this.isElement(el)) {
      return el;
    } else {
      return document.querySelector(el) || null;
    }
  }

  // 判断dom类型， 1 为元素， 2 是属性， 3是文本， 9是文档, 11是文档片段
  isElement(el) {
    return el.nodeType === 1;
  }

  isText(el) {
    return el.nodeType === 3;
  }

  // 把el dom节点转换为fragment保存在内存中并返回
  toFragment(el) {
    let fragment = document.createDocumentFragment();
    let firstChild;
    // 循环把el的首个子元素推入fragment中
    while ((firstChild = el.firstChild)) {
      // 把原始 el dom节点的所有子元素增加到文档片段中并移除原 el dom节点的所有子元素
      fragment.appendChild(firstChild);
    }
    return fragment;
  }
}

export default Compiler;
