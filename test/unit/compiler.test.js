const Compiler = require('../../src/compiler')

describe('Compiler unit test', () => {
  test('Compiler is a function', () => {
    expect(Compiler instanceof Function).toBeTruthy()
  })
})