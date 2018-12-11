var tv = new TVVM({
  el: '#doc',
  hooks: {
    mounted: function () {
      var scroll = new BScroll('.content-wrapper', {
        // startY: 600,
        scrollY: true,
        scrollX: false,
        click: true,
        type: true,
        bounce: {
          top: true,
          bottom: true,
          left: true,
          right: true
        }
      })
    },
    updated: function () {
      
    }
  },
  data: function () {
    return {
      demoInputValue: 'demo',
      menuShow: false,
      navClassList: {
        'menu-hidden': true,
        'menu-show': false
      },
      cloakClassList: {
        'cloak-hidden': true,
        'cloak-show': false
      },
      buttonClassList: {
        'icon-back': false,
        'icon-menu': true
      }
    }
  },
  methods: {
    toggleMenu: function (event) {
      event.preventDefault()
      var button = document.querySelector('#menu-button')
      if (this.menuShow) {
        this.menuShow = false
        this.navClassList = {
          'menu-hidden': true,
          'menu-show': false
        }
        this.cloakClassList = {
          'cloak-hidden': true,
          'cloak-show': false
        }
        this.buttonClassList = {
          'icon-back': false,
          'icon-menu': true
        }
      } else {
        this.menuShow = true
        this.navClassList = {
          'menu-hidden': false,
          'menu-show': true
        }
        this.cloakClassList = {
          'cloak-hidden': false,
          'cloak-show': true
        }
        this.buttonClassList = {
          'icon-back': true,
          'icon-menu': false
        }
      }
    }
  }
})

