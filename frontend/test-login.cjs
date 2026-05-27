const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 2000));
  await page.type('input[type="email"]', 'test@test.com');
  await page.type('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 3000));
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log(html);
  await browser.close();
})();
