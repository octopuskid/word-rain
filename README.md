# Word Rain

Catch letters, spell words, and survive with shields and wildcards.

**[Play on itch.io](https://octopuskid.itch.io/word-rain)** · **[Play on GitHub Pages](https://octopuskid.github.io/word-rain/)** · **[Download Full or Lite](https://github.com/octopuskid/word-rain/releases/latest)**

## Watch how it was made

[**I let an AI develop and promote a game. Here's how.**](https://www.youtube.com/watch?v=6qs_zLBvUO4)

A behind-the-scenes video about building Word Rain, refining its rules, and publishing it with AI.

Designed by [octopuskid](https://github.com/octopuskid) and developed with ChatGPT. Built with HTML, CSS and JavaScript. Current version: **1.5.3**. See [CHANGELOG.md](CHANGELOG.md) for release history.

## Run the game

Play in a browser using either link above. For offline browser play, extract the repository ZIP with `assets/music/` intact and open `index.html`. Opening just the HTML keeps the original generated music; the two additional recordings require their MP3 files. The Lite HTML is self-contained and omits those recordings.

The Android APK requires Android 8.0+ and bundles the game for offline play. **Full** includes all three built-in tracks. **Lite** keeps the original music, sound effects and local-music importing, without the two additional recordings. Both editions share the same app identity and replace each other rather than installing side by side.

**Install updates over your existing APK to keep scores, word stats, settings and unlocks. Do not uninstall first.** See [Android source and build instructions](android/README.md).

## How to play

### Controls and word sets

The current word appears faintly inside the falling-letter playfield, behind the drops. Completed letters show your progress; the underlined letter is the next one to catch. The background stays synchronized after wrong catches, word completions and restarts, and turns yellow with the 2× perfect bonus. It follows the handwriting style and shows the mixed-case sequence during the Rick challenge. The separate target display remains available for a clearer view.


The HTML edition uses a wide landscape playfield on PCs and tablets, with the target word and movement controls beside it on wider screens. Phones keep the portrait playfield and finger-drag controls. Narrow computer windows stack the target panel below the wide board. Falling speed, spawn timing, scoring, saved settings and unlocks are unchanged. PC landscape controls and the phone portrait layout are included in the shared source.


- Click and drag across the play area with your mouse to move the basket (finger-drag on phones). On PC, you can also hold ← / → or A / D, or hold the on-screen arrow buttons. Mouse hover alone does not move the basket.
- Catch the highlighted letter to spell the target word in order. An unshielded × costs one heart, breaks perfection and resets word progress. Wrong letters keep word progress; without a shield they still break perfection and remove purple mode.
- Use the header pause button or Space to pause/resume. Space also starts a game from the ready or game-over screen. Losing page focus pauses play.
- **Give up** pauses the run and asks for confirmation. Cancelling lets you continue; confirming ends the run without deleting records.

Open **Word set & difficulty** while ready, paused or finished to choose Classic, Nature, Space or Tricky. All sets are available. Normal uses 4–7 letter words; Hard uses 6–7 letter words. Words are shuffled. **Apply & start new game** ends the current run and starts with the new choices, keeping saved records. The options panel hides during active play.

### Score and hearts

| Event | Normal | Hard |
| --- | --- | --- |
| Correct letter | +10 | +15 |
| Completed word | +50 | +75 |
| Correct letter with the 2× perfect bonus | +20 | +30 |
| Completed word with the 2× perfect bonus | +100 | +150 |
| Wrong letter while scoring is active | +1 | +2 |

Hard awards 1.5× Normal points for correct letters and word completions. Active-scoring wrong-letter catches award +2 in Hard (+1 in Normal); these points never receive the 2× perfect bonus. Existing saved scores, including legacy half-points, are preserved. After three consecutive wrong letters, scoring pauses: the third wrong catch earns nothing. The next correct letter or wildcard clears the pause without awarding letter points; subsequent catches score normally.

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
| Wrong letter without a shield | No heart loss; keep word progress | Broken |

Shielded wrong catches keep word progress and perfection, even when the shield shatters. Scoring rules and speed penalties still apply. Shield-pickup damage can end the game immediately.

### Rick challenge

**RICK is absent from every word set.** Catch the ordinary letters **R → I → C → K** consecutively yourself in any set or difficulty, even when they are wrong for the displayed word. Another caught letter interrupts the sequence; catching ×, a shield or a wildcard clears it. Missed drops and pausing do not clear it; starting a new game does. The fourth letter clears ordinary drops and starts the case-sensitive sequence `d Q w 4 w 9 W g X c Q`. Catch all eleven symbols. A miss is reported as failure only after the final symbol passes below the catcher line. Success unlocks the copper Rick color theme and resumes the main game.

The challenge adds no score or word records; the four trigger catches follow normal correct/wrong-letter scoring and penalties, with no extra word-completion award. Old RICK encounter/perfect records remain in Android statistics, but triggering the secret adds no RICK encounter. Its unlock is saved locally and survives app updates and word-stat resets. Pause, Give up and the Android Stats tab also work during the challenge.

### Appearance and sound

Word sets and colors are independent. Choose Lime, Mint, Blue or Coral, plus light/dark mode. Rick appears only after unlocking it. **Handwriting paper** overrides the palette with a lined notebook, original pen-stroke font, sketched tiles and basket, red hazards and blue shields. Color and light/dark controls are disabled while it is enabled; turning it off restores your chosen palette. Appearance changes while paused keep the current run.

The header keeps the theme, **BGM** and **SFX** switches in one row. Music is initially off and effects on; preferences are saved. Audio starts after a player gesture. Music follows active play and pauses with the game, Stats, game over or backgrounding.

Both editions include the original generated tune **Pocket Forecast** and synthesized effects for catches, word completion/perfection, wildcard activation, speed increases, healing, heart loss and shield shattering. Wrong-letter catches play a distinct descending two-tone cue when **SFX is on**, including shielded mistakes, the third consecutive wrong catch and catches while scoring is paused. Its higher pitch and stronger attack help it stand out on phone speakers. SFX off mutes it; BGM can remain off independently. Perfect words play the perfect cue instead of the ordinary completion cue. Full also offers **Carefree** and **Monkeys Spinning Monkeys** by Kevin MacLeod. The built-in track choice is saved; an unavailable Full track falls back to Pocket Forecast in Lite.

Phone players can use **Choose local BGM** below the rules to select an audio file up to 24 MB for the current session. Nothing is uploaded. Select it again after reopening, or use **Use original BGM** to restore Pocket Forecast. Codec support depends on the browser/WebView. Actual heart loss and shield shattering request vibration on supported phones, independently of SFX.

### Android records and Stats

The Android app saves your personal best and a table of word encounters and perfect completions locally. A word is met when it becomes the target, including the first word of a new game; restarting it after a wrong catch does not add an encounter.

Opening **Word Stats** pauses play and hides the pause/resume button. Returning to **Game** keeps the game paused until you choose to resume. **Reset word stats** requires confirmation and keeps your personal best, live game and unlocked themes.

## Source and privacy

The shared game is in `index.html`; Android adds its records UI during packaging. There are no accounts, ads, analytics, tracking or databases. The browser stores appearance/audio settings and the Rick unlock locally; the APK also stores personal best and word records. Clearing app data or uninstalling removes device records.

The original handwriting font is embedded for offline use. Rebuild it with `python tools/build_hand_font.py` (requires fontTools); `assets/word-rain-hand.woff` is the reusable asset. Reference photographs are not bundled or published. Android reads only audio selected through its document picker and requests neither storage nor internet permission; vibration uses its normal VIBRATE permission.

## Credits and licenses

Game code, the original handwriting font, **Pocket Forecast** and synthesized effects: **MIT**, as in [LICENSE](LICENSE).

**Carefree** and **Monkeys Spinning Monkeys** by **Kevin MacLeod (incompetech.com)** are separately licensed under **Creative Commons Attribution 4.0 International**. Full tracks are re-encoded to 80 kbps mono MP3 for package size and loop during play. See [MUSIC-LICENSES.md](MUSIC-LICENSES.md) for source links, attribution and conversion notices. No artist endorsement is implied.
