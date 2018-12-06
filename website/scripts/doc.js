new TVVM({
  el: '#doc',
  data: function () {
    return {
      menuShow: false
    }
  },
  methods: {
    toggleMenu: function (event) {
      var menu = document.querySelector('.left-nav')
      var button = document.querySelector('#menu-button')
      if (this.menuShow) {
        this.menuShow = false
        menu.classList.replace('menu-show', 'menu-hidden')
        button.classList.replace('icon-back', 'icon-menu')
      } else {
        this.menuShow = true
        button.classList.replace('icon-menu', 'icon-back')
        menu.classList.replace('menu-hidden', 'menu-show')
      }
    }
  }
})
