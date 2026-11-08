"""Smoke-test production, including mobile touch audio in WebKit."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    engines=[("chromium",p.chromium)]
    if Path(p.webkit.executable_path).exists():
        engines.append(("webkit",p.webkit))
    for name,engine in engines:
        browser=engine.launch()
        page=browser.new_page(viewport={"width":844,"height":390},has_touch=True,is_mobile=True)
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        page.add_init_script("""
            window.audioNotes=0;
            const Native=window.AudioContext;
            window.AudioContext=class extends Native{
                constructor(...args){super(...args);window.testAudio=this;}
                createOscillator(){window.audioNotes++;return super.createOscillator();}
            };
        """)
        response=page.goto("https://egenijaus-nuotykiai.vercel.app/")
        assert response and response.status==200
        state=page.get_by_test_id("state")
        expect(state).to_have_text("READY")
        expect(page.locator("canvas")).to_be_visible()
        assert page.evaluate("window.audioNotes")==0
        page.locator("canvas").tap()
        expect(state).to_have_text("RUNNING")
        page.wait_for_function("window.audioNotes > 3 && window.testAudio.state === 'running'")
        page.keyboard.press("Space")
        page.wait_for_function("Number(document.querySelector('[data-testid=state]').dataset.y) < 530")
        page.keyboard.press("p")
        expect(state).to_have_text("PAUSED")
        page.screenshot(path=f"/work/output/eugenijus-vercel-{name}.png")
        page.locator("canvas").tap()
        expect(state).to_have_text("RUNNING")
        assert not errors,errors
        print(f"PASS production {name}: public HTTP 200, touch audio, jump, pause/resume; no page errors")
        browser.close()
