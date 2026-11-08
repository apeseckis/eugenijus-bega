# Eugenijus bėga!

A family-friendly one-button runner built with Phaser **4.2.1**, TypeScript and Vite. All artwork is original temporary Graphics geometry. No external assets, accounts or backend. An original, quiet DOS-style chiptune uses Web Audio square-wave melody and triangle bass. Music starts after a game action, pauses on blur/capture, and can be toggled with the music button.

## Start on HP

The HP host does not need Node installed; Docker provides Node 22.

```sh
cd ~/projects/apps/eugenijus-bega
docker compose config -q
docker compose up -d --build
docker compose ps
curl -I http://127.0.0.1:5173/
```

Only host loopback port 5173 is bound. The container joins the existing external network `dev-testing` under `app-eugenijus-bega`. Do not create or modify shared infrastructure. Stop with `docker compose down`. Rebuild after source changes.

## Play on MacBook Chrome

Open a Terminal on the MacBook and leave this tunnel running:

```sh
ssh -N -L 5173:127.0.0.1:5173 audrius@100.64.172.123
```

Open **http://localhost:5173/** in Chrome. If that Mac port is busy:

```sh
ssh -N -L 5174:127.0.0.1:5173 audrius@100.64.172.123
```

Then open **http://localhost:5174/**. The HP address comes from this repository's SETUP.md; your existing SSH/Tailscale connectivity must work.

Pair the Xbox controller directly to the **MacBook**: turn it on, hold its pairing button until the Xbox light flashes, then select it in macOS System Settings → Bluetooth. In Chrome, click the game once and press A so the browser discovers the controller. “Pultelis prijungtas” indicates detection. A is standard Gamepad button 0. Bluetooth hardware/firmware compatibility needs a physical MacBook check.

Space, mouse click and touch tap always work as alternatives. Press once to start, then release and press again to jump. Holding a button never repeats jumps; jumps cannot be stacked. Jump over leaves, stones and real pits. Leaves remove 34 gap points; stones remove 36. Three rapid minor hits catch you. A clean 2.5 seconds starts gradual recovery. Pits bypass minor-hit protection. At capture, a police truck arrives, Eugenijus hops into its cage, and a smiling Čivilis drives away for a carrot break. Press to restart at any time. Losing focus pauses; a new press resumes without jumping.

## Install, build and test

With local Node 22:

```sh
npm ci
npm run dev
npm run typecheck
npm run build
npm test
```

Or on this HP, use the project container:

```sh
docker compose exec game npm run typecheck
docker compose exec game npm run build
docker compose exec game npm test
playwright-test tests/browser_test.py
playwright-test tests/audio_test.py
```

The browser test uses **http://app-eugenijus-bega:5173/** through the existing Broker, never runner localhost. Requests/results are under `.playwright/`. It checks loading, start, pause/resume, capture, restart, pointer input and browser errors, and saves screenshots, including the truck cage scene. The audio test checks no autoplay notes, gesture activation, note scheduling and the mute control. Unit tests cover chase timing, bounds, frame independence, protection, one-hit obstacles, reset, jump and pit collisions. Tuning is in `src/config.ts`; simulation is in `src/model.ts`.

## Troubleshooting and manual checks

- Tunnel connection refused: check `docker compose ps`, `docker compose logs game` and HP curl above.
- Host port conflict: stop the conflicting project or choose a deliberate loopback-only mapping and corresponding tunnel.
- Controller absent: focus Chrome, press A, reconnect Bluetooth, and use Space meanwhile. Disconnecting a controller does not disable keyboard or pointer input.
- Browser gameplay pauses when switching windows. Return and press deliberately.
- Portrait screens use a fitted landscape canvas. Future iPad Safari needs hands-on testing; HTTPS hosting is preferable for future deployment.
- Verify physical A press/hold/release, reconnect, keyboard fallback, touch, readable layout and focus pause on MacBook. Automated Chromium cannot certify Bluetooth hardware.
- Fixed speed and deterministic, generous obstacle spacing are intentional for milestone 1. Temporary art is intentional. Vite reports a large Phaser bundle warning; the production build still succeeds.

Collision effects: football boing, leaf rustle and descending pit whistle share the sound toggle. Footballs spin and fly away on impact; an occasional purple parrot flaps across the sky with no collisions or gameplay effect.

Pause or resume with **P**, **Escape**, or the Xbox **Menu / Start** button (standard button 9). Holding the button does not toggle repeatedly. A or Space can also resume. Blur/hidden-tab pause remains automatic. Čivilis anticipates and jumps over leaves, footballs and pits; after a minor hit he closes the distance smoothly over about a second, while the chase score applies immediately. Physical Xbox Menu behavior still needs a MacBook check.

Čivilis has four animated running legs, with tucked feet during jumps. Decorative trees and bushes scroll at different background speeds and never participate in collisions. Scenery and leg poses freeze with pause.

## Vercel hosting

The production configuration is in `vercel.json`: Vite framework, `npm ci`, typecheck plus production build, and static output from `dist/`. No custom domain, server or environment variables are needed.

Live production URL: **https://egenijaus-nuotykiai.vercel.app/**. Vercel project: `egenijaus-nuotykiai`. With Node and an authenticated Vercel CLI, link and deploy from this repository:

```sh
npx vercel link --project egenijaus-nuotykiai
npx vercel deploy --prod
```

On this HP, Node and the CLI can run through Docker. Local CLI cache/authentication lives in ignored `.vercel-cli/`; project linking lives in ignored `.vercel/`. Both are excluded from Docker images and deployment uploads. Vercel serves the production static build, so the Vite development hostname allowlist does not apply.

To publish future changes from this HP checkout (already authenticated and linked):

```sh
cd ~/projects/apps/eugenijus-bega
docker run --rm -v "$PWD:/app" -w /app -e npm_config_cache=/app/.vercel-cli/cache node:22-bookworm-slim npm exec --yes --package=vercel -- vercel deploy --prod --yes --global-config /app/.vercel-cli/auth
playwright-test tests/production_test.py
```

The public Vercel URL works directly in MacBook Chrome without the HP SSH tunnel. Xbox pairing stays on the MacBook.

### iPhone Safari audio

Audio is created/resumed directly in trusted tap/click/key handlers, including touch release, rather than waiting for the game loop. A silent one-sample buffer primes older Safari output. Where supported, Audio Session playback routing prevents the ringer switch from muting game audio. Phaser's unused sound manager is disabled so the game owns one audio context. After switching apps, return and tap to resume both game and audio. The Garsas button still controls all sound.

Run `playwright-test tests/mobile_audio_test.py` to check touch start and interruption recovery with a strict gesture requirement (Chromium and WebKit when installed). Real iPhone speaker routing still needs device testing; on older iOS, try turning Silent Mode off and raising media volume.
