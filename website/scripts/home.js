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
      },
      downloadWrapper: {
        opacity: 0,
        style: ''
      },
      tv: {
        height: 0
      },
      nav: {
        classList: {
          'nav-dark': false,
          'nav-light': true
        }
      }
    }
  },
  hooks: {
    mounted: function () {
      var tvWrapper = document.querySelector('.tv-wrapper')
      this.tv.height = tvWrapper.getBoundingClientRect().height
    }
  },
  methods: {
    gotoDownload: function () {
      window.location.assign('https://unpkg.com/tvvm@1.0.2/dist/tvvm.min.js')
    },
    handleScroll: function (event) {
      var percent = (event.target.scrollTop / this.tv.height).toFixed(2) > 1 ? 1 : (event.target.scrollTop / this.tv.height).toFixed(2)

      this.remoteControl.bottom = - (300 * percent).toFixed(2) + 'px'
      this.remoteControl.opacity = (1 - percent).toFixed(2)
      this.remoteControl.style = `opacity: ${this.remoteControl.opacity}; bottom: ${this.remoteControl.bottom}`

      this.downloadWrapper.opacity = percent
      this.downloadWrapper.style = `opacity: ${this.downloadWrapper.opacity}`
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