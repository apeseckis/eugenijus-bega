from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.add_init_script("""
        window.audioNotes = 0;
        const NativeContext = window.AudioContext;
        window.AudioContext = class extends NativeContext {
            constructor(...args) { super(...args); window.testAudio = this; }
            createOscillator() { window.audioNotes++; return super.createOscillator(); }
        };
    """)
    page.goto("http://app-eugenijus-bega:5173/")
    expect(page.get_by_test_id("state")).to_have_text("READY")
    assert page.evaluate("window.audioNotes") == 0
    page.locator("canvas").click()
    expect(page.get_by_test_id("state")).to_have_text("RUNNING")
    page.wait_for_function("window.audioNotes > 3 && window.testAudio.state === 'running'")
    page.locator("#music").click()
    expect(page.locator("#music")).to_have_attribute("aria-pressed", "false")
    expect(page.get_by_test_id("state")).to_have_text("RUNNING")
    print("PASS: no autoplay notes, gesture activates Web Audio and schedules notes, mute does not affect gameplay")
    browser.close()
