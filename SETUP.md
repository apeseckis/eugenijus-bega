# Eugenijus bėga! — Setup and MacBook play

## HP: project initialization
cd ~/projects
project-init eugenijus-bega --type web
cd ~/projects/apps/eugenijus-bega
project-enable-playwright

## Codex
cd ~/projects/apps/eugenijus-bega
codex

Read AGENTS.md and tasks/001-mvp-playable.md.
Implement Task 001 completely, run tests and fix failures.

## After Codex implements the game

On HP:
cd ~/projects/apps/eugenijus-bega
docker compose up -d --build
docker compose ps

On MacBook terminal:
ssh -N -L 5173:127.0.0.1:5173 audrius@100.64.172.123

On MacBook Chrome:
http://localhost:5173/

Pair Xbox controller with MacBook in macOS Bluetooth settings.

If Mac port 5173 is busy:
ssh -N -L 5174:127.0.0.1:5173 audrius@100.64.172.123

Then open http://localhost:5174/

## Testing on HP
playwright-test tests/browser_test.py

## Stop game on HP
docker compose down

## Future iPad
Deploy production static build over HTTPS.
Use Safari with touch controls or compatible Xbox controller.
Do not expose the Vite development port publicly.
