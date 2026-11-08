# TASK 001 — Eugenijus bėga! — Playable MVP

## Objective

Implement a working, funny, one-button 2D auto-runner.
Do the actual implementation, not just a plan.

The game runs on the HP server and is played from MacBook Chrome
with a Bluetooth Xbox controller paired directly to the MacBook.

Read project AGENTS.md and inherited instructions before coding.

## A. Project setup

1. Create a Phaser 4.2.1 + TypeScript + Vite project.
2. Work in the existing repository, not a nested directory.
3. Configure build, typecheck and test scripts.
4. Create Dockerfile, compose.yaml, .dockerignore, .gitignore.
5. Run Vite on 0.0.0.0:5173 with strictPort enabled.
6. Explicitly allow the Docker hostname app-eugenijus-bega.
7. Bind host port only to 127.0.0.1:5173.
8. Connect the container to external dev-testing network.
9. Support 1280x720 16:9 responsive scaling.

## B. Characters and scene

Eugenijus:
- Friendly, round, clumsy baby hippo.
- Appears near the left third of the screen.
- Legs animate while running.
- Simple funny squash/stretch effects.

Čivilis:
- Small policeman hedgehog.
- Always visible behind Eugenijus.
- Red/blue flashing beacon on his back.
- His position changes based on chase distance.

Scene:
- Cartoon sky, ground, scrolling scenery.
- Simple temporary shapes, not finished sprites.
- Landscape orientation.

## C. Game states

READY:
- Show title "Eugenijus bėga!"
- Show "Spausk A arba SPACE"
- ACTION starts the game.

RUNNING:
- World scrolls.
- Eugenijus runs automatically.
- ACTION jumps while grounded.
- Show distance survived and controller status.

PAUSED:
- Enter automatically when browser loses focus.
- Freeze gameplay.
- ACTION deliberately resumes.

CAUGHT:
- Stop movement and obstacle spawning.
- Čivilis catches Eugenijus.
- Show a short funny jail animation.
- Display "Čivilis sugavo Eugenijų!"
- Show restart instructions.
- ACTION resets the full game.

## D. Universal controller

Implement:
- Xbox button A using Gamepad API or Phaser plugin.
- Space with preventDefault.
- Mouse click.
- Touchscreen tap.

All map to the same ACTION.

Required:
- No double-jump.
- No held-button repeat.
- No accidental jump on game start.
- Support gamepad reconnect.
- Display "Pultelis prijungtas" when detected.
- Work without a connected gamepad.

## E. Jump physics

- Eugenijus runs automatically at fixed speed.
- One ACTION makes him jump if grounded.
- Gravity returns him to ground.
- Target jump duration approximately 0.7–0.9 s.
- Generous collision hitboxes appropriate for a child.
- Configurable run speed, gravity and jump velocity.
- First obstacle arrives after at least 3 seconds.
- No impossible obstacle patterns.
- No speed increase during milestone 1.

## F. Obstacles

PIT:
- Actual missing ground section.
- Jump must clear the gap.
- Falling in causes immediate capture after brief fall animation.
- Minor-hit invulnerability does not protect from pits.

LEAF PILE:
- Jumping avoids collision.
- Touching triggers about 0.5 s slow/trudge animation.
- Reduce chase gap by 34.
- Čivilis approaches.

STONE / BALL:
- Jumping avoids collision.
- Touching causes a comic fall/stumble.
- Recover and continue running after about 0.5 s.
- Reduce chase gap by 36.

Every obstacle can inflict damage only once.
After minor collision grant about 0.8 s protection
against additional minor collisions.

## G. Chase system

Implement a chaseGap variable from 0 to 100.

- Initial gap: 100.
- Leaf collision: -34.
- Stone collision: -36.
- Three quick collisions must catch Eugenijus.
- One or two collisions must be survivable.
- After 2.5 seconds without a minor hit, recover
  at 6 points per second.
- Maximum gap: 100.
- Recovery must be independent of frame rate.
- Visual separation of characters changes with gap.
- At 0, trigger CAUGHT state.
- Full restart resets chaseGap to 100.

## H. Optional sound

Add subtle siren/beep only if easy.
Respect autoplay restrictions.
Default to gentle volume or muted.
Avoid spending milestone 1 on audio.

## I. Automated tests

Use Vitest to test:
- Initial chase gap is 100.
- Three quick minor hits cause capture.
- One or two hits alone do not cause capture.
- Recovery starts after 2.5 seconds.
- Recovery is frame-rate independent.
- Chase gap cannot exceed 100 or fall below 0.
- Restart resets state.
- One obstacle cannot cause repeated damage.

Run:
- npm run typecheck
- npm run build
- npm test
- docker compose config -q
- docker compose up -d --build
- docker compose ps
- curl -I http://127.0.0.1:5173/

Create tests/browser_test.py using the existing Playwright Broker.
Inside Runner use:
http://app-eugenijus-bega:5173/

Browser smoke test:
- Game loads.
- READY screen is present.
- Space starts the game.
- Game enters RUNNING.
- Screenshot is captured.
- Retry can be tested deterministically if practical.

If needed, expose a minimal non-sensitive DOM game-state
indicator for browser automation.

Run:
playwright-test tests/browser_test.py

Do not modify shared Playwright infrastructure to make tests pass.

## J. Required README

Include:
- Installation and build instructions.
- Docker start and stop.
- Automated testing.
- MacBook SSH tunnel.
- Local browser URL.
- Xbox Bluetooth pairing.
- Keyboard fallback.
- Troubleshooting.

## Definition of done

The game is genuinely playable on MacBook with Space and click.
Xbox A input is implemented and documented for manual testing.
Eugenijus jumps and avoids hazards.
Čivilis visibly approaches after collisions.
After clean running, Čivilis moves back.
Three rapid minor collisions cause capture.
Falling into a pit causes capture.
Jail and restart screens work.
No public server ports are exposed.
Automated tests are executed and reported accurately.

Implement, test and fix as much as possible autonomously.
Do not wait for polished graphics before completing gameplay.
