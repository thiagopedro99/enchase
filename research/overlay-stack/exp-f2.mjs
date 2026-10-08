import { launch, openPage, state, active } from './lib.mjs'
const browser = await launch()
for (const scene of ['nested', 'nestedstable']) {
  const page = await openPage(browser, 'scene=' + scene)
  await page.click('#open-modal')
  await page.click('#open-b')
  await page.keyboard.press('Escape')
  console.log(scene, 'after one Escape', JSON.stringify(await state(page)))
  await page.context().close()
}
await browser.close()
