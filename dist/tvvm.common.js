/*!
 * tvvm.js v1.0.0
 * A simple micro-library for agile building TV web app with no dependency
 * 
 * Copyright (c) 2018 float <zexiplus@outlook.com>
 * https://github.com/zexiplus/TVM#readme
 * 
 * Licensed under the MIT license.
 */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dep = function () {
  function Dep() {
    _classCallCheck(this, Dep);

    this.subs = [];
  }

  _createClass(Dep, [{
    key: "addSubs",
    value: function addSubs(watcher) {
      this.subs.push(watcher); // 添加订阅者
    }
  }, {
    key: "notify",
    value: function notify() {
      this.subs.forEach(function (watcher) {
        return watcher.update();
      });
    }
  }]);

  return Dep;
}();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Observer = function () {
  function Observer(data) {
    _classCallCheck$1(this, Observer);

    this.observer(data);
  }

  _createClass$1(Observer, [{
    key: "observer",
    value: function observer(data) {
      var _this2 = this;

      // 递归的终止条件： 当观察数据不存在或不再是对象是停止
      if (!data || (typeof data === "undefined" ? "undefined" : _typeof(data)) !== "object") {
        return;
      }
      Object.keys(data).forEach(function (key) {
        // 递归调用自身， 遍历对象上的所有属性都为响应式的
        _this2.observer(data[key]);
        _this2.setReactive(data, key);
      });
    }
    // 响应式  对数据的修改会触发相应的功能

  }, {
    key: "setReactive",
    value: function setReactive(obj, key) {
      var value = obj[key];
      var _this = this;
      var dep = new Dep();
      Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function get() {
          // 进行订阅, 在编译阶段， compiler会给template中的每个指令增加一个watcher， 在watcher取值时会设置自身为Dep.target
          Dep.target && dep.addSubs(Dep.target);

          return value;
        },
        set: function set(newValue) {
          if (newValue !== obj[key]) {
            // 对新值继续劫持
            _this.observer(newValue);
            // 用新值替换旧值
            value = newValue;
            // 发布通知
            dep.notify();
          }
        }
      });
    }
  }]);

  return Observer;
}();

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Watcher = function () {
  function Watcher(vm, expr, cb) {
    _classCallCheck$2(this, Watcher);

    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    // 在new Watcher时保存初始值
    this.value = this.getValAndSetTarget();
  }

  _createClass$2(Watcher, [{
    key: "getValAndSetTarget",
    value: function getValAndSetTarget() {
      Dep.target = this;
      var value = this.getValue(this.expr);
      Dep.target = null;
      return value;
    }
  }, {
    key: "getValue",
    value: function getValue(expr) {
      var arr = expr.split(".");
      return arr.reduce(function (prev, next) {
        return prev[next];
      }, this.vm.$data);
    }
  }, {
    key: "update",
    value: function update() {
      var oldVal = this.value;
      var newVal = this.getValue(this.expr);
      if (oldVal !== newVal) {
        this.cb && this.cb(newVal);
      }
    }
  }]);

  return Watcher;
}();

// 编译功能函数

var compileUtil = {
  updateText: function updateText(text, node, vm, expr) {
    // console.log('compileUtil.updateText text is', text)
    node && (node.textContent = text);
  },

  //  在绑定有t-model节点的input上绑定事件, expr为t-model的表达式例如 'message.name'
  't-model': function tModel(value, node, vm, expr) {
    var _this = this;

    node && (node.value = value);
    node.addEventListener('input', function (e) {
      _this.setVal(vm.$data, expr, e.target.value);
    });
  },
  't-if': function tIf(value, node, vm, expr) {
    var originalDisplay = window.getComputedStyle(node);
    node && (node.style.display = value ? originalDisplay : 'none');
  },
  't-show': function tShow(value, node, vm, expr) {
    var originalVisible = window.getComputedStyle(node);
    node && (node.style.visibility = value ? originalVisible : 'hidden');
  },
  't-for': function tFor(value, node, vm, expr) {
    // 截取 in 后的数组表达式
    var sliceBegin = expr.indexOf('in') + 3;
    var arrName = expr.slice(sliceBegin);
    var itemName = expr.slice(0, sliceBegin - 4);
    var arr = this.getVal(vm.$data, arrName);
    var reg = /\{\{([^}]+)\}\}/g;
    if (!Array.isArray(arr)) {
      return console.warn('t-for value must be an array');
    }
    var parentElement = node.parentElement;
    parentElement.removeChild(node);
    var baseNode = node.cloneNode(true);
    baseNode.setAttribute('t-scope', arrName);
    baseNode.setAttribute('t-itemname', itemName);
    baseNode.removeAttribute('t-for');
    baseNode.setAttribute('t-index', 0);
    baseNode.setAttribute('is-t-for', "true");
    arr.forEach(function (item, index) {
      var cloneNode = baseNode.cloneNode(true);
      cloneNode.setAttribute('t-index', index);
      if (cloneNode.textContent) {
        var match = cloneNode.textContent.match(/\{\{([^}]+)\}\}/)[1];
        var execFn = new Function('item', 'return ' + match);
        var result = execFn(item);
        cloneNode.textContent = cloneNode.textContent.replace(reg, result);
      }
      parentElement.appendChild(cloneNode);
    });
  },

  // 解析vm.data上的t-model绑定的值
  setVal: function setVal(obj, expr, value) {
    var arr = expr.split('.');
    arr.reduce(function (prev, next) {
      if (arr.indexOf(next) == arr.length - 1) {
        prev[next] = value;
      } else {
        return prev[next];
      }
    }, obj);
  },

  // 解析vm.$data 上的 例如 'member.id'属性
  getVal: function getVal(obj, expr) {
    var arr = expr.split('.');
    return arr.reduce(function (prev, next) {
      return prev[next];
    }, obj);
  }
};

var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var privateDirectives = ['is-t-for', 't-index', 't-scope', 't-itemname'];

var Compiler = function () {
  function Compiler(el, vm) {
    _classCallCheck$3(this, Compiler);

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
      var fragment = this.toFragment(this.el);

      // 编译节点
      this.compile(fragment);

      // 把编译后的文档片段重新添加到document中
      this.el.appendChild(fragment);
    } else {
      // 没有找到el根节点给出警告
      console.error("can not find element named " + el);
    }
  }

  // 编译节点，如果子节点是node节点， 递归调用自身和compileNode， 如果不是 则调用 compileText


  _createClass$3(Compiler, [{
    key: "compile",
    value: function compile(parentNode) {
      var _this = this;

      var childNodes = parentNode.childNodes;
      // console.log('childNodes is', childNodes)
      childNodes.forEach(function (node, index) {
        if (_this.isElement(node)) {
          _this.compile(node);
          _this.compileNode(node);
        } else if (_this.isText(node)) {
          _this.compileText(node);
        }
      });
    }

    // 编译文本节点

  }, {
    key: "compileText",
    value: function compileText(node) {
      var _this2 = this;

      // 测试文本节点含有 {{val}} 的 regexp
      var reg = /\{\{([^}]+)\}\}/g;
      // 拿到文本节点的文本值
      var text = node.textContent;
      if (reg.test(text)) {
        // 去掉{{}} 保留 value
        if (node.parentElement.getAttribute("t-for") || node.parentElement.getAttribute("is-t-for")) {} else {
          // 非t-for循环的替换逻辑
          var attrName = text.replace(reg, function () {
            // 对每个{{}}之类的表达式增加增加一个watcher,参数为vm实例, expr表达式, 更新回调函数
            new Watcher(_this2.vm, arguments.length <= 1 ? undefined : arguments[1], function (value) {
              compileUtil.updateText(value, node, _this2.vm);
            });
            return arguments.length <= 1 ? undefined : arguments[1];
          });
          // 例如取出{{message}} 中的 message, 交给compileUtil.updateText 方法去查找vm.data的值并替换到节点
          var textValue = this.splitData(attrName, this.vm.$data);
          compileUtil.updateText(textValue, node, this.vm);
        }
      }
    }

    // 剥离属性值

  }, {
    key: "splitData",
    value: function splitData(attr, data) {
      // 传入 attr 形如 'group.member.name', 找到$data上对应的属性值并返回
      var arr = attr && attr.split(".");
      var ret = arr.reduce(function (prev, next) {
        return prev[next];
      }, data);
      return ret;
    }

    // 编译node节点

  }, {
    key: "compileNode",
    value: function compileNode(node) {
      var _this3 = this;

      var attrs = node.getAttributeNames();
      // 把已t-指令存到一个数组中
      var directiveAttrs = attrs.filter(this.isDirective);
      directiveAttrs.forEach(function (item) {
        var expr = node.getAttribute(item); // 属性值
        var value = _this3.splitData(expr, _this3.vm.$data);
        if (compileUtil[item]) {
          compileUtil[item](value, node, _this3.vm, expr);
        } else if (!_this3.isPrivateDirective(item) && !_this3.isEventBinding(item)) {
          console.warn("can't find directive " + item);
        }
      });

      // @event 事件绑定逻辑
      var eventBindAttrs = attrs.filter(this.isEventBinding);
      eventBindAttrs.forEach(function (item) {
        var expr = node.getAttribute(item);
        var eventName = item.slice(1);
        var reg = /\(([^)]+)\)/;
        var hasParams = reg.test(expr);
        var fnName = expr.replace(reg, '');
        var fn = _this3.splitData(fnName, _this3.vm.methods);

        if (node.getAttribute('is-t-for')) {
          // 是 t-for 循环生成的列表, 则事件绑定在父元素上
          var parentElement = node.parentElement;
          parentElement.addEventListener(eventName, function (event) {
            if (event.target.getAttribute('is-t-for')) {
              if (hasParams) {
                var params = expr.match(reg)[1].split(',').map(function (item) {
                  return _this3.splitData(item.trim(), _this3.vm.$data);
                });
                // 取到 事件回调函数 的参数值
                var param = _this3.splitData(event.target.getAttribute('t-scope'), _this3.vm.$data)[event.target.getAttribute('t-index')];
                fn.call(_this3.vm, param);
              } else {
                fn.call(_this3.vm);
              }
            }
          });
        } else {
          // 非 t-for循环生成的元素
          if (hasParams) {
            // fn含有参数
            var params = expr.match(reg)[1].split(',').map(function (item) {
              return _this3.splitData(item.trim(), _this3.vm.$data);
            });
            node.addEventListener(eventName, fn.bind.apply(fn, [_this3.vm].concat(_toConsumableArray(params))));
          } else {
            // fn不含参数
            node.addEventListener(eventName, fn.bind(_this3.vm));
          }
        }
      });
    }
  }, {
    key: "isPrivateDirective",
    value: function isPrivateDirective(text) {
      return privateDirectives.includes(text);
    }

    // 判断是否是事件绑定

  }, {
    key: "isEventBinding",
    value: function isEventBinding(text) {
      var reg = /^@/;
      return reg.test(text);
    }

    // 判断节点属性是否是指令

  }, {
    key: "isDirective",
    value: function isDirective(text) {
      return text.includes("t-");
    }

    // 根据传入的值， 如果是dom节点直接返回， 如果是选择器， 则返回相应的dom节点

  }, {
    key: "getDOM",
    value: function getDOM(el) {
      if (this.isElement(el)) {
        return el;
      } else {
        return document.querySelector(el) || null;
      }
    }

    // 判断dom类型， 1 为元素， 2 是属性， 3是文本， 9是文档, 11是文档片段

  }, {
    key: "isElement",
    value: function isElement(el) {
      return el.nodeType === 1;
    }
  }, {
    key: "isText",
    value: function isText(el) {
      return el.nodeType === 3;
    }

    // 把el dom节点转换为fragment保存在内存中并返回

  }, {
    key: "toFragment",
    value: function toFragment(el) {
      var fragment = document.createDocumentFragment();
      var firstChild = void 0;
      // 循环把el的首个子元素推入fragment中
      while (firstChild = el.firstChild) {
        // 把原始 el dom节点的所有子元素增加到文档片段中并移除原 el dom节点的所有子元素
        fragment.appendChild(firstChild);
      }
      return fragment;
    }
  }]);

  return Compiler;
}();

var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TVVM = function () {
  function TVVM(options) {
    _classCallCheck$4(this, TVVM);

    // 初始化参数， 把el， data等进行赋值与绑定
    this.$el = options.el;
    // data如果是函数就取返回值， 如果不是则直接赋值
    this.$data = typeof options.data === "function" ? options.data() : options.data;
    this.methods = options.methods;
    // 数据代理, 把data对象属性代理到vm实例上
    this.proxy(this.$data, this);
    this.proxy(options.methods, this);
    // debugger
    // 把$el真实的dom节点编译成vdom, 并解析相关指令
    if (this.$el) {
      // 数据劫持,
      new Observer(this.$data);
      new Compiler(this.$el, this);
    }
  }
  // 数据代理, 访问/设置 this.a 相当于访问设置 this.data.a


  _createClass$4(TVVM, [{
    key: "proxy",
    value: function proxy(data, proxyTarget) {
      Object.keys(data).forEach(function (key) {
        Object.defineProperty(proxyTarget, key, {
          enumerable: true,
          configurable: true,
          get: function get() {
            return data[key];
          },
          set: function set(newValue) {
            if (proxyTarget[key] !== undefined) {
              console.warn("key " + key + " has already in Target");
            }
            data[key] = newValue;
          }
        });
      });
    }
  }]);

  return TVVM;
}();

module.exports = TVVM;
