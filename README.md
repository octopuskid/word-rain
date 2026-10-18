# Word Rain

Catch letters, spell words, and survive with shields and wildcards.

**[Play on itch.io](https://octopuskid.itch.io/word-rain)** · **[Play on GitHub Pages](https://octopuskid.github.io/word-rain/)** · **[Download Full or Lite](https://github.com/octopuskid/word-rain/releases/latest)**

Designed by [octopuskid](https://github.com/octopuskid) and developed with ChatGPT. Built with HTML, CSS and JavaScript. Current version: **1.4.3**. See [CHANGELOG.md](CHANGELOG.md) for release history.

## Run the game

Play in a browser using either link above. For offline browser play, extract the repository ZIP with `assets/music/` intact and open `index.html`. Opening just the HTML keeps the original generated music; the two additional recordings require their MP3 files. The Lite HTML is self-contained and omits those recordings.

The Android APK requires Android 8.0+ and bundles the game for offline play. **Full** includes all three built-in tracks. **Lite** keeps the original music, sound effects and local-music importing, without the two additional recordings. Both editions share the same app identity and replace each other rather than installing side by side.

**Install updates over your existing APK to keep scores, word stats, settings and unlocks. Do not uninstall first.** See [Android source and build instructions](android/README.md).

## How to play

### Controls and word sets

- Drag across the play area to move the basket. Browser players can also use the on-screen arrows; keyboard players can use the left/right arrow keys.
- Catch the highlighted letter to spell the target word in order. A wrong letter resets progress on that word.
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
| Wrong letter while scoring is active | +1 | +1.5 |

Hard awards 1.5× Normal points, including half-points. Wrong-letter points never receive the 2× perfect bonus. After three consecutive wrong letters, scoring pauses: the third wrong catch earns nothing. The next correct letter or wildcard clears the pause without awarding letter points; subsequent catches score normally.

Start with three hearts. Reaching zero ends the game. The shield table below explains heart loss and protection.

### Perfect words, the 2× bonus and healing

A word is perfect when completed without a catch that breaks perfection during that word. Missing a falling block does not affect perfection. Shield exceptions are listed below; shield pickups cannot restore perfection already lost for the current word.

In **both Normal and Hard**, completing six consecutive perfect words restores one heart, up to three, and activates 2× scoring for subsequent correct letters and word completions. The target word turns yellow and a text indicator shows the bonus. The sixth word earns the pre-bonus amount. Each further multiple of six perfect words can restore another heart; recovery at full health is skipped rather than stored. The bonus never stacks above 2×.

A catch that breaks perfection resets the streak and ends the bonus. Shielded wrong catches, a half-shield × catch and shield-pickup damage preserve perfection and the bonus, as specified below.

### Falling speed and spawn timing

| Speed rule | Normal | Hard |
| --- | --- | --- |
| Starting/minimum speed | 100% | 160% |
| Maximum speed | 220% | 280% |

Every two consecutive perfect words increase falling speed by **20 percentage points**. Each wrong letter lowers it by **5 percentage points**; each caught × lowers it by **20 percentage points**, including shielded catches. Speed stays within the selected difficulty's limits.

**Classic dropping is restored:** random hazards, skipped drop attempts and varied falling speeds create gaps, overlaps and occasional small groups. Each wave has one attempt normally, two attempts 15% of the time, or three attempts 3% of the time. Each attempt can still be skipped by the density reductions, so a wave can produce zero to three blocks. Several letters, including copies of a target character, may be on screen at once. Printed letters never change after spawning.

The wave interval decreases with active play time using the original schedule (`max(0.28, 0.77 − elapsed × 0.005)` seconds before frequency adjustments). Falling speeds also gradually increase with elapsed play time, up to the original cap, with a random speed offset per block. The displayed speed multiplier is applied on top of that classic pace. Paused time does not advance the schedule. The Rick challenge retains its own sequence timing.

The **5% base-frequency increase** and **3% per 20 percentage points above the mode's starting speed** from 1.4.1 remain. The speed-linked increase is additive, interpolated between steps and capped at +18%; slowing down reduces it. Wave intervals are multiplied by the mean wave size (1.21) so extra attempts in multi-block waves do not independently inflate the expected density. The 35% letter-attempt and 50% hazard-attempt reductions are retained.

| Ordinary letter opportunity | Normal | Hard |
| --- | --- | --- |
| Current target letter | 20% | 8% |
| Following target letter | 5% | 8% |

Only these letter selections use evenly spaced weighted scheduling; hazards, pickups, positions and falling-speed offsets are random. The shares apply among actual ordinary letter drops, not every attempt or block. The following-letter selection is omitted at the final blank. A target already on screen does not suppress or defer another selection. Catching the following letter before it is needed counts as wrong. Consecutive identical target letters use the same character.

### Purple ✦ wildcard

Normal mode only: completing one perfect word unlocks wildcard mode, shown by purple hearts. While unlocked, each actual non-× drop has a **1.5% chance of being a wildcard**. Hard has no wildcard mode or drops.

A wildcard fills the next blank and behaves like a correct letter, including scoring-pause recovery; it preserves perfection. An unshielded wrong letter removes wildcard mode. Shielded wrong catches keep it, including the catch that shatters the shield. Another perfect word restores a lost mode.

### Blue 🛡️ shield

Each actual non-× drop has a **3% chance of being a shield**, without unlock conditions. A full shield has two health points; a half shield has one.

| Catch | Hearts and shield | Perfection |
| --- | --- | --- |
| Shield with no shield equipped | Equip a full shield; no heart loss | Preserved |
| Shield with a full shield equipped | Lose two hearts; Normal removes all shield, Hard retains half | Preserved |
| Shield with a half shield equipped | Lose one heart; remove all shield | Preserved |
| × with a full shield | Shield shatters; no heart loss | Broken |
| × with a half shield | Shield shatters; lose one heart | Preserved |
| Wrong letter with any shield | Consume half a shield, including the catch that shatters it | Preserved |
| × without a shield | Lose one heart | Broken |
| Wrong letter without a shield | No heart loss; reset word progress | Broken |

Word-progress resets, scoring rules and speed penalties still apply to shielded wrong catches. Shield-pickup damage can end the game immediately.

### Rick challenge

**RICK is absent from every word set.** Catch the ordinary letters **R → I → C → K** consecutively yourself in any set or difficulty, even when they are wrong for the displayed word. Another caught letter interrupts the sequence; catching ×, a shield or a wildcard clears it. Missed drops and pausing do not clear it; starting a new game does. The fourth letter clears ordinary drops and starts the case-sensitive sequence `d Q w 4 w 9 W g X c Q`. Catch all eleven symbols. A miss is reported as failure only after the final symbol passes below the catcher line. Success unlocks the copper Rick color theme and resumes the main game.

The challenge adds no score or word records; the four trigger catches follow normal correct/wrong-letter scoring and penalties, with no extra word-completion award. Old RICK encounter/perfect records remain in Android statistics, but triggering the secret adds no RICK encounter. Its unlock is saved locally and survives app updates and word-stat resets. Pause, Give up and the Android Stats tab also work during the challenge.

### Appearance and sound

Word sets and colors are independent. Choose Lime, Mint, Blue or Coral, plus light/dark mode. Rick appears only after unlocking it. **Handwriting paper** overrides the palette with a lined notebook, original pen-stroke font, sketched tiles and basket, red hazards and blue shields. Color and light/dark controls are disabled while it is enabled; turning it off restores your chosen palette. Appearance changes while paused keep the current run.

The header keeps the theme, **BGM** and **SFX** switches in one row. Music is initially off and effects on; preferences are saved. Audio starts after a player gesture. Music follows active play and pauses with the game, Stats, game over or backgrounding.

Both editions include the original generated tune **Pocket Forecast** and synthesized effects for catches, word completion/perfection, wildcard activation, speed increases, healing, heart loss and shield shattering. Perfect words play the perfect cue instead of the ordinary completion cue. Full also offers **Carefree** and **Monkeys Spinning Monkeys** by Kevin MacLeod. The built-in track choice is saved; an unavailable Full track falls back to Pocket Forecast in Lite.

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
