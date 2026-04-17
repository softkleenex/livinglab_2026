from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 430, 'height': 932})
    page = context.new_page()
    page.goto('https://mdga-2026.pages.dev/?t=combobox_test', wait_until='networkidle')
    
    page.wait_for_selector('button:has-text("게스트로 둘러보기")')
    page.click('button:has-text("게스트로 둘러보기")')
    
    time.sleep(1)
    page.evaluate('Array.from(document.querySelectorAll("div.cursor-pointer")).find(el => el.textContent.includes("사업장 (Store)")).click()')
    time.sleep(2)
    
    # Take screenshot of the combobox UI
    page.screenshot(path='docs/screenshots/04_store_selected_combobox.png')
    
    print("Done!")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
