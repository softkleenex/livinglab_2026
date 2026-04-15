from playwright.sync_api import sync_playwright
import time
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 430, 'height': 932})
    page = context.new_page()
    print("Navigating to page...")
    page.goto('https://mdga-2026.pages.dev/?t=vision_test_2', wait_until='networkidle')
    
    print("Waiting for Guest Button...")
    page.wait_for_selector('button:has-text("게스트로 둘러보기")')
    page.click('button:has-text("게스트로 둘러보기")')
    
    print("Waiting for Store Button...")
    time.sleep(1)
    page.evaluate('Array.from(document.querySelectorAll("div.cursor-pointer")).find(el => el.textContent.includes("사업장 (Store)")).click()')
    time.sleep(1)
    
    print("Filling inputs...")
    page.evaluate('''(function() {
        const inputs = document.querySelectorAll("input");
        const setVal = (el, val) => {
            if(!el) return;
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            setter.call(el, val);
            el.dispatchEvent(new Event("input", { bubbles: true }));
        };
        inputs.forEach(i => {
            if(i.placeholder.includes("스마트팜") || i.placeholder.includes("산업군")) setVal(i, "IT/클라우드");
            else if(i.placeholder === "직접입력" && i.parentElement.previousElementSibling?.textContent.includes("Gu")) setVal(i, "북구");
            else if(i.placeholder === "직접입력" && i.parentElement.previousElementSibling?.textContent.includes("Dong")) setVal(i, "침산동");
            else if(i.placeholder === "직접입력" && i.parentElement.previousElementSibling?.textContent.includes("Street")) setVal(i, "경북대 창업캠퍼스");
            else if(i.placeholder.includes("사업장")) setVal(i, "(주)데이터블록");
        });
    })()''')
    
    print("Submitting...")
    time.sleep(1)
    page.evaluate('''(function() {
        const btn = document.querySelector("button[type=\\"submit\\"]");
        if(btn) { btn.disabled = false; btn.click(); }
    })()''')
    
    print("Waiting for Dashboard...")
    try:
        page.wait_for_selector('button:has-text("피딩")', timeout=10000)
    except Exception as e:
        page.screenshot(path='docs/screenshots/error_dashboard.png')
        print("Failed to load dashboard. Screenshot saved to error_dashboard.png")
        raise e

    time.sleep(3)
    
    print("Navigating to Feeding...")
    page.click('button:has-text("피딩")')
    time.sleep(1)
    
    print("Uploading file (Vision Test)...")
    file_path = os.path.abspath('docs/test_data/q1_financial_report.png')
    page.set_input_files('input[type="file"]', file_path)
    time.sleep(1)
    
    print("Filling Textarea context...")
    page.evaluate('''(function() {
        const textarea = document.querySelector("textarea");
        if (textarea) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
            setter.call(textarea, "1분기 재무 및 운영 지표 요약본 스크린샷입니다. 전반적인 피드백 부탁드립니다.");
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }
    })()''')
    time.sleep(1)
    
    print("Clicking upload...")
    page.evaluate('''(function() {
        const upBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("업로드 및 자산화"));
        if (upBtn) { upBtn.disabled = false; upBtn.click(); }
    })()''')
    
    print("Waiting for Insight generation...")
    # Wait for the Trust badge to appear
    page.wait_for_selector('div:has-text("TRUST: ")', timeout=30000)
    time.sleep(5)
    
    # Scroll to bottom
    page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
    time.sleep(2)
    page.screenshot(path='docs/screenshots/16_vision_insight.png')
    
    print("Done!")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
