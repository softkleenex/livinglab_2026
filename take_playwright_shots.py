from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 430, 'height': 932})
    page = context.new_page()
    print("Navigating to page...")
    page.goto('https://mdga-2026.pages.dev/?t=playwright3', wait_until='networkidle')
    
    print("Waiting for Guest Button...")
    page.wait_for_selector('button:has-text("게스트로 둘러보기")')
    page.click('button:has-text("게스트로 둘러보기")')
    
    print("Waiting for Store Button...")
    page.wait_for_selector('div.cursor-pointer:has-text("사업장 (Store)")')
    page.click('div.cursor-pointer:has-text("사업장 (Store)")')
    
    print("Filling inputs natively...")
    # Playwright's native fill handles React onChange perfectly
    page.fill('input[placeholder*="스마트팜"]', "첨단반도체")
    
    # The Gu, Dong, Street inputs all have placeholder="직접입력". 
    # We can select them by their order.
    inputs = page.locator('input[placeholder="직접입력"]').all()
    if len(inputs) >= 3:
        inputs[0].fill("달서구")
        inputs[1].fill("월암동")
        inputs[2].fill("성서스마트산단")
        
    page.fill('input[placeholder*="새로운 사업장"]', "미래반도체(주)")
    
    print("Submitting...")
    time.sleep(1)
    page.click('button:has-text("Enter Workspace")')
    
    print("Waiting for Dashboard...")
    try:
        page.wait_for_selector('button:has-text("피딩")', timeout=10000)
    except Exception as e:
        page.screenshot(path='docs/screenshots/error_dashboard.png')
        print("Failed to load dashboard. Screenshot saved to error_dashboard.png")
        raise e

    time.sleep(3)
    page.screenshot(path='docs/screenshots/11_new_store_dashboard.png')
    
    print("Navigating to Feeding...")
    page.click('button:has-text("피딩")')
    time.sleep(1)
    
    print("Filling Textarea...")
    page.fill('textarea', '[생산보고서] 오늘 주간 교대조 A라인의 웨이퍼 불량률이 평소(0.5%)보다 높은 1.2%로 측정되었습니다. 노광 장비 챔버 온도가 기준치보다 0.2도 높게 유지된 것이 원인으로 보입니다.')
    time.sleep(1)
    page.screenshot(path='docs/screenshots/12_new_store_feeding.png')
    
    print("Uploading...")
    page.click('button:has-text("업로드 및 자산화")')
    
    print("Waiting for Insight generation...")
    # Wait for the Trust badge to appear
    page.wait_for_selector('div:has-text("TRUST: ")', timeout=20000)
    time.sleep(5)
    
    # Scroll to bottom to show insight
    page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
    time.sleep(2)
    page.screenshot(path='docs/screenshots/13_new_store_updated.png')
    
    print("Done!")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
