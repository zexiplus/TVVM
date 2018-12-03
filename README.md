# TVVM

![build](https://img.shields.io/badge/build-passing-green.svg)![no-dependency](https://img.shields.io/badge/no-dependency-yellow.svg)
轻量级TV端WEB应用开发框架

TVVM是一个专门为TV WEB APP开发的MVVM模式框架， 它帮助开发者快速开发应用而无需关心焦点控制， 键盘绑定， 数据绑定等通用逻辑。它没有依赖， 体型小巧（10kb）,  官方文档请参考 [offcial web]()



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

你也可以通过手动下载的方式， 然后通过`<script>`标签进行引用， [下载链接]()

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



### 指令

TVVM内置指令系统, 包含了一些常用的指令, 用于处理简单的模版逻辑.TVVM内置指令通常以 `t-`开头作为标识

```html
<html>
    <head></head>
    <body>
        <div id="tv">
            <div t-if="dialogVisible" class="dialog">{{dialog.title}}</div>
            <nav>
                <a t-for="item in linkList">{{item.label}}</a>
            </nav>
            <form>
            	<input t-model="dialog.title" />
            </form>
        </div>
    </body>
</html>
```

#### t-if

用于显示/隐藏dom节点, 该指令接收一个在data参数上存在的布尔值

```html
<div t-if="dialogVisible"></div>
```

#### t-for

用于循环指定的dom节点, 该指令接收一个表达式,如下item代表数组的每一项, array是data上定义的一个数组

```html
<ul>
    <li t-for="item in array">{{item.label}}</li>
</ul>
```

#### {{value}}

数据插值, 双花括号内接收一个data的属性.用于页面内数据插值

```js
data: { name: 'float' }
```

```html
<span>{{name}}</span>
<!-- 渲染为 -->
<span>float</span>
```





### 选项

#### el

new TVVM() 实例挂载的dom元素, 可以是一个元素查找符或者dom节点对象

```js
el: '#tv'
```



#### data

tm单例的数据对象, 可以是一个函数或者对象, 当该参数为函数时, 取值为该函数的返回值

```js
data: function () {
    return {
        title: 'tvvm demo page',
        index: '0'
    }
}
```



#### focus

* **defaultFocusIndex (可选)**

  进入应用默认聚焦的元素的索引, 该参数为空时， 默认聚焦到页面首个焦点元素上

  ```js
  focus: {
      defaultIndex: '0-1'
  }
  ```

* **circle (可选)**

  * **horizontal (可选)** 焦点元素在水平方向是否可以循环移动, 默认false
  * **vertival (可选)** 焦点元素在水平方向上是否可以循环移动, 默认false

  ```js
  focus: {
      circle: {
          horizontal: true,
          vertical: true
      }
  }
  ```

* **keysMap （可选）**

  遥控器键盘键值码映射表,  该参数为空时使用默认键值码映射表

  * up 方向上键
  * down 方向下键
  * left 方向左键
  * right 方向右键
  * enter 确定键
  * space 空格键
  * home 主页键
  * menu 菜单键
  * return 返回键
  * addVolume 增加音量键
  * subVolume 减少音量键

  ```js
  focus: {
      keysMap: {
          'up':[38],
          'down': [40],
          'left': [37],
          'right': [39],
          'enter':[13],
          'space': [32],
          'home': [36],
          'menu': [18],
          'return':[27],
          'addVolume': [175],
          'subVolume': [174]
      }
  }
  ```

* **keysMergeOptions (可选)**

  * **coverage** 键值映射表合并策略true为覆盖, false为合并

    ```js
    keysMergeOptions: {
        coverage: false
    }
    ```

* **specialKeys**

  特殊按键码和对应按键的回调函数集合

  ```js
  specialKeys: {
      '11': function (event, node, index, prevNode) {
  
      }
  },
  ```



#### methods

该参数是一个对象, 存放所有的方法函数

```js
meth
```






## 协议

TVVM采用MIT协议， 详情查看[LICENSE](./LICENSE)



## 链接

* [官方文档]()
* 

