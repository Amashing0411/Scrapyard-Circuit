# Scrapyard Circuit audio

This folder contains the game's active recorded speech, crowd ambience and the manifest that maps speech to events. The game prefers recorded audio and uses the browser's selected system voice only when it cannot safely find a recorded line for the current call.

## Active recorded speech

- `voicepack/individual/`: 146 Hank Ruiz and Sparkplug booth clips arranged in seven event folders.
- `voicepack/ring-names/`: 48 individual robot name recordings.
- `voicepack/referee/`: the referee's individual count from one through ten.
- `ring-open.mp3`: the recorded ring introduction.
- `manifest.json`: 205 active entries, each with a descriptive key, local path, speaker and transcript.

The announcer, booth and referee clips are prerecorded. Dynamic system-voice fallback is not another ElevenLabs recording and its tone varies by the browser's installed voices. No synthesis service or API key is called by the game.

## Crowd audio

- `arena-crowd-a.mp3` and `arena-crowd-b.mp3`: crowd loops used by venue mixes.
- `crowd-beds/`: four additional reusable fight-night loops.
- `crowd-shouts/`: eight recorded male and female one-shot calls for impacts, counters, danger and comebacks.

Six venue profiles combine the available loops at different levels and playback rates. Crowd calls are attached to major combat events, have venue-specific rate/gain changes, and fade in and out. They do not play on every punch. The same small crowd library is reused across venues; it is not a unique recorded audience for each stage.

The main menu also plays its selected venue crowd loop quietly behind the sparring preview. The title screen no longer speaks the game name through the browser TTS voice; the first key/click starts the loading music and enters the menu.

## Screen music

Screen music lives beside this folder:

- `audio/loading/`: title / press-to-enter screen.
- `audio/menu/`: main menu.
- `audio/index,garage etc/`: career, garage, workshop, index, exhibition, settings and help screens.
- Arena: no background music, including walkout and result states.

The title, menu and interior screens select a random track and crossfade when the screen changes. The menu and interior folders currently contain the same four tracks. Browser autoplay rules can delay the first audible track until the player clicks or presses a key.

## Voice selection and queue behavior

Recorded clips are chosen by speaker, event family and fighter-name safety. The first round has an exact `Round 1` recording; it is not allowed to reuse that clip for later rounds. If no safe clip is found, the selected browser voice speaks the generated line. The Settings screen has separate fallback voice selectors for Hank Ruiz and Sparkplug. Turn captions off in Settings if you want to hear the voices without text.

The speech queue prioritizes critical moments and does not stop a sentence already being spoken. It may discard old queued calls when newer high-priority action makes them stale. It caps queued items to avoid a long backlog.

## Rebuild the manifest

From the project root, run:

```sh
node voicepack/build-game-audio-manifest.cjs
```

This checks the active local assets, writes `manifest.json`, and embeds a copy in `Scrapyard-voice-integration.html` for local-file playback.
