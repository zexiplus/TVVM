const puppeteer = require('puppeteer')
const path = require('path')
// const tvvm = require('../dist/tvvm.js')

let browser
let page

// jest api
// describe('title', fn)
// test('name', fn, timeout)

// assert api
// expect().toEqual()
// expect().toBeFalsy() 
// expect().toBeTruthy()

// browser api
// page.goto(url) 

// jest global hooks
beforeAll(async () => {
  browser = await puppeteer.launch()
  page = await browser.newPage({ args: ['--no-sandbox'] })
})

describe('\n TVVM test case \n', () => {
  test('page loader', async () => {
    await page.goto(`file://${path.resolve('./test/index.html')}`, { waitUntil: 'load'})
  }, 10000)

  test('Test html load', async () => {
    const title = await page.title()
    expect(title).toBe('TVVM')
  })

})
