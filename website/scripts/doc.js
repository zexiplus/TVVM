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
      menuShow: false
    }
  },
  methods: {
    toggleMenu: function (event) {
      event.preventDefault()
      var menu = document.querySelector('.left-nav')
      var button = document.querySelector('#menu-button')
      var cloak = document.querySelector('.cloak')
      if (this.menuShow) {
        this.menuShow = false
        button.classList.replace('icon-back', 'icon-menu')
        menu.classList.add('menu-hidden')
        menu.classList.remove('menu-show')
        cloak.classList.add('cloak-hidden')
        cloak.classList.remove('cloak-show')
      } else {
        this.menuShow = true
        button.classList.replace('icon-menu', 'icon-back')
        menu.classList.add('menu-show')
        menu.classList.remove('menu-hidden')
        cloak.classList.add('cloak-show')
        cloak.classList.remove('cloak-hidden')
      }
    }
  }
})

