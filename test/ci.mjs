import puppeteer from 'puppeteer'
import { createServer } from 'vite'
const PORT = 3001

;(async () => {
  const vite = await createServer({}).listen(PORT)

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const address = `http://localhost:${PORT}/test/`

  let exitCode = 0
  let gotAtLeastOnePass = false

  // define listener before page.goto is important as uvu is so fast
  page.on('console', (msg) => {
    // This is highly coupled to current uvu output and can break anytime :/
    if (msg._text.includes('✘')) {
      exitCode = 1
      process.stdout.write('\x1b[31m✘') // red x
    }
    if (msg._text.includes('•')) {
      gotAtLeastOnePass = true
      process.stdout.write('\x1b[32m•') // green dot
    }
  })

  await page.goto(address, { waitUntil: 'domcontentloaded' })
  await browser.close()

  const passed = exitCode === 0 && gotAtLeastOnePass

  console.log('\x1b[0m') // resets color
  console.log(
    passed
    ? '🤘 Tests passed.'
    : `💩 Tests failed. Open in real browser to debug while running vite server`
  )

  vite.close()
  process.exit(exitCode)
})()
