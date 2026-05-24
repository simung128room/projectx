const p = require('puppeteer');
(async () => {
  const browser = await p.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:3000', {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'screenshot_mobile.png'});
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000', {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'screenshot_desktop.png'});

  await browser.close();
  console.log('Screenshots taken');
})();
