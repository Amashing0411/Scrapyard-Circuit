# Scrapyard Circuit

Robot boxing in your browser. Build it, fight it, scrap it.

Build a bot from parts, or weld your own head and chassis. Then coach it from the corner or take the controls yourself, and climb from the scrapyard to the title. Beat 3 bots in a league to open the next one. The Foreman waits at the top.

No install, account or build step. The whole game is static HTML, CSS and JavaScript.

## What's in the game

- **Career:** win purses to buy better parts, crews, chips and signature moves.
- **Fight now and Exhibition:** quick fights with no stakes, or pick two bots and a venue and watch.
- **Local versus:** two players on one keyboard or two controllers.
- **Create bot and Workshop:** parts, paint, story, fight plan and crew, across 48 registered fighters in 4 leagues.
- **Damage you can see:** parts crack, tear off and develop conditions such as oil spills, jammed gears and sensor glitches.
- **Tells and feints:** a red banner shows a signature move coming. A grey banner is a feint, so don't bite.
- **Destroy or Spare:** after a stoppage, the winner decides. Destroy pays a crowd bonus and salvage; Spare pays for sportsmanship.
- **Fight-night sound:** recorded commentary, ring names, a referee count and crowds that change by venue.

## Controls

### Keyboard

| Action | Coach mode | Pilot mode |
|---|---|---|
| Fight | `1` Head hunt, `2` Body work, `3` Cover up, `4` Haymaker | `J` jab, `K` cross, `L` hook, `I` uppercut |
| Move | Your bot moves on its own | `A` `D` or arrows move, `W` `S` change lanes |
| Defend | Use Cover up | `Q` `E` slip, hold `Shift` to guard, `X` clinch |
| Signature move | Your bot chooses when | `F` |

| In any fight | Key |
|---|---|
| Switch between Coach and Pilot | `C` |
| Get up after a knockdown (when the needle is in the green) | `Space` or tap |
| Destroy or Spare | `D` or `S` |
| Pause | `Esc` |

### Controller

| Input | Action |
|---|---|
| Stick or d-pad | Move |
| `A` `B` `X` `Y` | Pilot: jab, cross, hook, uppercut. Coach: the four calls |
| `LB` `RB` | Slip |
| `LT` | Guard |
| `RT` | Signature move |
| `Back` | Switch between Coach and Pilot |
| `Start` | Pause |

In menus, `A` selects and `B` goes back. The in-game **How to play** screen covers the rest.

## Run it locally

Use a local web server, because the game loads its audio list over HTTP:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy on Vercel

1. Import this repository at [vercel.com/new](https://vercel.com/new).
2. Set **Framework Preset** to **Other**, and leave the build command and output directory empty.
3. Click **Deploy**.

Each push to `main` redeploys the site. Once it's served over HTTPS, the game can also be installed as an app, and audio it has played is cached for offline use.

## What's in this repository

| Path | Contents |
|---|---|
| `index.html` | The whole game |
| `manifest.webmanifest`, `sw.js`, `icon-*.png` | App install and offline cache |
| `audio/commentary/` | Commentary, ring names, referee count and crowd audio ([details](audio/commentary/README.md)) |

## Good to know

- **No menu or loading music:** this build ships without screen music. To add your own, put tracks you have the rights to in the repository and list them in `SCREEN_MUSIC_TRACKS` in `index.html`.
- **Saves stay in your browser:** progress is kept in local storage, so clearing site data removes it.
- **Voices:** the booth commentary was generated with ElevenLabs and prerecorded. Lines without a matching recording, such as ones with names or scores, use your browser's built-in voice, so they sound different by device.
