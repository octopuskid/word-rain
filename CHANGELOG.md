# Changelog

Release history is listed newest first. These entries describe changes at the time of release; [How to play](README.md#how-to-play) is the reference for current behavior.

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
