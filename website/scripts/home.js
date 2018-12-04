new TVVM({
  el: '#tv',
  data: function () {
    return {
      userinfo: {
        name: 'Float'
      }
    }
  },
  focus: {
    defaultFocusIndex: '1-0',
    keysMap: {
      'up': {
        codes: [38],
        handler: function (event, node, index, prevNode) {
          console.log('up?')
        }
      },
      'g': {
        codes: [71],
        handler: function (event, node, index, prevNode) {
          console.log('you press g')
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

        }
      },
      'addVolume': {
        codes: [133],
        handler: function (event, node, index, prevNode) {

        }
      },
    },
    keysMapMergeCoverage: false,
    specialKeys: {
      '11': function (event, node, index, prevNode) {

      }
    },
    circle: {
      horizontal: true,
      vertical: true,
    },
  },
  methods: {
    testFn: function (a, b) {
      console.log('click num is', a, b)
    }
  }
})