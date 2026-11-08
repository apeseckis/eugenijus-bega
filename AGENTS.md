# Eugenijus bėga! — Codex project instructions

## Mission

Create a funny, original, family-friendly 2D one-button auto-runner.

Eugenijus is a round, clumsy baby hippopotamus running to the right.
Čivilis is a tiny policeman hedgehog chasing him, with a flashing
red/blue police light attached to his spines.

Milestone 1 is a fully playable mechanics prototype, not polished art.
Use original temporary cartoon shapes.

## Existing HP environment

- Read and obey `~/projects/AGENTS.md` and this project file.
- Read `AGENTS.project-init-backup.md`, if present, and preserve
  any still-relevant project-specific rules.
- Debian 13 host with Codex CLI, Docker Compose and Playwright Broker.
- Work within this repository.
- Do not modify shared Playwright infrastructure, global scripts,
  systemd, Tailscale, firewall settings or Codex sandbox.
- Do not push Git changes to an unapproved remote.

## Technology

- Phaser 4.2.1 + TypeScript + Vite.
- Use verified Phaser 4 APIs.
- Logical resolution: 1280x720 (16:9).
- Responsive canvas with FIT scaling.
- Docker Compose to host the game on HP.
- MacBook Chrome is the first target.
- Xbox controller connects to MacBook, not HP.
- Keep future iPad Safari compatibility in mind.
- No backend, database, accounts or authentication.

## Input

One universal ACTION:
- Xbox A (standard gamepad button index 0)
- Space keyboard key
- Mouse click
- Touch / tap

Input must use rising-edge detection.
Holding A or Space must never trigger repeated jumps.
Starting the game must not also trigger a jump.

Handle gamepad connection/disconnection gracefully.
Keyboard and pointer controls must always remain available.

## Gameplay

States: READY, RUNNING, PAUSED, CAUGHT.

Eugenijus runs automatically while the world moves left.
Čivilis is always visible behind Eugenijus.

A press while grounded makes Eugenijus jump.

Three hazards:
- Pit: real ground gap; falling causes capture.
- Leaves: temporary slow/stumble and -34 chase-gap points.
- Stone/ball: temporary tumble and -36 chase-gap points.

Chase gap:
- Starts at 100.
- Minimum 0 means capture.
- Three rapid minor collisions must cause capture.
- After 2.5 seconds without minor collisions, recover gap
  at 6 points per second until reaching 100.
- Recovery must be frame-rate independent.
- Each obstacle can damage only once.
- Minor-hit invulnerability lasts about 0.8 seconds.
- Pits are always dangerous regardless of invulnerability.
- Hedgehog distance must visually reflect the chase gap.

A capture produces a short, friendly, funny jail scene.
ACTION restarts the game.

No difficulty escalation in the first milestone.
First obstacle must appear after at least 3 seconds.
Obstacles must be spaced fairly for a young child.

Pause on window blur / hidden tab.
Resume only following a deliberate action.

## Graphics and sound

- Use original temporary Phaser Graphics shapes.
- Simple cartoon colors, playful bouncing animations.
- Flashing police light on Čivilis.
- Never copy characters or assets from existing games.
- Sound is optional in milestone 1.
- Any sound must be quiet and activated after user gesture.
- No sudden loud siren or autoplay.

## Architecture and tests

- Separate game logic from rendering where practical.
- Put tuning constants in a central configuration module.
- Use small readable TypeScript modules.
- Provide npm scripts: dev, build, typecheck, test.
- Vitest tests for chase mechanics and collision logic.
- Docker Compose must bind host 127.0.0.1:5173 only.
- Join external Docker network `dev-testing` with
  the alias `app-eugenijus-bega`.
- Use the existing Playwright Broker.
- Browser tests must target http://app-eugenijus-bega:5173/
  from the Playwright container, not localhost.
- Run real builds and tests; report actual results.
- Physical Xbox controller requires manual MacBook testing.
- Document commands in README.md.

## Reporting

When done, summarize:
1. Implemented functionality.
2. Exact startup and MacBook access commands.
3. Tests executed and results.
4. Known limitations and manual checks.
5. Changed files and Git commit hash if committed.

<!-- project-enable-playwright: managed section -->
## Browser tests (shared Playwright Broker)

- Write Python Playwright tests in `tests/`.
- Run from this project's root: `playwright-test tests/browser_test.py`.
- Requests/results are in `.playwright/requests/` and `.playwright/results/`.
- Browser accesses the running app using its unique Docker `dev-testing` DNS alias, **not** localhost.
- The app must be started separately and connected to `dev-testing`.
- Do not write to the shared runner's `scripts/` or `jobs/` directly.
- Do not change shared runner, Docker permissions, or sandbox settings.

## GitHub publishing

- Canonical repository: https://github.com/apeseckis/eugenijus-bega.
- The user authorizes committing and publishing completed future project changes to this repository. After relevant checks pass, commit and push changes there as part of finishing each implementation task, unless the user explicitly asks otherwise.
- Use the connected GitHub app when host Git authentication is unavailable; synchronize the local checkout with the published commit.
- Preserve existing remote history; never force-push.
- Keep credentials, .env files, .vercel/, .vercel-cli/, dependencies, build outputs and browser artifacts out of commits.
- Report the published commit hash when finishing work.
