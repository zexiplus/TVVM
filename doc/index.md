# API





#### new TVVM(options)

#### options



**focus**

```js
new TVVM({
    focus: {
        defaultFocusIndex: '0-0', // 默认进入页面焦点元素
        // 键值码
        keys: {
          'up': [38, 104],
          'down': [40, 98],
          'left': [37, 100],
          'right': [39, 102],
          'enter': [13, 32],
          'return': [27]
        },
        keysMergeOptions: {
          coverage: true // 键值混合选项 true覆盖， false叠加
        },
        circle: {
            horizontal: true, // 控制焦点移动到边界处水平方向是否可以循环
            vertical: false, 
        }
    }
})
```

