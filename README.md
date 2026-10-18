# Word Rain

A browser arcade game: catch letters, spell words, and survive with shields and wildcards.

**[Play on itch.io](https://octopuskid.itch.io/word-rain)** · **[Play on GitHub Pages](https://octopuskid.github.io/word-rain/)**

Designed by [octopuskid](https://github.com/octopuskid) and developed with ChatGPT. Built with HTML, CSS, and JavaScript, with no external dependencies or build step.

## Android app

[Download the offline Android APK](https://github.com/octopuskid/word-rain/releases/latest) (Android 8.0+). The game is bundled inside the app and works without internet access. The Android version also saves a personal best and a Word Stats table locally, with bottom navigation tabs. See [Android source and build instructions](android/README.md).

## Play

Download the repository ZIP, extract it with the `assets/music/` directory intact, and open `index.html` in a modern browser. The game and all included music work offline. Opening only the HTML retains the original generated tune; Kevin MacLeod tracks need their bundled MP3 files.

- Drag across the game area, use the on-screen arrow buttons, or press the left/right arrow keys.
- Catch letters in order to complete words of 4–7 letters.
- Use the pause button or press Space to pause/resume. Space also starts a new game from the start or game-over screen.
- The game pauses when the page loses focus.

## Scoring and hearts

- Normal: correct letter +10, completed word +50; Hard awards 1.5× (+15 / +75).
- The six-perfect-word 2× bonus stacks with Hard: +30 per correct catch and +150 per completed word. The sixth word itself still earns the pre-bonus amount.
- Wrong letter: +1 in Normal or +1.5 in Hard while scoring is active; word progress resets. Wrong-letter points do not receive the perfection bonus. Half-points are displayed and saved exactly.
- Three consecutive wrong letters pause scoring; the third earns no point. A correct catch clears the pause without awarding points, then normal scoring resumes.
- Start with three hearts. Reaching zero ends the game.

## Perfect words, speed, and healing

A word is perfect if it is completed without a disqualifying catch during that word. Uncaught drops do not affect perfection. Shield exceptions are described below.

- Every two consecutive perfect words increase falling speed by 20 percentage points, capped at 220% in Normal or 280% in Hard. Hard starts at 160%.
- Each wrong letter lowers speed by 5 percentage points; each caught × lowers it by 20 percentage points. Speed cannot fall below 100% in Normal or 160% in Hard.
- Every six consecutive perfect words restore one heart, capped at three. Rewards at full health are skipped, not stored.

## Special blocks

### Purple ✦ wildcard

In Normal only, one perfect word unlocks wildcard mode. Hard has no wildcards. Each non-× drop has a 1.5% chance of being a wildcard while the mode is active. A wildcard fills the next blank and behaves like a normal correct catch, including scoring-pause recovery. It preserves perfection. Hearts turn purple while this mode is active. Catching an unshielded wrong letter removes the mode; shielded wrong catches keep it, including the catch that breaks the shield. Another perfect word restores a lost mode.

### Blue 🛡️ shield

Each non-× drop has a 3% chance of being a shield, without unlock conditions. Picking one up equips a full shield with two health points.

| Event | Result |
| --- | --- |
| Pick up a shield with no shield | Equip a full shield; no heart loss; preserve perfection |
| Pick up a shield with a full shield | Lose two hearts; Normal removes all shield, Hard retains half; preserve perfection |
| Pick up a shield with a half shield | Lose one heart; remove all shield; preserve perfection |
| Catch × with a full shield | Shield shatters; no heart loss; lose perfection |
| Catch × with a half shield | Shield shatters; lose one heart; preserve perfection |
| Catch a wrong letter while shielded | Consume half a shield; preserve perfection, including the catch that shatters it |
| Catch × without a shield | Lose one heart and perfection |
| Catch a wrong letter without a shield | Lose perfection |

Scoring, word-progress and speed penalties still apply during shielding. The 2× score bonus ends only when perfection breaks, following the shield exceptions above. Shield pickups do not restore perfection already lost for the current word. Shield pickup damage can end the game immediately.

## Letter generation

Ordinary letter opportunities use balanced, evenly spaced selections: Normal 20% current / 5% following letter, Hard 8% / 8%. The following-letter rule is skipped on the final letter. If that target character is already falling above the catcher line, that opportunity becomes a distractor rather than another copy; there is no backlog or catch-up swarm. Thus actual target frequency may be lower while a copy is still on screen. Existing printed letters never change. All drops share a fixed cadence (about 1.27 seconds) and the same falling speed at a given speed multiplier. The cadence preserves the original initial average density after the 35% letter-density and 50% hazard reductions; elapsed time no longer silently increases density. Hazards, pickups and target opportunities use smooth weighted scheduling. Spawn positions cover all six lanes in shuffled rounds.

Letter drop density is reduced by 35% relative to the initial spawning schedule; × drops are reduced by 50%. Shields and wildcards share non-× drop opportunities. The spawning interval gradually decreases during a run.

## Source and privacy

The complete game is in `index.html`. The browser game contains no analytics, tracking, account login, database, or high-score storage. It saves theme/settings and the Rick unlock locally. The APK additionally saves the personal best and word records on the device. The shield emoji is rendered by the browser/system font; no third-party image or font files are bundled.

## License

MIT. See [LICENSE](LICENSE). This permits modification, redistribution, and commercial reuse with the required notices retained. No warranty is provided.

## Word sets and Perfect bonus (v1.2.0)

Open **Word set & difficulty** to choose any of the four freely available sets: Classic (lime), Nature (mint), Space (blue), or Tricky (coral). Each palette works with both light and dark mode. Normal uses 4–7 letter words; Hard uses the 6–7 letter words from your chosen set. Apply & start new game begins a fresh round and keeps saved records. Choices are saved locally.

In **both Normal and Hard**, six consecutive perfect word completions restore one heart (up to three) and activate 2× scoring for subsequent correct catches (+20) and word completions (+100). The sixth word itself earns normal points. The target word becomes yellow, and a text indicator shows the bonus. The same streak restores another heart at each further multiple of six, skipping recovery at full health. Points never stack above 2×.

The bonus stays active until perfection breaks. An unshielded wrong letter, an unshielded ×, or a × caught with a full shield ends it and resets the perfect streak. Shielded wrong letters (including the shield-breaking catch) and a half-shield × preserve perfection and the bonus. Shield pickup damage also preserves perfection. Wildcards are normal correct catches in Normal mode. The existing three-wrong-catch scoring pause still applies; a catch that clears this pause earns no letter points.

## Rick challenge and giving up

Completing **RICK** in Classic / Normal clears all ordinary drops and starts the mixed-case sequence `d Q w 4 w 9 W g X c Q`. Symbols fall individually. All eleven must be caught; an earlier miss still lets the sequence finish, and failure is reported only after the last symbol passes below the catcher line. Success unlocks the copper Rick palette, selectable under **Color theme**, and resumes the normal game. The challenge itself adds no points or word records; spelling the initial RICK target uses normal scoring. The unlock is saved locally and survives app updates and word-stat resets.

**Give up** in the header pauses the run and asks for confirmation. Keep playing cancels; confirming ends the run without deleting records or unlocked themes. Stats still pauses automatically and requires manual resume on return, including during the Rick challenge.

## Hard-mode update (v1.2.1)

The word-set/difficulty/color-theme panel hides during active play and returns on pause, game over or the ready screen. Hard starts at 160% speed (minimum 160%, maximum 280%); Normal remains 100–220%. Hard regular-letter rolls use 8% current letter and 8% following letter, with the latter skipped at the final blank. Hard has no wildcard unlocks or drops. In Hard, a full-shield duplicate pickup costs two hearts and retains half a shield; a half-shield duplicate costs one heart and removes the shield. Normal shield-overload rules remain unchanged. The yellow 2× bonus and other mechanics are retained.

## Appearance (v1.3.0)

Word sets and color themes are independent. Choose Lime, Mint, Blue or Coral with any word set. The Rick palette is absent from the selector until the challenge has been won. Old automatic palettes migrate to a fixed color without deleting records or unlocks.

**Handwriting paper** overrides all color/light/dark palettes with a lined notebook, original pen-stroke lettering, sketched letter tiles and basket, red-scribbled hazards and blue-scribbled shields, inspired by the creator's notebook references. Toggle it off to restore your chosen palette. Appearance changes while paused keep the current game; Apply & start new game is only needed for changing the word set or difficulty.

The original MIT-licensed font is embedded in the HTML, so it works offline in both browser and APK. Rebuild with `python tools/build_hand_font.py` (requires fontTools); `assets/word-rain-hand.woff` is the reusable font. Reference photographs are not bundled or published.

## 1.3.1 correction

The six-perfect-word healing and yellow 2× bonus apply to both difficulties and use the same perfection streak and shield exceptions. The handwriting shield now has a closed top and a pointed bottom, replacing the crown-like shape.

## Audio and haptics (1.3.2)

The header keeps light/dark, **BGM**, and **SFX** switches together on one row, including on phones. BGM is off initially; SFX is on. Both preferences are saved locally. Audio starts only after a player gesture and requires browser/WebView audio support.

The original background tune **Pocket Forecast** (Word Rain / octopuskid & ChatGPT, MIT) is synthesized offline at 100 BPM, with an eight-bar melody, bass and light rain percussion. The original generated tune is retained alongside the additional tracks listed under Music selection below. BGM follows active play, pauses in Stats or when the game pauses/ends/backgrounds, and resumes from its position. SFX and music can be switched independently.

Distinct original synthesized effects accompany correct letters, wrong letters, shield pickups, wildcards, ordinary completed words, perfect words, entering wildcard mode, actual speed increases, actual heart regeneration, HP loss, and shield shattering. Perfect words play the perfect cue instead of the ordinary completion cue; a capped speed or full-health reward plays no misleading reward cue.

On phones, actual HP loss and shield shattering also request vibration, independently of SFX. Android uses the normal VIBRATE permission; browser vibration depends on platform support and may be unavailable (including in some mobile browsers or embedded frames). A hard-mode overload retaining half a shield does not count as a shatter.

Phone players can choose **Choose local BGM** below the rules to select an audio file up to 24 MB. “Upload” here is a device-local picker: nothing is sent to a server. The chosen file loops instead of the original music, follows the same pause/mute controls and lasts for that session; select it again after reopening. **Use original BGM** restores Pocket Forecast. Codec support depends on the browser/WebView. Android reads only the document the player selects and requests neither storage nor internet permission.

Version 1.3.2 keeps the existing app ID, release signing key, origin and record storage keys. Existing personal bests, word statistics, settings and Rick unlocks survive an in-place update. Do not uninstall the previous app first.

## Handwriting alignment (1.3.3)

The lowercase **i** and **l** glyphs now have balanced left/right spacing inside their fixed-width cells. This font correction is included in the standalone HTML, hosted demo and Android APK. Existing records and settings are preserved.

## Music selection and appearance (1.3.4)

Handwriting now disables the Color theme selector while enabled. Turning handwriting off re-enables it and restores the previously chosen colors. Light/dark remains disabled during handwriting as before.

The **Background music** selector below the rules offers Pocket Forecast (the original, still the default), **Carefree** and **Monkeys Spinning Monkeys** by **Kevin MacLeod (incompetech.com)**. The selected built-in track is saved independently of the BGM/SFX switches. Music remains paused in Stats and while play is paused or finished. Mobile local music still works for the current session, and Use original BGM selects Pocket Forecast.

Both Kevin MacLeod recordings are **Creative Commons Attribution 4.0 International**, with source/license links and conversion notices in the game's Music credits & licenses, on itch.io and in [MUSIC-LICENSES.md](MUSIC-LICENSES.md). They are re-encoded to 80 kbps mono MP3 for package size, retain the full tracks, and loop during play. The music license permits use and redistribution without an application when attribution and other terms are followed. These recordings are licensed separately from the game's MIT code and original audio; no artist endorsement is implied.

All three tracks work offline in the APK. App identity, signing key, saved score/stat keys, theme/settings and Rick unlock storage remain unchanged in 1.3.4. Install over the existing app to retain data.

## Lightweight 1.3.4 edition

The same release also offers **word-rain-1.3.4-lite.apk** and a lightweight HTML download. These omit the two bundled Kevin MacLeod recordings while keeping Pocket Forecast, all sound effects and mobile local-music importing. No external music files are needed.

Full and Lite APKs share the same app identity, signing key and storage. They replace one another rather than installing side by side; installing over the existing app preserves scores, word statistics, settings and unlocks. A bundled-track preference falls back safely to Pocket Forecast in Lite. Do not uninstall first. The full soundtrack edition remains available.


## Uniform spawning (1.3.5)

Replaces skipped spawn attempts and independent target rolls with a fixed drop interval and smooth weighted distribution. Target letters cannot duplicate while an earlier copy is still falling above the catcher line. Drops fall at one shared speed, so faster drops cannot overtake slower ones. Perfect-streak speed changes still apply; word, shield, scoring and save rules remain unchanged. Both full and Lite APKs use version code 15 and preserve existing records when installed over the previous version.


## Compact handwriting layout (1.4.0)

Handwriting paragraphs and rules use tighter line spacing. The ready/pause overlay has smaller text, closer spacing and a scroll fallback on short screens, keeping its controls reachable. This layout update includes the uniform generator from 1.3.5. Full and Lite APKs use version code 16 with the same app identity, signing key and save keys; install over the previous version to keep scores, stats, settings and unlocks.
