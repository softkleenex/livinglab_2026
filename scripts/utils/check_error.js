const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 1000));
  
  // Login as guest
  let buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('B2B 구매자')) {
      await btn.click();
    }
  }
  
  const inputs = await page.$$('input');
  if (inputs.length > 0) {
      await inputs[0].type('대구광역시');
      await inputs[1].type('농업기술센터');
  }

  buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('워크스페이스 입장')) {
      await btn.click();
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  
  // Try to click AI 분석
  const navs = await page.$$('nav button');
  for (const btn of navs) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('AI분석')) {
      await btn.click();
      console.log('Clicked AI분석');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({path: 'screenshot.png'});
  console.log('Saved screenshot');
  await browser.close();
})();