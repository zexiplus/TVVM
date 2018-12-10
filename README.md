# TVVM

![build](https://img.shields.io/badge/build-passing-green.svg) ![no-dependency](https://img.shields.io/badge/no-dependency-yellow.svg)

轻量级TV端WEB应用开发框架

TVVM是一个专门为TV WEB APP开发的MVVM模式框架， 它帮助开发者快速开发应用而无需关心焦点控制， 键盘绑定， 数据绑定等通用逻辑。它没有依赖， 体型小巧（10kb）,  官方文档请参考 [offcial web](https://zexiplus.github.io/website/tvvm/)



## 使用

**通过npm下载**

你的系统上需要安装有nodejs

```shell
$ npm install -S tvvm
```

```js
import * as TVVM from 'tvvm'

var tv = new TVVM({
    ...options
})
```

**手动下载**

你也可以通过手动下载的方式， 然后通过`<script>`标签进行引用， [下载链接](https://unpkg.com/tvvm/dist/tvvm.min.js)

```html
<script src="https://unpkg.com/tvvm/dist/tvvm.min.js"></script>
<script>
    var tv = new TVVM({
        ...options
    })
</script>
```



## API

### new TVVM(options)

new TVVM 返回一个tv实例, 作为该页面的全局单例入口

```js
var tv = new TVVM({
	el: '#tv',
    data () {
        return {
			dialogVisible: true
        }
    },
    focus: {

    },
    methods: {
        testFn: function (a, b) {

        }
    }
})
```



### 选项

new TVVM接收一个选项对象作为唯一参数

#### el

new TVVM() 实例挂载的dom元素, 可以是一个元素查找符或者dom节点对象

```js
new TVVM({
    el: '#tv',
})
```

#### data

tm单例的数据对象, 可以是一个函数或者对象, 当该参数为函数时, 取值为该函数的返回值

```js
new TVVM({
    data: function () {
        return {
            title: 'tvvm demo page',
            index: '0'
        }
    }
})
```

#### methods

该参数是一个对象, 存放所有的方法函数

```js
methods: {
    methods1: function () {
        console.log('methods1')
    }
}
```

#### focus

focus选项用于设置焦点移动， 键值绑定， 默认焦点等逻辑

```js
	new TVVM({
        focus: {
            defaultFocusIndex: '1-0',
            activeClass: 'high-light',
            keysMap: {
              'up': {
                codes: [38, 103],
                handler: function (event, node, index, prevNode) {

                }
              },
              'g': {
                codes: [71],
                handler: function (event, node, index, prevNode) {
                  console.log('you press g')
                }
              },

            },
            keysMapMergeCoverage: false,
            specialKeys: {
              '11': function (event, node, index, prevNode) {

              }
            },
            circle: {
              horizontal: true,
              vertical: true,
            },
          }
    })
```

- **defaultFocusIndex (可选)**

  进入应用默认聚焦的元素的索引, 该参数为空时， 默认聚焦到页面首个焦点元素上

  ```js
  focus: {
      defaultIndex: '0-1'
  }
  ```

- **activeClass**

  焦点元素的样式名

  ```js
  focus: {
      activeClass: 'high-light'
  }
  ```

- **circle (可选)**

  - **horizontal (可选)** 焦点元素在水平方向是否可以循环移动, 默认false
  - **vertival (可选)** 焦点元素在水平方向上是否可以循环移动, 默认false

  ```js
  focus: {
      circle: {
          horizontal: true,
          vertical: true
      }
  }
  ```

- **keysMap （可选）**

  遥控器键盘键值码映射表,  该参数为空时使用默认键值码映射表

  \- 'alias' 对应键值的别名

   \- codes 对应键值数组

  - handler 对应按键值绑定的事件处理函数 参数分别是event(事件), node(当前焦点dom节点索引), index (当前焦点dom节点的t-index值), prevNode(上一个焦点dom节点索引)

  - up 方向上键
  - down 方向下键
  - left 方向左键
  - right 方向右键
  - enter 确定键
  - space 空格键
  - home 主页键
  - menu 菜单键
  - return 返回键
  - addVolume 增加音量键
  - subVolume 减少音量键

  ```js
  focus: {
      keysMap: {
      'up': {
        codes: [38, 104],
        handler: function (event, node, index, prevNode) {
  
        }
      },
      'down': {
        codes: [40, 98],
        handler
      },
      'left': {
        codes: [37, 100],
        handler
      },
      'right': {
        codes: [39, 102],
        handler
      },
      'enter': {
        codes: [13, 32],
        handler
      }
    },
  }
  ```

- **keysMapMergeCoverage (可选)**

  键值映射表合并策略true为覆盖, false为合并

  ```js
  focus: {
      keysMapMergeCoverage: false,
  }
  ```

#### hooks

生命周期钩子函数集合

- beforeCreate

  在实例化之前调用， 此时不可访问data

- created

  在实例化后调用，此时data已经设置响应式， 并可访问

- beforeMount

  在实例被挂在到真实dom前调用

- mounted

  在实例被挂在到dom上时调用

- beforeUpdate

  响应式data变动从而导致视图更新前调用

- updated

  响应式data变动从而导致视图更新后调用

- beforeDestory

  在实例被销毁前调用

```js
hooks: {
    beforeCreate: function () {
        // this 指向tv实例
    },
    mounted: function () {
    	        
    },
    ...
}
```



### 指令

TVVM内置指令系统, 包含了一些常用的指令, 用于处理简单的模版逻辑.TVVM内置指令通常以 `t-`开头作为标识

```html
<html>
    <head></head>
    <body>
        <div id="tv">
            <div t-if="data.dialogVisible" class="dialog">{{data.dialog.title}}</div>
            <nav>
                <a t-for="item in data.linkList">{{item.label}}</a>
            </nav>
            <form>
            	<input t-model="data.dialog.title" />
            </form>
            <button @click="methods.testFn"></button>
        </div>
    </body>
</html>
```

#### t-index

用于指定焦点区块元素的二维空间索引，以便用户点击遥控器方向按键时移动焦点，`t-index="x-y"`, 例如`t-index="0-0"`代表第一排第一列的元素

```html
<div class="tv">
    <div t-index="0-0">0-0</div> <!-- 第1排第1个元素 -->
    <div t-index="0-1">0-1</div>
    <div t-index="0-2">0-2</div>
    <!-- 第2排第1个元素， 纵向占据2个空间 -->
    <div t-index="1-0, 2-0">1-0， 2-0</div> 
    <div>
        <!-- 第2排第2个元素， 横向占据3个空间 -->
        <div t-index="1-1, 1-2, 1-3">1-1， 1-2， 1-3</div> 
        <div>
            <div t-index="2-1">2-1</div> <!-- 第3排第2个元素 -->
            <div t-index="2-2">2-2</div> <!-- 第3排第3个元素 -->
            <div t-index="2-3">2-3</div> <!-- 第3排第4个元素 -->
        </div>
    </div>
</div>
```

![效果如图](./website/imgs/index.bmp)

#### t-if

用于显示/隐藏dom节点, 该指令接收一个在data参数上存在的布尔值

```html
<div t-if="data.dialogVisible"></div>
```

#### t-for

用于循环指定的dom节点, 该指令接收一个表达式,如下item代表数组的每一项, `data.array`是data上定义的一个数组

```js
data: function () {
    return {
        array: [
            {label: 'first', value: 0},
            {label: 'second', value: 1},
            {label: 'third', value: 2}
        ]
    }
}
```

```html
<ul>
    <li t-for="item in data.array">{{item.label}}</li>
</ul>
<!-- 渲染为 -->
<ul>
    <li>first</li>
    <li>second</li>
    <li>third</li>
</ul>
```

#### {{value}}

数据插值, 双花括号内接收一个data的属性.用于页面内数据插值

```js
data: function () {
    return { name: 'float' }
}
```

```html
<span>{{data.name}}</span>
<!-- 渲染为 -->
<span>float</span>
```

#### t-class

样式表绑定， t-class接收一个data上已经定义的样式名数组或对象

```js
data: function () {
    return {
        classList1: ['container', 'container-row'],
        classList2: {
            'container': true,
            'container-row': false,
            'container-col': true
        }
    }
}
```

```html
<div t-class="data.classList2"></div>
<!-- 渲染为 -->
<div class="container container-col"></div>
```

#### t-bind

属性绑定,`t-bind:name="data.name"` 简写形式为 `:name="data.name"`

```js
data: function () {
    return {
        id: 'billboard',
        height: '365',
        classname: 'spin'
    }
}
```

```html
<div :id="data.id" :height="data.height" :class="data.classname"></div>
<!-- 渲染为 -->
<div t-bind:id="data.id" t-bind:height="data.height" t-bind:class="data.classname"></div>
```

#### t-value

用于input输入数据与data上数据的绑定， input的value会实时同步至t-model绑定的数据

```js
data: function () {
    return {
        inputValue: ''
    }
}
```

```html
<input t-value="data.inputValue" />
```



#### event bind

事件绑定

```js
methods: {
    clickHandler: function () {
        // do something
    },
    clickHandler2: function (param1, param2) {
    	     
    }
}
```

```html
<div @click="methods.clickHandler"></div>
<div @click="methods.clickHandler2(data.inputValue)"
```






## 协议

TVVM采用MIT协议， 详情查看[LICENSE](./LICENSE)



## 链接

* [官方文档](https://github.com/zexiplus/TVVM)

