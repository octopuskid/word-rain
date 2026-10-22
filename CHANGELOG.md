# Changelog

Release history is listed newest first. These entries describe changes at the time of release; [How to play](README.md#how-to-play) is the reference for current behavior.

## Test page maintenance — no game release

- Add a faint, non-interactive TEST MODE watermark across the test playfield and a visible maintenance notice.
- Rebuild the test page automatically whenever `npm run build` builds the game, keeping its gameplay and word sets synchronized.
- Move all 17 versioned HTML snapshots from the repository root into `versions/`; future builds use that folder. Live `index.html` and `test.html` URLs stay unchanged.
- No version bump, GitHub release, APK or itch.io update.

## 1.6.8.1 — HTML development prerelease

- Expand Classic, Nature, Space and Tricky to 60 words each (240 entries, up from 85), retaining every original word.
- Keep Normal at 4–7 letters and Hard at 6–7 letters. Existing saved settings and word records remain compatible.
- Validate all word entries and retention, pass scoring/spawning/test-lab regressions, and playtest the expanded sets in the browser.
- Publish the development HTML and test lab on GitHub Pages and an HTML-only GitHub prerelease. Stable 1.6.8 APK and itch.io remain current.

## 1.6.8 — Stable

- Attempt one Android update check when the app opens. Returning from another app does not trigger another check during that session.
- Remove periodic polling, retry scheduling and connectivity callbacks. Offline/failed attempts wait for the next fresh launch.
- Retain stable/APK filtering, music downloads/offline cache, BGM loop fixes and all saved-data keys. APK code 37 uses the original certificate.
- Native build/signature/payload verification and browser gameplay smoke testing precede publication. Physical Android lifecycle/network behavior still needs device verification.

## 1.6.7 — Stable

- Remove the persisted six-hour success cooldown and five-minute attempt gate from the Android update checker. Launches and validated network reconnections check immediately; only overlapping in-flight requests are suppressed.
- Keep five-minute periodic polling/retries while the app is open, plus stable-version/APK filtering and the existing once-per-version prompt.
- Preserve BGM loop recovery, optional music downloads/confirmation/offline cache, app identity and saved data. APK version code 36, original certificate.
- Native compilation/signing, stable version comparison, APK payload checks and browser gameplay smoke testing precede publication. Physical Android network/dialog behavior remains untested here.

## 1.6.6 — Stable

- Recover BGM after unexpected media ends/pauses and interrupted Web Audio contexts. Keep original, downloaded and local tracks looping during play.
- Stop retired tracks cleanly; pause, BGM off, Stats and backgrounding still stop playback.
- Retain update checks, consent-based music downloads, verification, offline cache and saved game data. APK version code 35, original signing certificate.
- BGM lifecycle tests and current scoring/display/spawning/SFX suites pass. Browser playtesting checks gameplay, optional download confirmation, loop wrap and pause/resume before stable publication. Physical Android playback remains device-dependent and untested here.

## 1.6.5 — Stable

- Promote the 1.6.4.1 mode/Overcast/current-speed multiplier scoring to web and Android.
- One signed APK, version code 34; preserve app ID, original certificate and saved-data keys.
- Synchronize HTML/APK on GitHub Releases and itch.io, with the HTML on GitHub Pages.
- New scoring matrix, spawning, sound and target-display checks pass; legacy suites retain old score expectations. APK signing, alignment and payload checks pass. Physical Android installation remains untested.

## 1.6.4.1 — HTML development prerelease

- Score each award as `ceil(base × mode × Overcast × current speed)`: Normal 1 / Hard 2, clear 1 / Overcast 2, 180% speed = 1.8. Round upward after multiplication. Hard + Overcast at 180% earns 72 for a correct letter; 181% earns 73.
- Preserve the perfect bonus (double correct/word bases), scoring pauses, all saved records and legacy fractional bests. Compute catch awards before penalties or completion speed rewards.
- Show current factors near the HUD and update in-game/README rules. Keep a separate stable 1.6.4 scoring reference.
- Update only GitHub Pages game/test lab and HTML prerelease. Stable itch.io and APK stay 1.6.4.
- Verify the full factor matrix, ceiling/float boundaries, correct/wrong/wildcard/word/overlap awards, protected catches, scoring recovery, sixth-perfect boundary, saved data, spawning and test lab.

## 1.6.4 — Stable

- Promote the 1.6.3.3 game to Android and stable web: smaller embedded assets/code, short opening text, Quick rules below the word and purple handwriting wildcard tiles.
- APK version code 33; existing app ID, signing certificate and local save keys retained. One merged APK; optional music remains a consent-based download.
- Add a separate GitHub Pages `test.html` with manual block spawning, speed/frequency/wave/position controls, overlap stacking, custom words, clear/reset and optional safe hearts. Separate storage keys. Never bundled in the APK or uploaded to itch.io.
- Update stable HTML/ZIP/APK, itch.io and How to play. Verify gameplay/save/audio suites, sandbox controls and signing. Physical Android installation/audio/haptics still require device testing.

## 1.6.3.3 — HTML development prerelease

- Color handwriting wildcard tiles lavender with darker purple pencil hatching, retaining the dark ✦ symbol and hand-drawn outline.
- Drawing-only change; gameplay, saved data and wildcard probabilities are unchanged. GitHub Pages receives this dev HTML; itch.io and APK remain stable 1.6.3.

## 1.6.3.2 — HTML development prerelease

- Replace the long start-screen paragraph with a two-sentence introduction so the Start button has more room on phones.
- Add expandable Quick rules below the target word, covering unshielded hazards, mode-specific wrong letters, shield protection, scoring pause and six-perfect rewards. Keep the full rule reference below the game.
- Gameplay scripts and saved-data keys are unchanged. GitHub Pages runs the development HTML; itch.io and APK remain stable 1.6.3.

## 1.6.3.1 — HTML development prerelease

- Reduce self-contained HTML by 17.5% (99,248 → 81,887 bytes) with conservative code/style minification, exact cloud-path reuse and lossless WOFF2 font compression.
- Preserve gameplay, original music, sound effects, theme geometry, offline behavior and player-save keys. Keep readable source and a reproducible build.
- Verify gameplay/save/audio/overlap regressions against both web HTML and a generated mobile HTML test fixture; no APK is built or released. Stable Android and itch.io remain 1.6.3.

## 1.6.3 — Stable, merged edition

- Restore the earlier rounded cloud shapes, highlights and pencil outlines; change their layout to large staggered overlapping stacks based on the creator’s sketch.
- Merge Full and Lite into one HTML/ZIP/APK with Pocket Forecast, effects and importing. Do not bundle Kevin MacLeod recordings. Offer a confirmation before downloading either recording from the repository; verify size/SHA-256. Android keeps private offline copies; browser copies last for the session.
- Update the native release checker to recognize a single APK. Older 1.6.2 requires a one-time manual update because it expects both retired variants.
- Preserve player records, signing, identity and storage keys. APK code 32. Update GitHub/itch.io instructions and hosting tutorial.

## 1.6.2 — Stable

- Redraw Overcast as one large cloud bank: irregular overlapping layers, scalloped boundaries and matching pencil contours, based on the creator’s new sketch. Remove the repeated stamped-cloud appearance.
- Add native Android update checks when the open app has validated internet access. Limit successful checks to six hours, retry failures after five minutes while open, and offer newer stable releases once per version. Ignore development releases and require Full/Lite APK assets. Downloads remain player initiated.
- Keep offline gameplay, blocked WebView networking, saved records, app identity and signing certificate. Add normal INTERNET and ACCESS_NETWORK_STATE permissions for the checker; no storage permission.
- Full/Lite APK code 31. Update HTML, demo, itch.io and current How to play together.

## 1.6.1 — Stable

- Fix Overcast texture seams and straight cutoffs with wrapping rounded cloud puffs in regular and handwriting styles. Keep the exact middle-half mask and clear upper/lower quarters; dialogs now explicitly sit above clouds.
- Redraw the mobile launcher from the author’s W/wildcard/basket sketch. Replace the small block icon with a scalable 1024-unit vector and a matching 1024px PNG export.
- Bring the 1.6.0 wrong-letter rules and Overcast option to Full/Lite Android. Hide BGM and SFX on Word Stats; returning to Game restores them and remains paused.
- Preserve signing identity, app ID and saved data. Android version code 30; no 1.6.0 APK was released.
- Update current How to play and document stable/dev numbering.

## 1.6.0 — HTML only, unverified

- Rewrite wrong-letter handling from released 1.5.3: Normal resets on the third and subsequent consecutive unshielded mistakes; Hard resets on every unshielded wrong letter. Both break perfection. Shielded mistakes preserve progress and perfection.
- Add optional saved Overcast checkbox. Clouds hide the middle half of the playfield with regular and handwriting textures; upper/lower quarters remain clear.
- Hide BGM and SFX on Word Stats, restore on Game, and keep the game paused on return.
- Add website embedding and hosting tutorial. Keep Android identity, signing setup and storage keys.
- Published HTML on GitHub/GitHub Pages only by explicit request, with the notice **this ver is not verified**. Runtime/device tests have not been run for this rebuild.
- No 1.6.0 APK. itch.io stays on 1.5.3. The next APK is planned as 1.6.1 once the user sends the next message and a working build environment is available.
- The BGM/SFX hiding change on Word Stats is prepared on `rebuild/1.6.0`; it is not in a released APK yet.

## 1.5.3

- Unshielded × catches now reset word progress, as well as losing one heart and breaking perfection.
- Unshielded wrong-letter catches now keep word progress; perfection and purple mode still end. Shielded catches, scoring pauses and speed penalties are unchanged.
- Updated in-game instructions and the GitHub/itch.io How to play. Full and Lite HTML/APKs share the change; saved data and signing identity are preserved.

## 1.5.2

- Make the existing wrong-letter sound clearer on small speakers with higher-pitched descending tones and a stronger attack.
- Verify every wrong catch plays the cue with SFX enabled, including shielded catches, the third consecutive mistake and scoring-paused catches; SFX mute and independent BGM controls remain respected.
- Update How to play and preserve player data in Full/Lite in-place updates.

## 1.5.1

- Shielded wrong-letter catches consume half a shield while keeping word progress and perfection, including the catch that shatters the shield.
- Keep existing wrong-letter scoring, scoring-pause and speed penalties. Unshielded mistakes still reset word progress.
- Clarify the current How to play and shield table; preserve saved player data across in-place updates.

## 1.5.0

- Resolve overlapping letters/hazards/shields/wildcards while preserving random wave spawning. Two letters create a wildcard outside purple mode as well; wildcard + × fills one blank immediately; two wildcards perfect the current word immediately.
- Perfect words unlock purple mode in Normal and Hard. Random wildcard chances while unlocked are now 1% and 0.5% per non-× drop respectively.
- Reuse ordinary scoring, scoring-pause recovery, completion, perfect streaks, healing and mobile-record paths for automatic rewards.
- Update current How to play on GitHub, itch.io and in the HTML. Add “Available on both mobile & PC” first on itch.io and put both phone screenshots ahead of PC captures.
- Full/Lite APK version code 25, same identity, signing certificate and storage keys; install over the previous app to preserve data.

## 1.4.7

- Display the current target word faintly inside the playfield, behind falling letters, so progress and the next underlined letter can be checked while watching drops.
- Synchronize this display with correct/wrong catches, word changes, restarts, the 2× bonus and the Rick challenge, including handwriting themes.
- Updated How to play on GitHub and itch.io. Gameplay/scoring values and saved data are unchanged.
- Full and Lite APKs use version code 24 with the existing app identity and signing key.

## 1.4.6

- Hard mode starts at 140% and caps at 260% (previously 160–280%). Speed penalties stop at the new 140% minimum.
- Hard ordinary-letter opportunities are 8% current target and 5% following target (previously 8% following). The final-letter exception is retained.
- Updated in-game settings/rules and the current How to play instructions on GitHub and itch.io. Normal mode is unchanged.
- Full and Lite APKs use version code 23; install over the existing app to preserve all records, settings and unlocks.

## 1.4.5

- Hard mode awards +2 (previously +1.5) for wrong-letter catches while scoring is active. Normal remains +1; the third consecutive wrong catch and the recovery catch still award no letter points.
- Correct-letter and word-completion scores retain the Hard 1.5× multiplier and 2× perfect bonus; wrong-letter points are never doubled.
- Full and Lite APKs use version code 22 with the same app identity, signing certificate and storage keys; legacy fractional records are preserved.
- Includes the PC landscape HTML layout, mouse dragging, arrow keys / A / D and on-screen arrow controls.

## 1.4.4

- HTML-only follow-up: wide landscape field and side controls on PCs/tablets; portrait drag controls on phones. Existing APK releases are unchanged.

- Reduced ordinary falling speeds to 60% of the original classic pace while retaining the HUD’s 100% baseline and existing multipliers, caps and penalties.
- Kept spawn timing, density rules and the Rick challenge’s separate speed unchanged.
- Full and Lite APKs use version code 21 (fresh rebuild) and preserve existing records on in-place updates.

## 1.4.3

- Removed RICK from all word sets. Catch R, I, C and K consecutively yourself to trigger the secret in any set or difficulty; other caught blocks interrupt the sequence.
- Increased Copper contrast in both light and dark mode, including tile lettering and the basket.
- Preserved legacy RICK word statistics and existing unlocks, scores and settings.
- Full and Lite APKs use version code 19; install over the previous app to retain data.

## 1.4.2

- Restored classic random drop attempts, varied falling speeds and elapsed-time acceleration from the original prototype, while keeping printed letters fixed.
- Added occasional waves of two or three attempts; adjusted intervals for their mean size to preserve expected density.
- Made current/following-letter opportunities evenly spaced and allowed multiple pending copies.
- Retained the 5% base frequency increase, speed-linked frequency boost and earlier letter/hazard density reductions.
- Full and Lite Android builds use version code 18 and preserve existing data on in-place updates.

## 1.4.1

- Added bounded random variation to drop timing and weighted letter/pickup selection, plus random horizontal positions.
- Increased the base spawn rate by 5% relative to 1.4.0.
- Added 3% of the new base spawn rate per 20 percentage points above each mode's starting speed, interpolated between steps and capped at +18%; slowing down reverses it.
- Retained pending-target duplicate suppression and equal falling speeds.
- Full and Lite Android builds use version code 17 and retain saved data on in-place updates.

## 1.4.0

- Tightened handwriting paragraph, rule and instruction spacing.
- Compacted the ready/pause panel and added a scroll fallback for short screens.
- Full and Lite Android builds use version code 16 and retain existing saves on in-place updates.

## 1.3.5

- Replaced skipped spawn attempts and increasing density with a fixed interval of about 1.27 seconds.
- Added balanced target-letter, hazard and pickup scheduling and suppression of pending target duplicates.
- Unified falling speeds and distributed positions across shuffled lane rounds.
- Full and Lite Android builds use version code 15.

## 1.3.4

- Disabled the Color theme selector while handwriting is enabled; restored the previous palette when disabled.
- Added the separately credited Kevin MacLeod recordings Carefree and Monkeys Spinning Monkeys alongside Pocket Forecast.
- Added Full and Lite downloads. Lite retains original music, effects and local importing without bundled recordings.
- Rebuilt Android packages as build 14, retaining app identity, signing key and save storage.

## 1.3.3

- Centered lowercase i and l within the handwriting font's fixed-width cells.

## 1.3.2

- Added original generated background music, event sound effects, independent BGM/SFX switches and phone-local music importing.
- Added vibration requests for heart loss and shield shattering.
- Applied Hard's 1.5× score multiplier, including half-point scores and saved personal bests.

## 1.3.1

- Corrected the six-perfect-word healing and 2× bonus to apply in both difficulties with the shield exceptions.
- Redrew the handwriting shield with a closed top and pointed bottom.

## 1.3.0

- Separated word-set selection from color themes and hid Rick until unlocked.
- Added the original offline handwriting-paper theme and font.

## 1.2.1

- Added Hard's 160–280% speed range, 8% current/next-letter selections and removal of wildcards.
- Added Hard's half-shield retention after a full-shield duplicate pickup.
- Hid game options during active play and restored them while paused or finished.

## 1.2.0

- Added selectable word sets and the yellow target-word indicator for the perfect-streak score bonus.
- Added the Rick sequence challenge and theme unlock, plus Give up with confirmation.
- Set wildcard opportunities to 1.5% and preserved purple mode on shielded wrong catches.
- Defined duplicate-shield heart loss and shield removal behavior.

## 0.0.1 — historical prototype

- Retrospective version label for the first HTML prototype, recovered from its original deployment archive.
- Preserved the original HTML unchanged, including automatic letter changes and its local high score.
- Published separately on `archive/0.0.1`; it does not replace the current game or demo.

Earlier releases remain available in the [GitHub release archive](https://github.com/octopuskid/word-rain/releases).
