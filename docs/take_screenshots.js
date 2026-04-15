const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932 }); // iPhone 14 Pro size

  console.log("Navigating...");
  await page.goto('https://mdga-2026.pages.dev/', { waitUntil: 'networkidle0' });

  // 1. Click Guest
  console.log("Clicking Guest...");
  await page.waitForXPath("//button[contains(text(), '게스트로 둘러보기')]");
  const guestBtn = await page.$x("//button[contains(text(), '게스트로 둘러보기')]");
  await guestBtn[0].click();

  // 2. Select Store
  console.log("Selecting Store...");
  await page.waitForXPath("//div[contains(., '사업장 (Store)') and contains(@class, 'p-4')]");
  const storeCards = await page.$x("//div[contains(., '사업장 (Store)') and contains(@class, 'p-4')]");
  await storeCards[0].click();

  await new Promise(r => setTimeout(r, 1000));

  // Fill inputs
  console.log("Filling inputs...");
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    const setVal = (el, val) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    
    inputs.forEach(i => {
      if(i.placeholder.includes('스마트팜') || i.placeholder.includes('산업군')) setVal(i, "첨단반도체");
      else if(i.placeholder === '직접입력' && i.parentElement.previousElementSibling?.textContent.includes('Gu')) setVal(i, "달서구");
      else if(i.placeholder === '직접입력' && i.parentElement.previousElementSibling?.textContent.includes('Dong')) setVal(i, "월암동");
      else if(i.placeholder === '직접입력' && i.parentElement.previousElementSibling?.textContent.includes('Street')) setVal(i, "성서스마트산단");
      else if(i.placeholder.includes('사업장')) setVal(i, "미래반도체(주)");
    });
  });

  await new Promise(r => setTimeout(r, 500));

  // Submit
  console.log("Submitting...");
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if(btn) { btn.disabled = false; btn.click(); }
  });

  console.log("Waiting for Dashboard...");
  await page.waitForXPath("//button[contains(., '피딩')]");
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'docs/screenshots/11_new_store_dashboard.png' });

  // Go to Feeding
  console.log("Clicking Feeding...");
  const feedBtn = await page.$x("//button[contains(., '피딩')]");
  await feedBtn[0].click();

  await new Promise(r => setTimeout(r, 1000));

  console.log("Filling textarea...");
  await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(textarea, "[생산보고서] 오늘 주간 교대조 A라인의 웨이퍼 불량률이 평소(0.5%)보다 높은 1.2%로 측정되었습니다. 노광 장비 챔버 온도가 기준치보다 0.2도 높게 유지된 것이 원인으로 보입니다.");
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'docs/screenshots/12_new_store_feeding.png' });

  // Upload
  console.log("Uploading...");
  await page.evaluate(() => {
    const upBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('업로드 및 자산화'));
    if (upBtn) { upBtn.disabled = false; upBtn.click(); }
  });

  console.log("Waiting for Insight to load...");
  // Wait until insight appears or at least 10 seconds
  await new Promise(r => setTimeout(r, 12000));

  // Scroll to the bottom or where the insight is
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'docs/screenshots/13_new_store_updated.png' });

  console.log("Screenshots captured!");
  await browser.close();
})();
