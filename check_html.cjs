const p = require('puppeteer');
(async () => {
  const browser = await p.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  await page.goto('http://localhost:3000', {waitUntil: 'networkidle0'});
  const html = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log("Root content length:", html.length);
  if (html.length < 500) {
      console.log(html);
  }
  await browser.close();
})();
