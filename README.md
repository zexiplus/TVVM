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

new TVVM({
    el: '#app',
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

**手动下载**

你也可以通过手动下载的方式， 然后通过`<script>`标签进行引用， [下载链接]()

```html
<script src="https://unpkg.com/tvvm/dist/tvvm.min.js"></script>
<script>
    new TVVM({
        el: '#app',
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
</script>
```



## 选项



### focus

* **defaultFocusIndex (可选)**

  进入应用默认聚焦的元素的索引, 该参数为空时， 默认聚焦到页面首个焦点元素上

  ```js
  defaultIndex: '0-1'
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
  ```

* **keysMergeOptions**

  * **coverage**




## 协议

TVVM采用MIT协议， 详情查看[LICENSE](./LICENSE)



## 链接

* [官方文档]()
* 

