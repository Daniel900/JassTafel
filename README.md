# Jass Tafel

A digital Jass Tafel (score board) for the **Schieber**, built for our own house rules.
It runs as a web app on a mobile phone. You can add it to the home screen as a PWA.
The whole game state lives **only in the browser** (localStorage), so a page reload keeps the current game.

## Features

- Split screen: each team has its own half. By default the top half is rotated 180° so the phone can lie between the teams (you can turn this off in the menu).
- **Melden** with card images: choose the meld type, then choose the highest card (also shown as an image) if the meld needs one.
- **Punkte**: one team enters its card points and the other team's points are calculated automatically. Melds are added according to the rules when the round is confirmed.
- **Trumpf indicator**: shows which team has Trumpf. It switches sides after every round, and you can tap it to correct it. You can also select the trump suit.
- **Target 1000**: each side shows how many points are still missing. As soon as a team reaches 1000, the winner is shown.
- Round counter, history, undo of the last round, team names and "Neues Spiel".

## Rules (as implemented)

**Cards:** a Skat deck from 7 to Ass, with no jokers.

| Card   | Normal | Trump |
| ------ | -----: | ----: |
| 7, 8   | 0      | 0     |
| 9      | 0      | 14    |
| 10     | 10     | 10    |
| Bauer  | 2      | 20    |
| Dame   | 3      | 3     |
| König  | 4      | 4     |
| Ass    | 11     | 11    |

The cards add up to 152 points, and the last trick adds 5, so a round is worth **157** points.
The other team's points are always 157 minus the entered value, so 157 : 0 is possible if the other team only won tricks without points.
If one team won **all tricks**, tap the **Match** preset next to the input field to give that team **257** points; the other team gets 0.

**Melden**

| Meld                  | Points | Selection      |
| --------------------- | -----: | -------------- |
| Dreiblatt             | 20     | highest card   |
| Vierblatt             | 50     | highest card   |
| Fünfblatt             | 100    | highest card   |
| Vierling (10/D/K/A)   | 100    | card type      |
| Vier Nell (all 9s)    | 150    | –              |
| Vier Buur (all Bauern)| 200    | –              |
| Steck (D+K trump)     | 20     | –              |

- Only the team with the **highest single meld** gets its melds counted (all of them), and only if that team made at least one card point.
- If that team made **no** card point, the **other team** gets its melds counted instead (if it has any).
- Melds are compared by points first. When the points are equal, Fünfblatt beats Vierling. After that, the higher card wins. If the cards are also equal, a sequence in the trump suit wins (if a trump suit is selected). If two melds are still exactly equal, the **team with Trumpf** wins.
- **Steck** always counts, even if the team made no points.
- Sequences longer than five cards are not handled.

**End of game:** the first team to reach **1000** points wins. If both teams pass 1000 in the same round, the higher total wins; on an exact tie, the team with Trumpf in that round wins.

The rules are in `src/domain/` (`cards.ts`, `scoring.ts`, `melds.ts`, `game.ts`). The game has a `mode` field (`'schieber'`), so a future **Steiger** can reuse the same rules.

## Development

```bash
npm install
npm run dev        # dev server on http://localhost:5173
npm test           # unit + component tests (Vitest, Testing Library)
npm run typecheck
npm run build      # production build into dist/
```

## Docker

```bash
docker build -t jasstafel .
docker run -p 8080:8080 jasstafel
scripts/smoke-test.sh jasstafel   # checks a running container end to end
```

The image is a static build served by an unprivileged nginx on port **8080**. It includes a `/healthz` endpoint and works with a read-only root filesystem.

### On your server (docker compose)

```bash
curl -O https://raw.githubusercontent.com/daniel900/jasstafel/main/docker-compose.yml
docker compose up -d
```

Optional: create a `.env` file (see `.env.example`) to change the image or port.
No database or other service is needed, because all data stays on the phone.
Put the app behind your reverse proxy (Traefik, Caddy, nginx, …) with HTTPS so it can be installed as a PWA.

> If the GHCR package is private, run `docker login ghcr.io` on the server first, or make the package public in the GitHub package settings.

## CI/CD pipeline (`.github/workflows/ci-cd.yml`)

1. **test**: `npm ci`, typecheck, tests and build (on every push and PR).
2. **docker**: builds the image, runs the smoke test against it, and on `main` or a `v*` tag pushes a multi-arch image (amd64/arm64) to `ghcr.io/daniel900/jasstafel` with the tags `latest`, `sha-…` and the semver version.
3. **deploy** (optional): connects to your server over SSH and runs `docker compose pull && docker compose up -d`.
   To turn it on:
   - Repository variable `DEPLOY_ENABLED=true`
   - Secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH` (the folder that contains `docker-compose.yml`), and optionally `DEPLOY_PORT`
   - An environment called `production`. You can add a manual approval step there if you like.

   If you don't want to use SSH, you can run [Watchtower](https://containrrr.dev/watchtower/) on the server to pull `:latest` automatically instead.
