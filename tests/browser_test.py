import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width":1280,"height":800})
        errors=[]
        page.on("pageerror",lambda error: errors.append(str(error)))
        page.add_init_script("""
            window.effectAudio = {rustles:0,boings:0,whistles:0};
            const NativeContext=window.AudioContext;
            window.AudioContext=class extends NativeContext {
                createBufferSource() { window.effectAudio.rustles++; return super.createBufferSource(); }
                createOscillator() {
                    const oscillator=super.createOscillator();
                    const ramp=oscillator.frequency.exponentialRampToValueAtTime.bind(oscillator.frequency);
                    oscillator.frequency.exponentialRampToValueAtTime=(value,time)=>{
                        if(value===85)window.effectAudio.boings++;
                        if(value===110)window.effectAudio.whistles++;
                        return ramp(value,time);
                    };
                    return oscillator;
                }
            };
        """)
        page.goto("http://app-eugenijus-bega:5173/")
        state=page.get_by_test_id("state")
        expect(state).to_have_text("READY")
        expect(page.locator("canvas")).to_be_visible()
        page.locator("#music").click()
        expect(page.locator("#music")).to_have_attribute("aria-pressed","false")
        expect(state).to_have_text("READY")
        page.locator("#music").click()
        expect(page.locator("#music")).to_have_attribute("aria-pressed","true")
        page.locator("canvas").click(position={"x":600,"y":300})
        expect(state).to_have_text("RUNNING")
        page.reload()
        expect(state).to_have_text("READY")
        page.keyboard.down("Space")
        expect(state).to_have_text("RUNNING")
        page.wait_for_function("Number(document.querySelector('[data-testid=state]').dataset.elapsed) > 1")
        assert float(state.get_attribute("data-y")) == 560, "Starting/holding Space must not jump"
        page.keyboard.up("Space")
        page.keyboard.press("Space")
        page.wait_for_function("Number(document.querySelector('[data-testid=state]').dataset.y) < 530")
        page.wait_for_function("Number(document.querySelector('[data-testid=state]').dataset.y) === 560")
        # Keyboard and standard Xbox Menu (button 9), with rising edges.
        page.keyboard.down("p")
        expect(state).to_have_text("PAUSED")
        frozen=state.get_attribute("data-elapsed")
        page.keyboard.down("p")
        page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
        expect(state).to_have_text("PAUSED")
        assert state.get_attribute("data-elapsed") == frozen
        page.keyboard.up("p")
        page.keyboard.press("Escape")
        expect(state).to_have_text("RUNNING")
        page.evaluate("""() => {
            window.testButtons=Array.from({length:17},()=>({pressed:false}));
            navigator.getGamepads=()=>[{connected:true,buttons:window.testButtons}];
            window.testButtons[9].pressed=true;
        }""")
        expect(state).to_have_text("PAUSED")
        frozen=state.get_attribute("data-elapsed")
        page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
        expect(state).to_have_text("PAUSED")
        assert state.get_attribute("data-elapsed") == frozen
        page.evaluate("window.testButtons[9].pressed=false")
        page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
        page.evaluate("window.testButtons[9].pressed=true; window.testButtons[0].pressed=true")
        expect(state).to_have_text("RUNNING")
        assert float(state.get_attribute("data-y")) == 560
        page.evaluate("window.testButtons[9].pressed=false; window.testButtons[0].pressed=false")
        # Lose focus via the same browser event the game listens for.
        page.evaluate("window.dispatchEvent(new Event('blur'))")
        expect(state).to_have_text("PAUSED")
        page.keyboard.press("Space")
        expect(state).to_have_text("RUNNING")
        page.wait_for_function("JSON.parse(document.querySelector('[data-testid=state]').dataset.effects).leaves === 1", timeout=45000)
        page.wait_for_function("Number(document.querySelector('[data-testid=state]').dataset.pursuerHeight) > 65", timeout=15000)
        page.screenshot(path="/work/output/eugenijus-hedgehog-jump.png")
        page.wait_for_function("document.querySelector('[data-testid=state]').dataset.ballFlying === 'true'", timeout=20000)
        page.screenshot(path="/work/output/eugenijus-football-parrot.png")
        assert page.locator('[data-testid=state]').get_attribute('data-parrot') == 'true'
        assert page.locator('[data-testid=state]').evaluate("(el) => JSON.parse(el.dataset.effects).stone") == 1
        # With no jumps the deterministic first pit leads to the friendly jail.

        try:
            expect(state).to_have_text("CAUGHT",timeout=45000)
        finally:
            print("Runtime:",state.evaluate("(el) => el.outerHTML"), page.locator("aside").inner_text(), errors)
            page.screenshot(path="/work/output/eugenijus-diagnostic.png")
        assert state.evaluate("(el) => JSON.parse(el.dataset.effects).pit") == 1
        audio=page.evaluate("window.effectAudio")
        assert audio["rustles"] >= 1 and audio["boings"] == 1 and audio["whistles"] == 1, audio
        page.wait_for_function("document.querySelector('[data-testid=state]').dataset.capturePhase === 'caged'", timeout=20000)
        page.screenshot(path="/work/output/eugenijus-truck.png")
        page.wait_for_function("document.querySelector('[data-testid=state]').dataset.capturePhase === 'departing'", timeout=20000)
        page.keyboard.press("Space")
        expect(state).to_have_text("RUNNING")
        page.mouse.click(600,400)
        expect(state).to_have_text("RUNNING")
        output=Path(os.environ.get("OUTPUT_DIR","/work/output"))
        output.mkdir(parents=True,exist_ok=True)
        page.screenshot(path=str(output/"eugenijus-running.png"))
        assert not errors, errors
        browser.close()
        print("PASS: load, ready, Space start, pause/resume, capture, restart, click; no page errors")
if __name__=="__main__":
    main()
