# Word Rain

[![GitHub Pages visits](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fhits.sh%2Fapi%2Furns%2Foctopuskid.github.io%2Fword-rain&query=%24.total&label=page%20visits&color=caf17b&labelColor=314955&cacheSeconds=300)](https://octopuskid.github.io/word-rain/stats/)

Catch letters, spell words, and survive with shields and wildcards.

**[Play on itch.io](https://octopuskid.itch.io/word-rain)** · **[Play on GitHub Pages](https://octopuskid.github.io/word-rain/)** · **[Download the game](https://github.com/octopuskid/word-rain/releases/latest)**

**[Open the test page](https://octopuskid.github.io/word-rain/test.html)** — sandbox controls with separate settings and records.

## Watch how it was made

[**I let an AI develop and promote a game. Here's how.**](https://www.youtube.com/watch?v=6qs_zLBvUO4)

A behind-the-scenes video about building Word Rain, refining its rules, and publishing it with AI.

Designed by [octopuskid](https://github.com/octopuskid) and developed with ChatGPT. Built with HTML, CSS and JavaScript. Current stable version: **1.6.8**. GitHub Pages development version: **1.7.0-pre1**, with 120 words in each of the four sets (480 total entries). See [CHANGELOG.md](CHANGELOG.md) for release history.

**Continuing development? Let AI read the [project handover](docs/HANDOVER.md)** for the design, current state, code map, testing, publishing rules and roadmap.

## Add Word Rain to your website

See [the website hosting and embedding tutorial](HOSTING.md) for copy-and-paste iframe code, self-hosting steps, GitHub Pages setup and music credits.

## Stable and development releases

Stable releases include one HTML package and one APK. Full and Lite were merged in 1.6.3; neither optional recording is bundled. Unless a version is specified, stable updates increment the patch number. Development updates are HTML only and use the current stable version plus a sequence, such as `1.6.3.1`, `1.6.3.2`. Development builds are marked unverified if runtime testing is unavailable.

## Smaller HTML development build

Stable 1.6.8 includes those optimizations, a short start-screen introduction, expandable Quick rules below the target word and purple paper wildcards. The shared HTML is 82,552 bytes.

1.6.3.1 reduces the self-contained HTML from **99,248 to 81,887 bytes (17.5%)**. It minifies JavaScript/CSS/HTML, reuses identical embedded cloud paths and losslessly repacks the handwriting font as WOFF2. Original music, effects, all themes, offline play and the existing saved-data keys remain intact. Those changes are now included in stable 1.6.8 on itch.io and Android. See [OPTIMIZATION.md](OPTIMIZATION.md) for the build and verification details.

## Run the game

Play in a browser using either link above. For offline browser play, open the release `index.html`, or extract `word-rain.zip`. The game, original music, effects and handwriting font are self-contained. Optional recordings require an explicit download and an internet connection.

The Android APK requires Android 8.0+ and bundles the game, original music and sound effects for offline play, with local music importing. The single APK replaces either older Full or Lite in place.

**Install updates over your existing APK to keep scores, word stats, settings and unlocks. Do not uninstall first.** See [Android source and build instructions](android/README.md).

## Browser test lab

[**Open the GitHub Pages test lab**](https://octopuskid.github.io/word-rain/test.html) to drop current/following/random letters, ×, shields or wildcards. Set fixed falling speed (10–1,000 px/s), scheduled wave interval (0.1–10 seconds), count, position and overlap stacking. Automatic waves are optional; the interval is waves per second, not guaranteed drops when using the game's random-wave option. Pausing freezes the clock. The fixed speed deliberately overrides gameplay speed changes.

Enter 1–200 custom words of 2–16 letters A–Z, separated by spaces, commas or new lines. Apply resets the test run. One word can repeat safely. Keep hearts at 3 is on by default; turn it off for damage testing. The test lab has separate settings/records and does not alter regular game saves. No test APK is built, and the test page is not uploaded to itch.io. It uses the same collision/scoring code as the game. `npm run build` automatically rebuilds this test page alongside the game. Use `npm run build:test` for test-page-only maintenance. Test HP beside the hearts sets 0–3 HP and disables keep-hearts protection when changed. Drag the shield bar to set 0–2 shield health, or the speed bar to change the mode-limited speed multiplier and proportionally adjust fixed falling speed. These controls keep paused runs paused. A small TEST MODE badge identifies the top-left corner of the playfield. Test-page maintenance is announced in the page notice and changelog without creating a stable or development release.

Versioned standalone HTML snapshots are organized in [`versions/`](versions/); the live game and test page remain at the repository root.

## How to play

The start screen gives a short introduction. Open **Quick rules**, directly below the target word, for a reminder about mistakes, shields and perfection. Full rules remain below the game. Handwriting wildcards have a purple tile with pencil hatching and a dark ✦ symbol.

These rules apply to stable **1.6.8** on itch.io and Android and development **1.7.0-pre1** on GitHub Pages, including mode, Overcast and speed score multipliers.

### Controls and word sets

The current word appears faintly inside the falling-letter playfield, behind the drops. Completed letters show your progress; the underlined letter is the next one to catch. The background stays synchronized after wrong catches, word completions and restarts, and turns yellow with the 2× perfect bonus. It follows the handwriting style and shows the mixed-case sequence during the Rick challenge. The separate target display remains available for a clearer view.


The HTML edition uses a wide landscape playfield on PCs and tablets, with the target word and movement controls beside it on wider screens. Phones keep the portrait playfield and finger-drag controls. Narrow computer windows stack the target panel below the wide board. Falling speed, spawn timing, scoring, saved settings and unlocks are unchanged. PC landscape controls and the phone portrait layout are included in the shared source.


- Click and drag across the play area with your mouse to move the basket (finger-drag on phones). On PC, you can also hold ← / → or A / D, or hold the on-screen arrow buttons. Mouse hover alone does not move the basket.
- Catch the highlighted letter to spell the target word in order. An unshielded × costs one heart, breaks perfection and resets word progress. Unshielded wrong letters always break perfection and remove purple mode. In Normal, the first two consecutive wrong catches keep word progress; the third and later unshielded wrong catches reset it until a correct catch clears the counter. In Hard, every unshielded wrong letter resets progress. Shielded wrong catches always preserve progress and perfection, including a catch that shatters the shield.
- Use the header pause button or Space to pause/resume. Space also starts a game from the ready or game-over screen. Losing page focus pauses play.
- **Give up** pauses the run and asks for confirmation. Cancelling lets you continue; confirming ends the run without deleting records.

Open **Word set & difficulty** while ready, paused or finished to choose Classic, Nature, Space or Tricky. Development 1.7.0-pre1 expands each set to 120 words, while retaining all previous words. All sets are available. Normal uses 4–7 letter words; Hard uses 6–7 letter words. Words are shuffled. **Apply & start new game** ends the current run and starts with the new choices, keeping saved records. The options panel hides during active play.

### Automatic Android update checks

The APK checks the public GitHub **latest stable release** while the app is open, when a validated Wi-Fi/mobile connection is available. The APK attempts one update check when opened. It does not check again during that session, including after reconnection or returning from another app. An offline or failed attempt waits until the next fresh launch. Nothing runs after the app is closed, and offline play is unchanged.

Development tags, drafts, prereleases and releases without the standard APK are ignored. A newer stable version pauses the game and offers **View update** or **Later**, once per version. View update opens the GitHub release page in your browser; downloads and installation remain your choice. This small request sends no scores, word records, music, account credentials or device identifiers. GitHub receives the normal network request, including your IP address. Install the new APK over the existing app to retain records; do not uninstall first.

**Upgrading from 1.6.2:** install 1.6.3 manually from the release page once. The old 1.6.2 checker requires both Full/Lite assets and cannot recognize this merged release. The 1.6.3 checker accepts the single APK for later stable releases.

### Optional Overcast challenge

Enable **Overcast** in **Word set & difficulty** while ready, paused or finished. Opaque clouds cover the middle 50% of the playfield, leaving the upper and lower 25% clear. The earlier rounded cloud design, blue shading/highlights and pencil outlines are retained. Large puffs overlap in staggered back-to-front stacks like the creator’s sketch, rather than repeating small stamps or using continuous wave-shaped strips. Pause and confirmation dialogs always appear above the cloud layer. Both textures are embedded for offline play. The option defaults off, saves on this device, and can be changed while paused without restarting or resuming the run. It works in Normal, Hard and the Rick challenge. Clouds do not block drag controls or alter collisions, speed or spawning. Enabling Overcast multiplies newly earned points by 2 in 1.6.4.1.

### Score and hearts

**Each award = ceil(base points × mode × Overcast × current speed).**

| Factor | Value |
| --- | --- |
| Normal / Hard | 1 / 2 |
| Overcast off / on | 1 / 2 |
| Current speed | Displayed percentage ÷ 100 (180% = 1.8) |

| Event | Base points |
| --- | --- |
| Correct letter or wildcard | 10 |
| Completed word | 50 |
| Correct letter with perfect bonus | 20 |
| Completed word with perfect bonus | 100 |
| Wrong letter while scoring is active | 1 (never doubled by perfect bonus) |

Apply all factors, then **round each individual award upward to a whole point**, rather than rounding the total run score. Example: a correct catch in Hard + Overcast at 180% earns `ceil(10 × 2 × 2 × 1.8) = 72`; at 181% it earns `ceil(72.4) = 73`. A Normal clear-sky wrong catch at 135% earns `ceil(1.35) = 2`.

Use the current speed **before that catch changes speed**. The final letter and its word-completion bonus use the same pre-reward speed and pre-completion perfect-bonus state. After the sixth perfect word, subsequent awards use doubled base points. Existing saved best scores, including legacy fractions, are preserved and are never retroactively multiplied or rounded.

Three wrong letters in a row pause scoring: the third earns zero. The next correct letter or wildcard clears the pause without letter points; any resulting word-completion bonus still follows the formula. Later catches score normally. Hazards, shield pickups and the Rick challenge itself award no points.

Start with three hearts. Reaching zero ends the game. The shield table below explains heart loss and protection.

### Perfect words, the 2× bonus and healing

A word is perfect when completed without a catch that breaks perfection during that word. Missing a falling block does not affect perfection. Shield exceptions are listed below; shield pickups cannot restore perfection already lost for the current word.

In **both Normal and Hard**, completing six consecutive perfect words restores one heart, up to three, and activates 2× scoring for subsequent correct letters and word completions. The target word turns yellow and a text indicator shows the bonus. The sixth word earns the pre-bonus amount. Each further multiple of six perfect words can restore another heart; recovery at full health is skipped rather than stored. The bonus never stacks above 2×.

A catch that breaks perfection resets the streak and ends the bonus. Shielded wrong catches, a half-shield × catch and shield-pickup damage preserve perfection and the bonus, as specified below.

### Falling speed and spawn timing

| Speed rule | Normal | Hard |
| --- | --- | --- |
| Starting/minimum speed | 100% | 140% |
| Maximum speed | 220% | 260% |

Every two consecutive perfect words increase falling speed by **20 percentage points**. Each wrong letter lowers it by **5 percentage points**; each caught × lowers it by **20 percentage points**, including shielded catches. Speed stays within the selected difficulty's limits.

**Classic dropping is restored:** random hazards, skipped drop attempts and varied falling speeds create gaps and occasional small groups; overlapping blocks now resolve using the rules below. Each wave has one attempt normally, two attempts 15% of the time, or three attempts 3% of the time. Each attempt can still be skipped by the density reductions, so a wave can produce zero to three blocks. Several letters, including copies of a target character, may be on screen at once. Printed letters never change after spawning.

The wave interval decreases with active play time using the original schedule (`max(0.28, 0.77 − elapsed × 0.005)` seconds before frequency adjustments). Falling speeds also gradually increase with elapsed play time, up to the original cap, with a random speed offset per block. Ordinary falling speeds are scaled to **60% of the original classic pace** before the displayed multiplier is applied. The HUD still shows 100% at Normal’s starting speed; Hard’s 140% is 84% of the original 100% pace at the same elapsed time and random offset. This scaling does not change spawn intervals or the speed-linked frequency rule. The Rick sequence retains its separate fixed falling speed. Paused time does not advance the schedule. The Rick challenge retains its own sequence timing.

The **5% base-frequency increase** and **3% per 20 percentage points above the mode's starting speed** from 1.4.1 remain. The speed-linked increase is additive, interpolated between steps and capped at +18%; slowing down reduces it. Wave intervals are multiplied by the mean wave size (1.21) so extra attempts in multi-block waves do not independently inflate the expected density. The 35% letter-attempt and 50% hazard-attempt reductions are retained.

| Ordinary letter opportunity | Normal | Hard |
| --- | --- | --- |
| Current target letter | 20% | 8% |
| Following target letter | 5% | 5% |

Only these letter selections use evenly spaced weighted scheduling; hazards, pickups, positions and falling-speed offsets are random. The shares apply among actual ordinary letter drops, not every attempt or block. The following-letter selection is omitted at the final blank. A target already on screen does not suppress or defer another selection. Catching the following letter before it is needed counts as wrong. Consecutive identical target letters use the same character.

### Purple ✦ wildcard

Completing one perfect word in **either Normal or Hard** unlocks wildcard mode, shown by purple hearts. While unlocked, each actual non-× drop has a **1% wildcard chance in Normal** or **0.5% in Hard**. Shields retain their separate 3% share. Collision-created wildcards work in both modes, regardless of whether purple mode is unlocked.

A caught wildcard fills the next blank and behaves like a correct letter, including scoring-pause recovery; it preserves the word’s current perfection status. An unshielded wrong letter removes wildcard mode. Shielded wrong catches keep it, including the catch that shatters the shield. Another perfect word restores a lost mode.

### Overlapping blocks

Random waves, positions and falling speeds remain. When two tile hitboxes overlap in the visible falling area above the catcher line, resolve them immediately; touching edges alone do not count. These rules run before basket catches and also handle chains of overlapping blocks.

| Overlap | Result |
| --- | --- |
| Letter + letter | One purple wildcard, even outside wildcard mode |
| Letter + × | Keep the letter; remove × |
| × + × | One × |
| Shield + any other kind | Remove the shield; keep the other block |
| Shield + shield | One shield |
| Wildcard + letter | Keep the wildcard; remove the letter |
| Wildcard + × | Consume both; immediately fill the next blank as a correct catch |
| Wildcard + wildcard | Consume both; immediately complete the current word as perfect |

Merged blocks appear at the pair’s midpoint with their average falling speed. Removing a shield or hazard through overlap does not count as catching it and causes no heart loss, shield damage, speed penalty or perfection loss. A wildcard created by letters does not itself unlock purple mode; a perfect word does.

Automatic letter fills use the same points, scoring-pause recovery and word-completion rules as caught wildcards. The one-letter reward preserves any earlier perfection failure. The whole-word reward restores perfection for the current word and awards the remaining correct-letter points and one completion bonus; already-filled letters are not scored again. If scoring is paused, the first automatic fill resumes it for zero letter points, and later fills score normally. The six-word bonus boundary, regeneration, speed rewards, mobile word statistics and saved best all follow the regular completion path. An already-broken streak is not restored retroactively. Automatic rewards interrupt manual R-I-C-K input; the Rick challenge itself does not use overlap rules.

### Blue 🛡️ shield

Each actual non-× drop has a **3% chance of being a shield**, without unlock conditions. A full shield has two health points; a half shield has one.

| Catch | Hearts and shield | Perfection |
| --- | --- | --- |
| Shield with no shield equipped | Equip a full shield; no heart loss | Preserved |
| Shield with a full shield equipped | Lose two hearts; Normal removes all shield, Hard retains half | Preserved |
| Shield with a half shield equipped | Lose one heart; remove all shield | Preserved |
| × with a full shield | Shield shatters; no heart loss | Broken |
| × with a half shield | Shield shatters; lose one heart | Preserved |
| Wrong letter with any shield | Consume half a shield and keep word progress, including the catch that shatters it | Preserved |
| × without a shield | Lose one heart; reset word progress | Broken |
| Wrong letter without a shield | No heart loss. Normal: preserve progress for the first two consecutive wrong catches; reset on the third and later unshielded mistakes. Hard: reset progress every time | Broken |

Shielded wrong catches keep word progress and perfection, even when the shield shatters. Scoring rules and speed penalties still apply. Shield-pickup damage can end the game immediately.

### Rick challenge

**RICK is absent from every word set.** Catch the ordinary letters **R → I → C → K** consecutively yourself in any set or difficulty, even when they are wrong for the displayed word. Another caught letter interrupts the sequence; catching ×, a shield or a wildcard clears it. Missed drops and pausing do not clear it; starting a new game does. The fourth letter clears ordinary drops and starts the case-sensitive sequence `d Q w 4 w 9 W g X c Q`. Catch all eleven symbols. A miss is reported as failure only after the final symbol passes below the catcher line. Success unlocks the copper Rick color theme and resumes the main game.

The challenge adds no score or word records; the four trigger catches follow normal correct/wrong-letter scoring and penalties, with no extra word-completion award. Old RICK encounter/perfect records remain in Android statistics, but triggering the secret adds no RICK encounter. Its unlock is saved locally and survives app updates and word-stat resets. Pause, Give up and the Android Stats tab also work during the challenge.

### Appearance and sound

Word sets and colors are independent. Choose Lime, Mint, Blue or Coral, plus light/dark mode. Rick appears only after unlocking it. **Handwriting paper** overrides the palette with a lined notebook, original pen-stroke font, sketched tiles and basket, red hazards and blue shields. Color and light/dark controls are disabled while it is enabled; turning it off restores your chosen palette. Appearance changes while paused keep the current run.

The header keeps the theme, **BGM** and **SFX** switches in one row. Music is initially off and effects on; preferences are saved. Audio starts after a player gesture. Music follows active play and pauses with the game, Stats, game over or backgrounding.

The single edition includes the original generated tune **Pocket Forecast** and synthesized effects for catches, word completion/perfection, wildcard activation, speed increases, healing, heart loss and shield shattering. Wrong-letter catches play a distinct descending two-tone cue when **SFX is on**, including shielded mistakes, the third consecutive wrong catch and catches while scoring is paused. Its higher pitch and stronger attack help it stand out on phone speakers. SFX off mutes it; BGM can remain off independently. Perfect words play the perfect cue instead of the ordinary completion cue. **Carefree** and **Monkeys Spinning Monkeys** by Kevin MacLeod are optional downloads from this GitHub repository. Selecting an undownloaded song pauses play and asks before using Wi-Fi/mobile data (about 2.1 MB or 1.3 MB). Cancel makes no request. Downloads are checked against their expected size and SHA-256. Android retains verified tracks in private app storage for offline playback and updates; browsers keep them for the current session. Failed downloads leave original music available and can be retried. No recording is included in the HTML/ZIP/APK. Previously saved but unavailable tracks fall back to Pocket Forecast without a silent download.

Phone players can use **Choose local BGM** below the rules to select an audio file up to 24 MB for the current session. Nothing is uploaded. Select it again after reopening, or use **Use original BGM** to restore Pocket Forecast. Codec support depends on the browser/WebView. Actual heart loss and shield shattering request vibration on supported phones, independently of SFX.

### Android records and Stats

The Android app saves your personal best and a table of word encounters and perfect completions locally. A word is met when it becomes the target, including the first word of a new game; resetting progress on the same word does not add an encounter.

Opening **Word Stats** pauses play and hides pause/resume, Give up, BGM and SFX. The theme switch remains available. Returning to Game restores those controls. Returning to **Game** keeps the game paused until you choose to resume. **Reset word stats** requires confirmation and keeps your personal best, live game and unlocked themes.

## Source and privacy

The shared game is in `index.html`; Android adds its records UI during packaging. There are no accounts, ads, analytics, tracking or databases. The browser stores appearance/audio settings and the Rick unlock locally; the APK also stores personal best and word records. Clearing app data or uninstalling removes device records.

The original handwriting font is embedded for offline use. Rebuild it with `python tools/build_hand_font.py` (requires fontTools); `assets/word-rain-hand.woff` is the reusable asset. Reference photographs are not bundled or published. Android reads only audio selected through its document picker; no storage permission is requested. INTERNET and ACCESS_NETWORK_STATE support native update checks and player-approved optional music downloads, and VIBRATE supports haptics. The bundled game WebView still blocks network loads.

## Credits and licenses

Game code, the original handwriting font, **Pocket Forecast** and synthesized effects: **MIT**, as in [LICENSE](LICENSE).

**Carefree** and **Monkeys Spinning Monkeys** by **Kevin MacLeod (incompetech.com)** are separately licensed under **Creative Commons Attribution 4.0 International**. The optional repository recordings are re-encoded to 80 kbps mono MP3 for download size and loop during play. See [MUSIC-LICENSES.md](MUSIC-LICENSES.md) for source links, attribution and conversion notices. No artist endorsement is implied.

## Mobile icon

The launcher was redrawn from the author’s sketch: a yellow hatched W tile, purple hatched wildcard tile and black basket on paper. Android uses a resolution-independent vector with a 1024-unit viewport. A matching 1024×1024 PNG is included with release downloads. Rebuild the vector/SVG with `python tools/build_launcher_icon.py`; the optional PNG export requires CairoSVG.

## Project statistics

[Open the separate statistics dashboard](https://octopuskid.github.io/word-rain/stats/) for GitHub visitors, clones and release downloads, GitHub Pages visits, and itch.io page views and plays. Public download/page counters refresh automatically; private analytics are explicitly dated snapshots. [Definitions and maintenance](docs/STATS.md).

Overcast changes apply to the next new game. Toggling it while paused keeps the current run’s cloud visibility and scoring multiplier unchanged. **Apply & start new game** uses the selected setting; resuming the paused run keeps its original setting.
