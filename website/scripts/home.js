new TVVM({
  el: '#tv',
  data: function () {
    return {
      userinfo: {
        name: 'Float'
      },
      remoteControl: {
        opacity: 1,
        bottom: 0,
        style: ''
      }
    }
  },
  methods: {
    handleScroll: function (event) {
      var percent = (event.target.scrollTop / 330).toFixed(2)
      this.remoteControl.bottom = (- (250 * percent).toFixed(2)) + 'px'
      this.remoteControl.opacity = percent > 1 ? 0 : (1 - percent).toFixed(2)
      this.remoteControl.style = `opacity: ${this.remoteControl.opacity}; bottom: ${this.remoteControl.bottom}`
    },
    createPressEvent: function (keyCode) {
      var customEvent = new Event('keydown', {bubbles: true, cancelable: true})
      customEvent.keyCode = keyCode
      window.dispatchEvent(customEvent)
    },
    pressPower: function (e) {
      e.preventDefault()
      this.createPressEvent(71)
    },
    pressEnter: function (e) {
      e.preventDefault()
      this.createPressEvent(13)
    },
    pressLeft: function (e) {
      e.preventDefault()
      this.createPressEvent(37)
    },
    pressUp: function(e) {
      e.preventDefault()
      this.createPressEvent(38)
    },
    pressRight: function(e) {
      e.preventDefault()
      this.createPressEvent(39)
    },
    pressDown: function(e) {
      e.preventDefault()
      this.createPressEvent(40)
    },
    pressHome: function(e) {
      e.preventDefault()
      this.createPressEvent(36)
    },
    pressBack: function(e) {
      e.preventDefault()
      this.createPressEvent(27)
    },
    pressMenu: function(e) {
      e.preventDefault()
      this.createPressEvent(18)
    },
  },
  focus: {
    defaultFocusIndex: '1-0',
    activeClass: 'high-light',
    keysMap: {
      'up': {
        codes: [38],
        handler: function (event, node, index, prevNode) {
          
        }
      },
      'shutdown': {
        codes: [71],
        handler: function () {
          console.log('shutdonw')
        }
      },
      'down': {
        codes: [40]
      },
      'left': {
        codes: [37],
        handler: function (event, node, index, prevNode) {

        }
      },
      'right': {
        codes: [39],
        handler: function (event, node, index, prevNode) {

        }
      },
      'enter': {
        codes: [13],
        handler: function (event, node, index, prevNode) {
          console.log('enter')
        }
      },
      'space': {
        codes: [32],
        handler: function (event, node, index, prevNode) {

        }
      },
      'return': {
        codes: [27],
        handler: function (event, node, index, prevNode) {
          console.log('back')
        }
      },
      'home': {
        codes: [36],
        handler: function () {
          console.log('home')
        }
      },
      'menu': {
        codes: [18],
        handler: function (event, node, index, prevNode) {
          console.log('menu')
        }
      },
    },
    keysMapMergeCoverage: false,
    circle: {
      horizontal: true,
      vertical: true,
    },
  }
})