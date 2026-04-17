from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 430, 'height': 932})
    page = context.new_page()
    page.goto('https://mdga-2026.pages.dev/?t=tooltip', wait_until='networkidle')
    
    # Use guest login
    page.wait_for_selector('button:has-text("게스트로 둘러보기")')
    page.click('button:has-text("게스트로 둘러보기")')
    time.sleep(1)
    
    # Enter Workspace with any random selection from root
    page.wait_for_selector('button:has-text("모든 객체(사업장) 찾아보기")')
    page.click('button:has-text("모든 객체(사업장) 찾아보기")')
    time.sleep(1)
    
    # Click the first store in the list
    page.click('div.group.cursor-pointer >> nth=0')
    time.sleep(1)
    
    # Click Enter Workspace
    page.click('button[type="submit"]')
    
    # Wait for Dashboard map
    page.wait_for_selector('button:has-text("피딩")', timeout=10000)
    time.sleep(3)
    
    # Switch to Explorer tab
    page.click('button:has-text("트윈 맵")')
    time.sleep(2)
    
    # Hover over the first marker in leaflet
    page.hover('div.leaflet-marker-pane > div:first-child')
    time.sleep(1)
    
    page.screenshot(path='docs/screenshots/19_map_tooltip.png')
    
    print("Done!")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
