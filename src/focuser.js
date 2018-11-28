
class Focuser {
  constructor(vm, options) {
    this.init(vm, options)
    this.bindKeyEvent()
  }

  init(vm, options) {
    // 存放indexString索引的node节点
    this.focusMap = {}
    // 存放原始focus相关参数
    this.focusOptions = options.focus
    let currentRowIndex, currentColIndex
    if (this.focusOptions && this.focusOptions.defaultFocusIndex) {
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

    // 合并键盘绑定键值码
    if (this.focusOptions.keysMergeOptions.coverage) {
      this.keysMap = this.focusOptions.keysMap
    } else {
      this.keysMap = {
        'up': [38],
        'down': [40],
        'left': [37],
        'right': [39],
        'enter': [13, 32],
        'return': [27]
      }
    }

    vm.focuser = this
    this.vm = vm
  }

  bindKeyEvent() {
    window.addEventListener('keydown', (event) => {
      console.log(event.keyCode)
      switch(event.keyCode) {
        case 37:
        this.move('left')
        break
        case 38:
        this.move('up')
        break
        case 39:
        this.move('right')
        break
        case 40:
        this.move('down')
        break
      }
    })
  }
  
  addFocusMap(key, node) {
    let keys = key.split(/,\s*/)
    keys.forEach(item => {
      if (item in this.focusMap) {
        return console.warn(`t-focus should be unique in one TVVM page but t-focus=${item} has already exist`)
      }
      this.focusMap[item] = node
    })
    
  }
  // 设置焦点dom
  setFocus(index) {
    if (index in this.focusMap) {
      let arr = index.split('-')
      let currentRowIndex = Number(arr[0])
      let currentColIndex = Number(arr[1])
      this.focusMap[index].focus()
      this.focusState.currentIndexString = index
      this.focusState.currentRowIndex = currentRowIndex
      this.focusState.currentColIndex = currentColIndex
    } else {
      console.warn(`can't find t-focus ${index} node`)
    }
  }

  isBoundary() {

  }

  isTopBoundary() {
    return this.focusState.currentRowIndex === 0
  }

  isLeftBoundary() {
    return this.focusState.currentColIndex === 0
  }

  isRightBoundary() {
    
  }

  isBottomBoundary() {

  }

  moveUp() {
    if (this.isTopBoundary()) {
      // donothing
    } else {
      let rowIndex = this.focusState.currentRowIndex - 1
      let colIndex = this.focusState.currentColIndex
      let indexString = [rowIndex, colIndex].join('-')
      this.setFocus(indexString)
    }
  }

  moveDown() {
    if (this.isBottomBoundary()) {
      // donothing
    } else {
      let rowIndex = this.focusState.currentRowIndex + 1
      let colIndex = this.focusState.currentColIndex
      let indexString = [rowIndex, colIndex].join('-')
      this.setFocus(indexString)
    }
  }

  moveLeft() {
    if (this.isLeftBoundary()) {
      // donothing
    } else {
      let rowIndex = this.focusState.currentRowIndex
      let colIndex = this.focusState.currentColIndex - 1
      let indexString = [rowIndex, colIndex].join('-')
      this.setFocus(indexString)
    }
  }

  moveRight() {
    if (this.isRightBoundary()) {
      // donothing
    } else {
      let rowIndex = this.focusState.currentRowIndex
      let colIndex = this.focusState.currentColIndex + 1
      let indexString = [rowIndex, colIndex].join('-')
      this.setFocus(indexString)
    }
  }

  // 键盘上下左右触发函数 参数 按键方向， 原焦点索引字符串，焦点可循环标志位 
  move(direction, baseIndex, circle) {
    const directionMap = {
      'up': this.moveUp,
      'down': this.moveDown,
      'left': this.moveLeft,
      'right': this.moveRight
    }
    directionMap[direction].call(this)
  }
}

export default Focuser