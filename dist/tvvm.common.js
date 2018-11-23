/*!
 * tvvm v1.0.0
 * 轻量级TV端WEB应用开发框架
 * 
 * Copyright (c) 2018 float
 * https://github.com/zexiplus/TVM#readme
 * 
 * Licensed under the MIT license.
 */

'use strict';

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
    function Observer(data) {
        classCallCheck(this, Observer);

        this.observer(data);
    }

    createClass(Observer, [{
        key: 'observer',
        value: function observer(data) {
            var _this2 = this;

            // 递归的终止条件： 当观察数据不存在或不再是对象是停止
            if (!data || (typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') {
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
        key: 'setReactive',
        value: function setReactive(obj, key) {
            var value = obj[key];
            var _this = this;
            var dep = new Dep();
            Object.defineProperty(obj, key, {
                enumerable: true,
                configurable: true,
                get: function get$$1() {
                    // 进行订阅, 在编译阶段， compiler会给template中的每个指令增加一个watcher， 在watcher取值时会设置自身为Dep.target
                    Dep.target && dep.addSubs(Dep.target);

                    return value;
                },
                set: function set$$1(newValue) {
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
        key: 'getValAndSetTarget',
        value: function getValAndSetTarget() {
            Dep.target = this;
            var value = this.getValue(this.expr);
            Dep.target = null;
            return value;
        }
    }, {
        key: 'getValue',
        value: function getValue(expr) {
            var arr = expr.split('.');
            return arr.reduce(function (prev, next) {
                return prev[next];
            }, this.vm.$data);
        }
    }, {
        key: 'update',
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
            console.error('can not find element named ' + el);
        }
    }

    // 编译节点，如果子节点是node节点， 递归调用自身和compileNode， 如果不是 则调用 compileText


    createClass(Compiler, [{
        key: 'compile',
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
        key: 'compileText',
        value: function compileText(node) {
            var _this2 = this;

            // 测试文本节点含有 {{val}} 的 regexp
            var reg = /\{\{([^}]+)\}\}/g;
            // 拿到文本节点的文本值
            var text = node.textContent;
            if (reg.test(text)) {
                // 去掉{{}} 保留 value
                var attrName = text.replace(reg, function () {
                    // 对每个{{}}之类的表达式增加增加一个watcher,参数为vm实例, expr表达式, 更新回调函数
                    new Watcher(_this2.vm, arguments.length <= 1 ? undefined : arguments[1], function (value) {
                        // console.log('update???')
                        compileUtil.updateText(value, node, _this2.vm);
                    });
                    return arguments.length <= 1 ? undefined : arguments[1];
                });
                // 例如取出{{message}} 中的 message, 交给compileUtil.updateText 方法去查找vm.data的值并替换到节点
                var textValue = this.splitData(attrName, this.vm.$data);
                compileUtil.updateText(textValue, node, this.vm);
            }
        }

        // 剥离属性值

    }, {
        key: 'splitData',
        value: function splitData(attr, data) {
            // 传入 attr 形如 'group.member.name', 找到$data上对应的属性值并返回
            var arr = attr && attr.split('.');
            var ret = arr.reduce(function (prev, next) {
                return prev[next];
            }, data);
            return ret;
        }

        // 编译node节点

    }, {
        key: 'compileNode',
        value: function compileNode(node) {
            var _this3 = this;

            var attrs = node.getAttributeNames();
            // 把已t-指令存到一个数组中
            attrs = attrs.filter(this.isDirective);
            attrs.forEach(function (item) {
                var expr = node.getAttribute(item);
                var value = _this3.splitData(expr, _this3.vm.$data);
                if (compileUtil[item]) {
                    compileUtil[item](value, node, _this3.vm, expr);
                } else {
                    console.warn('can\'t find directive ' + item);
                }
            });
        }

        // 判断节点属性是否是指令

    }, {
        key: 'isDirective',
        value: function isDirective(text) {
            return text.includes('t-');
        }

        // 根据传入的值， 如果是dom节点直接返回， 如果是选择器， 则返回相应的dom节点

    }, {
        key: 'getDOM',
        value: function getDOM(el) {
            if (this.isElement(el)) {
                return el;
            } else {
                return document.querySelector(el) || null;
            }
        }

        // 判断dom类型， 1 为元素， 2 是属性， 3是文本， 9是文档, 11是文档片段

    }, {
        key: 'isElement',
        value: function isElement(el) {
            return el.nodeType === 1;
        }
    }, {
        key: 'isText',
        value: function isText(el) {
            return el.nodeType === 3;
        }

        // 把el dom节点转换为fragment保存在内存中并返回

    }, {
        key: 'toFragment',
        value: function toFragment(el) {
            var fragment = document.createDocumentFragment();
            var firstChild = void 0;
            // 循环把el的首个子元素推入fragment中
            while (firstChild = el.firstChild) {
                // 把原始 el dom节点的所有子元素增加到文档片段中并移除原 el dom节点的所有子元素
                fragment.appendChild(firstChild);
                // debugger
                // console.log('el dom is', el)
                // console.log('fragment is', fragment)
            }
            return fragment;
        }
    }]);
    return Compiler;
}();

// 编译功能函数的集合单例


var compileUtil = {
    updateText: function updateText(text, node, vm, expr) {
        // console.log('compileUtil.updateText text is', text)
        node && (node.textContent = text);
    },

    //  在绑定有t-model节点的input上绑定事件, expr为t-model的表达式例如 'message.name'
    't-model': function tModel(value, node, vm, expr) {
        var _this4 = this;

        node && (node.value = value);
        node.addEventListener('input', function (e) {
            _this4.setVal(vm.$data, expr, e.target.value);
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
    }
};

var TVVM = function () {
    function TVVM(options) {
        classCallCheck(this, TVVM);

        // 初始化参数， 把el， data等进行赋值与绑定
        this.$el = options.el;
        // data如果是函数就取返回值， 如果不是则直接赋值
        this.$data = typeof options.data === 'function' ? options.data() : options.data;
        // 数据代理, 把data对象属性代理到vm实例上
        this.proxy(this.$data);
        // debugger
        // 把$el真实的dom节点编译成vdom, 并解析相关指令
        if (this.$el) {
            // 数据劫持, 
            new Observer(this.$data);
            new Compiler(this.$el, this);
        }
    }
    // 数据代理, 访问/设置 this.a 相当于访问设置 this.data.a


    createClass(TVVM, [{
        key: 'proxy',
        value: function proxy(data) {
            var _this = this;

            Object.keys(data).forEach(function (key) {
                Object.defineProperty(_this, key, {
                    enumerable: true,
                    configurable: true,
                    get: function get$$1() {
                        return data[key];
                    },
                    set: function set$$1(newValue) {
                        data[key] = newValue;
                    }
                });
            });
        }
    }]);
    return TVVM;
}();

module.exports = TVVM;