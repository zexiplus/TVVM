const blankFn = function (event, node, index, prevNode) {
  
}
const defaultFocusOptions = {
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
    },
  },
  keysMapMergeCoverage: false,
}

class Focuser {
  constructor(vm, options) {
    this.tid = 0
    this.init(vm, options)
    this.bindKeyEvent()
  }

  init(vm, options) {
    // 存放indexString索引的node节点
    this.focusElementMap = {}
    // 索引转化后的数组，例如[[0,1,2], [0,2]] 用于边界判断
    this.indexMap = []
    // 存放原始focus相关参数
    this.focusOptions = Object.assign({}, defaultFocusOptions, options.focus)
    let currentRowIndex, currentColIndex
    if (this.focusOptions.defaultFocusIndex) {
      let IndexArr = options.focus && options.focus.defaultFocusIndex.split('-')
      currentRowIndex = Number(IndexArr[0])
      currentColIndex = Number(IndexArr[1])
    }
    // 存放当前状态信息
    this.focusState = {
      currentIndexString: options.focus && options.focus.defaultFocusIndex || '',
      currentRowIndex,
      currentColIndex
    }

    this.keysMap = this.focusOptions.keysMap
    // 合并键盘绑定键值码
    if (options.focus && options.focus.keysMap) {
      if (this.focusOptions.keysMapMergeCoverage) {
        // options.focus.keysMap 覆盖默认keysMap
        this.keysMap = Object.assign({}, this.keysMap, options.focus.keysMap)
      } else {
        // options.focus.keysMap 合并 默认keysmap
        Object.keys(this.keysMap).forEach(key => {
          // debugger
          if (defaultFocusOptions.keysMap[key]) {
            this.keysMap[key].codes = options.focus.keysMap[key].codes ? [...new Set(defaultFocusOptions.keysMap[key].codes.concat(options.focus.keysMap[key].codes))] : this.keysMap[key].codes
          } else {
            this.keysMap[key].codes = options.focus.keysMap[key].codes
          }
        })
      }
    }
   
    vm.focuser = this
    this.vm = vm
  }

  // 传入键值码并执行相应的操作
  execCommand(event) {
    Object.keys(this.keysMap).forEach(key => {
      if (this.keysMap[key].codes.includes(event.keyCode)) {
        this.move(key, event)
      }
    })
  }

  // 绑定键盘事件
  bindKeyEvent() {
    window.addEventListener('keydown', this.keyDownHandler.bind(this))
  }

  keyDownHandler(event) {
    this.execCommand(event)
  }
  
  // 把有t-focus指令的node节点储存起来
  addFocusMap(key, node) {
    this.tid ++
    let keys = key.split(/,\s*/)
    keys.forEach(item => {
      if (item in this.focusElementMap) {
        return console.warn(`t-focus should be unique in one TVVM page but t-focus=${item} has already exist`)
      }
      this.focusElementMap[item] = node
    })
    
  }
  // 设置焦点dom
  setFocus(index) {
    if (index in this.focusElementMap) {
      let arr = index.split('-')
      let currentRowIndex = Number(arr[0])
      let currentColIndex = Number(arr[1])
      this.focusElementMap[index].focus()
      this.focusState.currentIndexString = index
      this.focusState.currentFocusElement = this.focusElementMap[index]
      this.focusState.currentRowIndex = currentRowIndex
      this.focusState.currentColIndex = currentColIndex
    } else {
      // console.warn(`can't find t-focus ${index} node`)
    }
  }

  generateIndexMap() {
    // 0-0, 0-1, 
    Object.keys(this.focusElementMap).forEach(key => {
      let keyArr = key.split('-')
      let rowIndex = keyArr[0]
      let colIndex = keyArr[1]
      if (this.indexMap[rowIndex] === undefined) {
        this.indexMap[rowIndex] = [colIndex]
      } else {
        this.indexMap[rowIndex].push(colIndex)
      }
    })
    this.indexMap = this.indexMap.map(item => item.sort((a, b) => a - b))
    
    if (this.focusOptions.defaultFocusIndex !== undefined) {
      this.setFocus(this.focusOptions.defaultFocusIndex)
    } else {
      if (this.indexMap.length !== 0) {
        this.setFocus([0, this.indexMap[0][0]].join('-'))
      } else {
        window.removeEventListener('keydown', this.keyDownHandler)
      }
    }
  }

  isBoundary() {

  }

  // 焦点处于顶部边界判断
  isTopBoundary() {
    let rowIndex = this.focusState.currentRowIndex
    let colIndex = this.focusState.currentColIndex
    if (rowIndex === 0) {
      return true
    }
    rowIndex --
    let indexString = [rowIndex, colIndex].join('-')
    while (this.focusElementMap[indexString] && this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[indexString]) {
      rowIndex --
      indexString = [rowIndex, colIndex].join('-')
    }
    rowIndex ++
    if (rowIndex <= 0) {
      return true
    } else {
      return false
    }
  }

  isLeftBoundary() {
    let rowIndex = this.focusState.currentRowIndex
    let colIndex = this.focusState.currentColIndex
    if (colIndex === this.indexMap[rowIndex][0]) {
      return true
    }
    colIndex --
    let indexString = [rowIndex, colIndex].join('-')
    while (this.focusElementMap[indexString] && this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[indexString]) {
      colIndex --
      indexString = [rowIndex, colIndex].join('-')
    }
    colIndex ++
    if (colIndex > this.indexMap[rowIndex][0]) {
      return false
    } else {
      return true
    }
  }

  isRightBoundary() {
    let rowIndex = this.focusState.currentRowIndex
    let colIndex = this.focusState.currentColIndex
    if (colIndex === this.indexMap[rowIndex][this.indexMap[rowIndex].length - 1]) {
      return true
    }
    colIndex ++
    let indexString = [rowIndex, colIndex].join('-')
    while (this.focusElementMap[indexString] && this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[indexString]) {
      colIndex ++
      indexString = [rowIndex, colIndex].join('-')
    }
    colIndex --
    if (colIndex < this.indexMap[rowIndex][this.indexMap[rowIndex].length - 1]) {
      return false
    } else {
      return true
    }
  }

  isBottomBoundary() {
    let rowIndex = this.focusState.currentRowIndex
    let colIndex = this.focusState.currentColIndex
    if (rowIndex === this.indexMap.length - 1) {
      return true
    }
    rowIndex ++
    let indexString = [rowIndex, colIndex].join('-')
    while (this.focusElementMap[indexString] && this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[indexString]) {
      rowIndex ++
      indexString = [rowIndex, colIndex].join('-')
    }
    rowIndex --
    if (rowIndex >= this.indexMap.length - 1) {
      return true
    } else {
      return false
    }
  }

  moveUp(event, node, index) {
    this.keysMap['up'].handler && this.keysMap['up'].handler(event, node, index)
    if (this.isTopBoundary()) {
      if (this.focusOptions.circle.vertical) {
        let rowIndex = this.indexMap.length - 1
        let colIndex = this.focusState.currentColIndex
        let indexString = [rowIndex, colIndex].join('-')
        this.setFocus(indexString)
      }
    } else {
      let rowIndex = this.focusState.currentRowIndex - 1
      let colIndex = this.focusState.currentColIndex
      let indexString = [rowIndex, colIndex].join('-')
      while (this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[indexString]) {
        rowIndex--
        indexString = [rowIndex, colIndex].join('-')
      }
      indexString = [rowIndex, colIndex].join('-')
      this.setFocus(indexString)
    }
  }

  moveDown(event, node, index) {
    this.keysMap['down'].handler && this.keysMap['down'].handler(event, node, index)
    if (this.isBottomBoundary()) {
      if (this.focusOptions.circle.vertical) {
        let rowIndex = 0
        let colIndex = this.focusState.currentColIndex
        let indexString = [rowIndex, colIndex].join('-')
        this.setFocus(indexString)
      }
    } else {
      let rowIndex = this.focusState.currentRowIndex + 1
      let colIndex = this.focusState.currentColIndex
      let indexString = [rowIndex, colIndex].join('-')
      while (this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[indexString]) {
        rowIndex++
        indexString = [rowIndex, colIndex].join('-')
      }
      indexString = [rowIndex, colIndex].join('-')
      this.setFocus(indexString)
    }
  }

  moveLeft(event, node, index) {
    this.keysMap['left'].handler && this.keysMap['left'].handler(event, node, index)
    if (this.isLeftBoundary()) {
      if (this.focusOptions.circle.horizontal) {
        let rowIndex = this.focusState.currentRowIndex
        let colIndex = this.indexMap[rowIndex][this.indexMap[rowIndex].length - 1]
        let indexString = [rowIndex, colIndex].join('-')
        this.setFocus(indexString)
      }
    } else {
      let rowIndex = this.focusState.currentRowIndex
      let colIndex = this.focusState.currentColIndex - 1
      let indexString = [rowIndex, colIndex].join('-')
      // 如果nextindex和previndex引用的是同一个element，则自减
      while (this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[indexString]) {
        colIndex--
        indexString = [rowIndex, colIndex].join('-')
      }
      indexString = [rowIndex, colIndex].join('-')
      this.setFocus(indexString)
    }
  }

  moveRight(event, node, index) {
    this.keysMap['right'].handler && this.keysMap['right'].handler(event, node, index)
    if (this.isRightBoundary()) {
      if (this.focusOptions.circle.horizontal) {
        let rowIndex = this.focusState.currentRowIndex
        let colIndex = this.indexMap[rowIndex][0]
        let indexString = [rowIndex, colIndex].join('-')
        this.setFocus(indexString)
      }
    } else {
      let rowIndex = this.focusState.currentRowIndex
      let colIndex = this.focusState.currentColIndex + 1
      let indexString = [rowIndex, colIndex].join('-')
      while (this.focusElementMap[this.focusState.currentIndexString] === this.focusElementMap[indexString]) {
        colIndex++
        indexString = [rowIndex, colIndex].join('-')
      }
      indexString = [rowIndex, colIndex].join('-')
      this.setFocus(indexString)
    }
  }

  // 键盘上下左右触发函数 参数 按键方向， 原焦点索引字符串，焦点可循环标志位 
  move(direction, event) {
    const directionMap = {
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
    }
    const runner = Object.assign({}, this.keysMap, directionMap)
    runner[direction].handler.call(this, event, this.focusState.currentFocusElement, this.focusState.currentIndexString)
  }
}

export default Focuser