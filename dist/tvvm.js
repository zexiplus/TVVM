/*!
 * tvvm v1.0.1
 * A simple micro-library for agile building TV web app with no dependency
 * 
 * Copyright (c) 2018 float <zexiplus@outlook.com>
 * https://github.com/zexiplus/TVM#readme
 * 
 * Licensed under the MIT license.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.TVVM = factory());
}(this, (function () { 'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  var Dep = function () {
    function Dep() {
      classCallCheck(this, Dep);

      this.subs = [];
    }

    createClass(Dep, [{
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

  var Observer = function () {
    function Observer(data, vm) {
      classCallCheck(this, Observer);

      this.observer(data);
      this.vm = vm;
    }

    createClass(Observer, [{
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
          get: function get$$1() {
            // 依赖收集 进行订阅, 在编译阶段， compiler会给template中的每个指令增加一个watcher， Dep.target 为一个watcher
            Dep.target && dep.addSubs(Dep.target);

            return value;
          },
          set: function set$$1(newValue) {
            if (newValue !== obj[key]) {
              // 对新值继续劫持
              _this.observer(newValue);
              // 用新值替换旧值
              _this.vm.callHook('beforeUpdate');
              value = newValue;
              // 发布通知
              dep.notify();
              _this.vm.callHook('updated');
              // update
            }
          }
        });
      }
    }]);
    return Observer;
  }();

  var Watcher = function () {
    function Watcher(vm, expr, cb) {
      classCallCheck(this, Watcher);

      this.vm = vm;
      this.expr = expr;
      this.cb = cb;
      // 在new Watcher时保存初始值
      this.value = this.getValAndSetTarget();
    }

    createClass(Watcher, [{
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

  var privateDirectives = ['is-t-for', 't-index', 't-scope', 't-itemname'];

  var Compiler = function () {
    function Compiler(el, vm) {
      classCallCheck(this, Compiler);

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
      this.vm.$el = this.el;
    }

    // 编译节点，如果子节点是node节点， 递归调用自身和compileNode， 如果不是 则调用 compileText


    createClass(Compiler, [{
      key: "compile",
      value: function compile(parentNode) {
        var _this = this;

        var childNodes = parentNode.childNodes;
        // console.log('childNodes is', childNodes)
        childNodes.forEach(function (node, index) {
          // 不编译code代码节点
          if (node.tagName === 'CODE') return;
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
        // 把t-指令(不包括t-index)属性存到一个数组中
        var directiveAttrs = attrs.filter(function (attrname) {
          return _this3.isDirective(attrname) && !_this3.isTFocus(attrname);
        });
        directiveAttrs.forEach(function (item) {
          var expr = node.getAttribute(item); // 属性值
          var value = _this3.splitData(expr, _this3.vm.$data);
          if (compileUtil[item]) {
            compileUtil[item](value, node, _this3.vm, expr);
          } else if (!_this3.isPrivateDirective(item) && !_this3.isEventBinding(item)) {
            console.warn("can't find directive " + item);
          }
        });

        // 焦点记录逻辑
        if (attrs.includes('t-index')) {
          var focusIndex = node.getAttribute('t-index');
          node.setAttribute('tabindex', this.vm.focuser.tid);
          this.vm.focuser.addFocusMap(focusIndex, node);
        }

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
              node.addEventListener(eventName, fn.bind.apply(fn, [_this3.vm].concat(toConsumableArray(params))));
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

      // 判断节点属性是否是t指令

    }, {
      key: "isDirective",
      value: function isDirective(text) {
        return text.includes("t-");
      }

      // 判断是否是t-index

    }, {
      key: "isTFocus",
      value: function isTFocus(text) {
        return text === 't-index';
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

  var blankFn = function blankFn(event, node, index, prevNode) {};
  var defaultFocusOptions = {
    circle: {
      horizontal: false,
      vertical: false
    },
    keysMap: {
      'up': {
        codes: [38, 104],
        handler: blankFn
      },
      'down': {
        codes: [40, 98],
        handler: blankFn
      },
      'left': {
        codes: [37, 100],
        handler: blankFn
      },
      'right': {
        codes: [39, 102],
        handler: blankFn
      },
      'enter': {
        codes: [13, 32],
        handler: blankFn
      },
      'space': {
        codes: [32],
        handler: blankFn
      },
      'home': {
        codes: [36],
        handler: blankFn
      },
      'menu': {
        codes: [18],
        handler: blankFn
      },
      'return': {
        codes: [27],
        handler: blankFn
      },
      'addVolume': {
        codes: [175],
        handler: blankFn
      },
      'subVolume': {
        codes: [174],
        handler: blankFn
      }
    },
    keysMapMergeCoverage: false
  };

  var Focuser = function () {
    function Focuser(vm, options) {
      classCallCheck(this, Focuser);

      this.tid = 0;
      this.init(vm, options);
      this.bindKeyEvent();
    }

    createClass(Focuser, [{
      key: 'init',
      value: function init(vm, options) {
        var _this = this;

        // 存放indexString索引的node节点
        this.focusElementMap = {};
        // 索引转化后的数组，例如[[0,1,2], [0,2]] 用于边界判断
        this.indexMap = [];
        // 存放原始focus相关参数
        this.focusOptions = Object.assign({}, defaultFocusOptions, options.focus);
        var currentRowIndex = void 0,
            currentColIndex = void 0;
        if (this.focusOptions.defaultFocusIndex) {
          var IndexArr = options.focus && options.focus.defaultFocusIndex.split('-');
          currentRowIndex = Number(IndexArr[0]);
          currentColIndex = Number(IndexArr[1]);
        }
        // 存放当前状态信息
        this.focusState = {
          currentIndexString: options.focus && options.focus.defaultFocusIndex || '',
          currentRowIndex: currentRowIndex,
          currentColIndex: currentColIndex
        };

        this.keysMap = this.focusOptions.keysMap;
        // 合并键盘绑定键值码
        if (options.focus && options.focus.keysMap) {
          if (this.focusOptions.keysMapMergeCoverage) {
            // options.focus.keysMap 覆盖默认keysMap
            this.keysMap = Object.assign({}, this.keysMap, options.focus.keysMap);
          } else {
            // options.focus.keysMap 合并 默认keysmap
            Object.keys(this.keysMap).forEach(function (key) {
              // debugger
              if (defaultFocusOptions.keysMap[key]) {
                _this.keysMap[key].codes = options.focus.keysMap[key].codes ? [].concat(toConsumableArray(new Set(defaultFocusOptions.keysMap[key].codes.concat(options.focus.keysMap[key].codes)))) : _this.keysMap[key].codes;
              } else {
                _this.keysMap[key].codes = options.focus.keysMap[key].codes;
              }
            });
          }
        }

        vm.focuser = this;
        this.vm = vm;
      }

      // 传入键值码并执行相应的操作

    }, {
      key: 'execCommand',
      value: function execCommand(event) {
        var _this2 = this;

        Object.keys(this.keysMap).forEach(function (key) {
          if (_this2.keysMap[key].codes.includes(event.keyCode)) {
            _this2.move(key, event);
          }
        });
      }

      // 绑定键盘事件

    }, {
      key: 'bindKeyEvent',
      value: function bindKeyEvent() {
        window.addEventListener('keydown', this.keyDownHandler.bind(this));
      }
    }, {
      key: 'keyDownHandler',
      value: function keyDownHandler(event) {
        this.execCommand(event);
      }

      // 把有t-focus指令的node节点储存起来

    }, {
      key: 'addFocusMap',
      value: function addFocusMap(key, node) {
        var _this3 = this;

        this.tid++;
        var keys = key.split(/,\s*/);
        keys.forEach(function (item) {
          if (item in _this3.focusElementMap) {
            return console.warn('t-focus should be unique in one TVVM page but t-focus=' + item + ' has already exist');
          }
          _this3.focusElementMap[item] = node;
        });
      }
      // 设置焦点dom

    }, {
      key: 'setFocus',
      value: function setFocus(index) {
        if (index in this.focusElementMap) {
          var arr = index.split('-');
          var currentRowIndex = Number(arr[0]);
          var currentColIndex = Number(arr[1]);
          this.focusElementMap[index].focus();
          this.focusState.currentIndexString = index;
          this.focusState.currentFocusElement = this.focusElementMap[index];
          this.focusState.currentRowIndex = currentRowIndex;
          this.focusState.currentColIndex = currentColIndex;
        } else {
          // console.warn(`can't find t-focus ${index} node`)
        }
      }
    }, {
      key: 'generateIndexMap',
      value: function generateIndexMap() {
        var _this4 = this;

        // 0-0, 0-1, 
        Object.keys(this.focusElementMap).forEach(function (key) {
          var keyArr = key.split('-');
          var rowIndex = keyArr[0];
          var colIndex = keyArr[1];
          if (_this4.indexMap[rowIndex] === undefined) {
            _this4.indexMap[rowIndex] = [colIndex];
          } else {
            _this4.indexMap[rowIndex].push(colIndex);
          }
        });
        this.indexMap = this.indexMap.map(function (item) {
          return item.sort(function (a, b) {
            return a - b;
          });
        });

        if (this.focusOptions.defaultFocusIndex !== undefined) {
          this.setFocus(this.focusOptions.defaultFocusIndex);
        } else {
          if (this.indexMap.length !== 0) {
            this.setFocus([0, this.indexMap[0][0]].join('-'));
          } else {
            window.removeEventListener('keydown', this.keyDownHandler);
          }
        }
      }
    }, {
      key: 'isBoundary',
      value: function isBoundary() {}

      // 焦点处于顶部边界判断

    }, {
      key: 'isTopBoundary',
      value: function isTopBoundary() {
        var rowIndex = this.focusState.currentRowIndex;
        var colIndex = this.focusState.currentColIndex;
        if (rowIndex === 0) {
          return true;
        }
        rowIndex--;
        var indexString = [rowIndex, colIndex].join('-');
        while (this.focusElementMap[indexString] && this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[indexString]) {
          rowIndex--;
          indexString = [rowIndex, colIndex].join('-');
        }
        rowIndex++;
        if (rowIndex <= 0) {
          return true;
        } else {
          return false;
        }
      }
    }, {
      key: 'isLeftBoundary',
      value: function isLeftBoundary() {
        var rowIndex = this.focusState.currentRowIndex;
        var colIndex = this.focusState.currentColIndex;
        if (colIndex === this.indexMap[rowIndex][0]) {
          return true;
        }
        colIndex--;
        var indexString = [rowIndex, colIndex].join('-');
        while (this.focusElementMap[indexString] && this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[indexString]) {
          colIndex--;
          indexString = [rowIndex, colIndex].join('-');
        }
        colIndex++;
        if (colIndex > this.indexMap[rowIndex][0]) {
          return false;
        } else {
          return true;
        }
      }
    }, {
      key: 'isRightBoundary',
      value: function isRightBoundary() {
        var rowIndex = this.focusState.currentRowIndex;
        var colIndex = this.focusState.currentColIndex;
        if (colIndex === this.indexMap[rowIndex][this.indexMap[rowIndex].length - 1]) {
          return true;
        }
        colIndex++;
        var indexString = [rowIndex, colIndex].join('-');
        while (this.focusElementMap[indexString] && this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[indexString]) {
          colIndex++;
          indexString = [rowIndex, colIndex].join('-');
        }
        colIndex--;
        if (colIndex < this.indexMap[rowIndex][this.indexMap[rowIndex].length - 1]) {
          return false;
        } else {
          return true;
        }
      }
    }, {
      key: 'isBottomBoundary',
      value: function isBottomBoundary() {
        var rowIndex = this.focusState.currentRowIndex;
        var colIndex = this.focusState.currentColIndex;
        if (rowIndex === this.indexMap.length - 1) {
          return true;
        }
        rowIndex++;
        var indexString = [rowIndex, colIndex].join('-');
        while (this.focusElementMap[indexString] && this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[indexString]) {
          rowIndex++;
          indexString = [rowIndex, colIndex].join('-');
        }
        rowIndex--;
        if (rowIndex >= this.indexMap.length - 1) {
          return true;
        } else {
          return false;
        }
      }
    }, {
      key: 'moveUp',
      value: function moveUp(event, node, index) {
        this.keysMap['up'].handler && this.keysMap['up'].handler(event, node, index);
        if (this.isTopBoundary()) {
          if (this.focusOptions.circle.vertical) {
            var rowIndex = this.indexMap.length - 1;
            var colIndex = this.focusState.currentColIndex;
            var indexString = [rowIndex, colIndex].join('-');
            this.setFocus(indexString);
          }
        } else {
          var _rowIndex = this.focusState.currentRowIndex - 1;
          var _colIndex = this.focusState.currentColIndex;
          var _indexString = [_rowIndex, _colIndex].join('-');
          while (this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[_indexString]) {
            _rowIndex--;
            _indexString = [_rowIndex, _colIndex].join('-');
          }
          _indexString = [_rowIndex, _colIndex].join('-');
          this.setFocus(_indexString);
        }
      }
    }, {
      key: 'moveDown',
      value: function moveDown(event, node, index) {
        this.keysMap['down'].handler && this.keysMap['down'].handler(event, node, index);
        if (this.isBottomBoundary()) {
          if (this.focusOptions.circle.vertical) {
            var rowIndex = 0;
            var colIndex = this.focusState.currentColIndex;
            var indexString = [rowIndex, colIndex].join('-');
            this.setFocus(indexString);
          }
        } else {
          var _rowIndex2 = this.focusState.currentRowIndex + 1;
          var _colIndex2 = this.focusState.currentColIndex;
          var _indexString2 = [_rowIndex2, _colIndex2].join('-');
          while (this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[_indexString2]) {
            _rowIndex2++;
            _indexString2 = [_rowIndex2, _colIndex2].join('-');
          }
          _indexString2 = [_rowIndex2, _colIndex2].join('-');
          this.setFocus(_indexString2);
        }
      }
    }, {
      key: 'moveLeft',
      value: function moveLeft(event, node, index) {
        this.keysMap['left'].handler && this.keysMap['left'].handler(event, node, index);
        if (this.isLeftBoundary()) {
          if (this.focusOptions.circle.horizontal) {
            var rowIndex = this.focusState.currentRowIndex;
            var colIndex = this.indexMap[rowIndex][this.indexMap[rowIndex].length - 1];
            var indexString = [rowIndex, colIndex].join('-');
            this.setFocus(indexString);
          }
        } else {
          var _rowIndex3 = this.focusState.currentRowIndex;
          var _colIndex3 = this.focusState.currentColIndex - 1;
          var _indexString3 = [_rowIndex3, _colIndex3].join('-');
          // 如果nextindex和previndex引用的是同一个element，则自减
          while (this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[_indexString3]) {
            _colIndex3--;
            _indexString3 = [_rowIndex3, _colIndex3].join('-');
          }
          _indexString3 = [_rowIndex3, _colIndex3].join('-');
          this.setFocus(_indexString3);
        }
      }
    }, {
      key: 'moveRight',
      value: function moveRight(event, node, index) {
        this.keysMap['right'].handler && this.keysMap['right'].handler(event, node, index);
        if (this.isRightBoundary()) {
          if (this.focusOptions.circle.horizontal) {
            var rowIndex = this.focusState.currentRowIndex;
            var colIndex = this.indexMap[rowIndex][0];
            var indexString = [rowIndex, colIndex].join('-');
            this.setFocus(indexString);
          }
        } else {
          var _rowIndex4 = this.focusState.currentRowIndex;
          var _colIndex4 = this.focusState.currentColIndex + 1;
          var _indexString4 = [_rowIndex4, _colIndex4].join('-');
          while (this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[_indexString4]) {
            _colIndex4++;
            _indexString4 = [_rowIndex4, _colIndex4].join('-');
          }
          _indexString4 = [_rowIndex4, _colIndex4].join('-');
          this.setFocus(_indexString4);
        }
      }

      // 键盘上下左右触发函数 参数 按键方向， 原焦点索引字符串，焦点可循环标志位 

    }, {
      key: 'move',
      value: function move(direction, event) {
        var directionMap = {
          'up': {
            handler: this.moveUp
          },
          'down': {
            handler: this.moveDown
          },
          'left': {
            handler: this.moveLeft
          },
          'right': {
            handler: this.moveRight
          }
        };
        var runner = Object.assign({}, this.keysMap, directionMap);
        runner[direction].handler.call(this, event, this.focusState.currentFocusElement, this.focusState.currentIndexString);
      }
    }]);
    return Focuser;
  }();

  var Lifecycle = function () {
    function Lifecycle(options, vm) {
      classCallCheck(this, Lifecycle);

      this.hooks = {};
      this.init(options, vm);
      vm.lifecycle = this;
      vm.callHook = this.callHook.bind(this);
    }

    createClass(Lifecycle, [{
      key: 'init',
      value: function init(options, vm) {
        var beforeCreate = options.beforeCreate,
            created = options.created,
            beforeMount = options.beforeMount,
            mounted = options.mounted,
            beforeUpdate = options.beforeUpdate,
            updated = options.updated,
            beforeDestory = options.beforeDestory,
            destoried = options.destoried;

        var hooks = { beforeCreate: beforeCreate, created: created, beforeMount: beforeMount, mounted: mounted, beforeUpdate: beforeUpdate, updated: updated, beforeDestory: beforeDestory, destoried: destoried };
        Object.keys(hooks).forEach(function (key, index) {
          if (hooks[key] === undefined) {
            hooks[key] = emptyFn;
          }
          if (hooks[key] instanceof Function) {
            hooks[key] = hooks[key].bind(vm);
          } else {
            console.warn('lifecycle hooks must be a function');
            hooks[key] = emptyFn;
          }
        });
        this.hooks = hooks;
      }
    }, {
      key: 'callHook',
      value: function callHook(fnName) {
        // fnName in this.hooks && this.hooks[fnName]()
        this.hooks[fnName]();
      }
    }]);
    return Lifecycle;
  }();

  function emptyFn() {
    return;
  }

  var TVVM = function () {
    function TVVM(options) {
      classCallCheck(this, TVVM);

      // 初始化参数， 把el， data等进行赋值与绑定
      // data如果是函数就取返回值， 如果不是则直接赋值
      // 初始化焦点管理对象
      new Focuser(this, options);
      // 初始化生命周期对象
      new Lifecycle(options.hooks || {}, this);
      // beforeCreate
      this.callHook('beforeCreate');

      this.$data = typeof options.data === "function" ? options.data() : options.data;
      this.methods = options.methods;
      // 数据代理, 把data对象属性代理到vm实例上
      this.proxy(this.$data, this);
      this.proxy(options.methods, this);

      // 把$el真实的dom节点编译成vdom, 并解析相关指令
      if (options.el) {
        // 数据劫持,
        new Observer(this.$data, this);
        // created
        this.callHook('created');
        // beforeMounte
        this.callHook('beforeMount');
        new Compiler(options.el, this);
        this.focuser.generateIndexMap();
        // mounted 此时可以访问 this.$el
        this.callHook('mounted');
      }
    }
    // 数据代理, 访问/设置 this.a 相当于访问设置 this.data.a


    createClass(TVVM, [{
      key: 'proxy',
      value: function proxy(data, proxyTarget) {
        Object.keys(data).forEach(function (key) {
          Object.defineProperty(proxyTarget, key, {
            enumerable: true,
            configurable: true,
            get: function get$$1() {
              return data[key];
            },
            set: function set$$1(newValue) {
              // if (proxyTarget[key] !== undefined) {
              //   console.warn(`key ${key} has already in Target`);
              // }
              data[key] = newValue;
            }
          });
        });
      }
    }]);
    return TVVM;
  }();

  return TVVM;

})));
