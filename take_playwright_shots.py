from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 430, 'height': 932})
    page = context.new_page()
    page.goto('https://mdga-2026.pages.dev/?t=browse_stores_4', wait_until='networkidle')
    
    page.wait_for_selector('button:has-text("게스트로 둘러보기")')
    page.click('button:has-text("게스트로 둘러보기")')
    
    time.sleep(2)
    
    # Scroll down to ensure the new button is visible
    page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
    time.sleep(1)
    
    # Let's print out all buttons to see what we have
    buttons = page.evaluate('Array.from(document.querySelectorAll("button")).map(b => b.textContent)')
    print("Buttons found:", buttons)
    
    page.screenshot(path='docs/screenshots/17_browse_all_stores.png')
    
    # Click the new button
    print("Clicking Browse All Stores button...")
    page.evaluate('''(function() {
        const btn = Array.from(document.querySelectorAll("button")).find(el => el.textContent.includes("모든 객체(사업장) 찾아보기"));
        if(btn) btn.click();
    })()''')
    time.sleep(2)
    
    page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
    time.sleep(1)
    page.screenshot(path='docs/screenshots/18_browse_all_stores_list.png')
    
    print("Done!")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
