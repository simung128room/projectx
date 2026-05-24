const p = require('puppeteer');
(async () => {
  const browser = await p.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.goto('http://localhost:3000', {waitUntil: 'networkidle0'});
  await browser.close();
})();
