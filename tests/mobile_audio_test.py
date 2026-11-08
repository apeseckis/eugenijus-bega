"""Exercise strict gesture gating and iPhone-sized touch input."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

GATE = """
window.gestureResumes=0; window.audioNotes=0;
const Native=window.AudioContext;
window.AudioContext=class extends Native{
    constructor(...args){super(...args);window.testAudio=this;void this.suspend();}
    resume(){
        if(!window.event?.isTrusted)return Promise.reject(new Error('Gesture required'));
        window.gestureResumes++;return super.resume();
    }
    createOscillator(){window.audioNotes++;return super.createOscillator();}
};
"""

with sync_playwright() as p:
    engines=[("chromium",p.chromium)]
    if Path(p.webkit.executable_path).exists():
        engines.append(("webkit",p.webkit))
    else:
        print("WebKit binary unavailable in shared runner; testing strict gesture gate in Chromium")
    for name,engine in engines:
        browser=engine.launch()
        page=browser.new_page(viewport={"width":844,"height":390},has_touch=True,is_mobile=True)
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        page.add_init_script(GATE)
        page.goto("http://app-eugenijus-bega:5173/")
        state=page.get_by_test_id("state")
        expect(state).to_have_text("READY")
        assert page.evaluate("window.audioNotes") == 0
        page.locator("canvas").tap()
        expect(state).to_have_text("RUNNING")
        page.wait_for_function("window.gestureResumes > 0 && window.audioNotes > 3 && window.testAudio.state === 'running'")
        assert float(state.get_attribute("data-y")) == 560, "Tap release must not cause a second action"
        page.evaluate("window.dispatchEvent(new Event('blur')); window.testAudio.suspend()")
        expect(state).to_have_text("PAUSED")
        before=page.evaluate("window.gestureResumes")
        page.locator("canvas").tap()
        expect(state).to_have_text("RUNNING")
        page.wait_for_function(f"window.gestureResumes > {before} && window.testAudio.state === 'running'")
        page.locator("#music").tap()
        expect(page.locator("#music")).to_have_attribute("aria-pressed","false")
        assert not errors,errors
        print(f"PASS {name}: no autoplay, touch unlock in gesture, no double action, audio resumes after interruption, mute")
        browser.close()
