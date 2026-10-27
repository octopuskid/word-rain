> **2.0-dev9 / build 48:** User reported dev8 Home buttons unresponsive. Remove nonpassive document touchmove/wheel prevention; CSS touch-action and native scroll guard remain. HomeWebView now ALWAYS calls super.computeScroll so WebView frame/input processing runs, and resets scroll only for nonzero native offsets. Match Home wordmark and Classic heading using system-ui,sans-serif, weight 700, letter spacing -1.3px. Keep remaining Dream font. Physical device unavailable; avoid claiming real-device tap verification.

> **2.0-dev8 / build 47:** User reported dev7 Home still scrolling on device. Add `HomeWebView` native class guarding scrollTo/overScrollBy/onOverScrolled/flingScroll/computeScroll; lock clears offsets and disables native scrollbars/overscroll. `GameBridge.setHomeScrollLocked` dispatches to UI thread. `syncHomeScrollLock` locks only Home outside tutorial; every route syncs it. Nonpassive touchmove/wheel prevent panning only on Home, preserving taps and other-page scrolling. Retain dev7 CSS fit. Native guard tested with minimal Android API doubles; physical device remains unavailable.

> **2.0-dev7 / build 46:** Android Home is unscrollable. Home-only root/body/shell viewport constraints remove document overflow; absolutely centered natural-height Home scales down as a whole via `fitDreamHome` and `--home-fit` when needed. ResizeObserver watches shell/content, window resize and bundled font readiness refit. All controls remain present. Other routes keep normal access to long content. HTML remains Classic-only.

> **2.0-dev6 / build 45:** User clarified story is prewritten, not written/revealed by the player. Display the full current original-case story token in `dream-current-word` before catching any letters; existing `dream-target` highlights letters to catch. Advance only after all letters of current word. Removed accumulating `dream-restored` panel/styles. Existing 50/100-word stories, ten standalone Chapter 1 words and v2 checkpoints retained. Android only.

> **2.0-dev5 / build 44:** Revised Android story curriculum: Chapter 1 ten unrelated standalone words (no connecting narrative); Chapter 2 original story exactly 50 words; Chapter 3 original story exactly 100 words. `storyStages` remains the internal array, now representing chapters. Story tokens preserve original case/punctuation for reading; playable words strip punctuation and use uppercase letters. Finished words progressively reveal the story. `word-rain-story-v2` stores validated completed count and per-chapter word checkpoints; retries/restarts begin at the next unfinished word with three hearts. Partial letters are not saved. Previous `word-rain-story-v1` is untouched and does not count toward new chapter completion. Classic records are separate. HTML remains Classic-only with version-label update.

> **2.0-dev4 / build 43:** Move the actual `theme-toggle` button from the Android Classic header into `dream-home` during generation; preserve its storage key and keep it enabled for Home even when Classic handwriting is on. Dream UI now has dark palette overrides. Remove the persistent bottom page bar: legacy tab nodes remain hidden/inert for internal records routing, `#mobile-tabs{display:none!important}` prevents the former flex-over-hidden bug, and `routeDream` never unhides it. Remove the old 96px bottom reservation. Full word records remain reachable via Home → Stats. HTML has only its version label updated.

> **2.0-dev3:** Android build 42 introduces `android/dream.{html,css,js}` and embedded logo/font. Home has Classic/Story/Stats; Classic preserves its rules and saved records. Story is an independent finite simulation with one chapter/three stages, 3 words each, 3 hearts per stage; wrong letter or × costs one heart, missed blocks harmless. Stages unlock sequentially; `word-rain-story-v1` saves only completed count 0–3. Active runs pause on Home/background/native update prompt and can resume in memory; restarting the app keeps completed stages, not an unfinished run. Tutorial completion now reveals Home. Android audio transport gains `androidAudioPlaying()` only in generated APK HTML, using `window.wordRainStoryPlaying`; Classic must not run in the background. Native lifecycle uses `wordRainPauseAll()`. Nunito font licensed SIL OFL and bundled offline; logo was smoothed with image generation from owner sketch. Launcher uses W2 artwork. HTML remains Classic-only. Test APK uses original app ID/key; future code must exceed 42. No physical device install test.

# Word Rain — project handover

> **2.0-dev3 UI/Android:** Setup opens with difficulty first. It is hidden in playing AND paused states, restored only in ready/over. Fresh starts apply visible setup values. Android-only six-card first-launch walkthrough, skip/back/next/replay; `word-rain-tutorial-v1=done` stores completion/skip without touching records. Background panels are inert and run/tab actions blocked while open. DEV APK build 41 uses original app ID/certificate. Native update policy recognizes installed `2.0-dev3`, offers matching or newer stable, rejects prerelease candidates and older stable. The once-per-launch scheduler and music consent/cache checks are unchanged. Test APK is a user-requested exception; itch.io remains stable 1.7.1. No physical-device installation test was available.

> **Current dev: 2.0-dev9 (27 October 2026).** Stable Android/itch.io remain **1.7.1 / build 40**. Optional magnet generation is off by default, stored as `magnet` in the existing settings object. The switch now synchronizes `pendingMagnet` and `magnetEnabled` immediately, including paused runs; start/apply also read the checkbox directly. Both modes use 1% of emitted blocks. Pickup makes a one-time radius selection (3.5 × 36 = 126 canvas units, center-to-center), then selected blocks home toward the moving basket; subsequent arrivals are unaffected. All block types, including hazards and pickups, are eligible, but centers below the basket (y > 470) are excluded at activation; y = 470 remains eligible. Usual overlap/catch/scoring rules remain. A magnet touching any other block disappears; a shield or another magnet disappears too. Magnet contact includes touching edges; other overlap boundaries are unchanged. A magnet gives no direct score, HP or shield reward, preserves perfection and clears the manual Rick trigger. Regular/pencil canvas artwork uses white tiles and red/blue/silver magnets. Tests: `node android/tests/magnet-1711.cjs` plus focused existing regressions. The manual lab drop works with generation off. Do not publish separate checksum files; GitHub supplies asset digests.


> **Owner correction / 1.7.1:** Disregard the second session’s 1.7.0 implementation. The 1.7.0 stable release/tag are withdrawn; its standalone HTML remains in `versions/`. Work resumes from `v1.7.0-pre1` (960d53d). The next stable is **1.7.1**, Android **build 40**, with independent landscape HTML cloud textures (regular/paper), GitHub title links on all platforms, and portrait-only Android. Preserve auto-update, optional music downloads, signing identity and saves. Later sections describing 1.7.0 are historical, not the baseline.


Handover prepared on **22 October 2026**, updated for **1.7.0 stable HTML and Android on 23 October 2026**. This is a maintainer reference, not a new game release. Read it with the current source and the latest instructions from the project owner; version numbers and platform state below are a dated snapshot.

## 1. The idea and who directs it

**Word Rain is a free word-catching arcade game:** move a basket under falling letters, collect the highlighted letters in order to spell a target word, avoid hazards, and manage hearts, shields and wildcards. It combines spelling, anticipation and arcade movement. The intended experience is a small, immediately playable pocket arcade on phones and computers, with offline play available.

The project owner is **octopuskid**. The owner supplies the design, rules, feedback and release decisions; ChatGPT has implemented and helped publish the project. The owner describes it as a game made using AI without personally writing its code. Public wording should preserve that relationship, for example **“Made with AI under human direction.”** Do not portray the AI as independently owning the project or its accounts.

The owner considers the current arcade core complete and wants to extend it thoughtfully. Preserve the existing gameplay unless a change is requested. Refining the experience matters more than adding arbitrary features. A previous player complaint was that difficulty should grow through speed rather than excessive letter density, and that unresolved overlapping blocks were frustrating. The current spawning and overlap systems reflect work on those concerns.

The project is open source and free. It is not built around ads, player accounts, a database or monetization. The owner has explicitly rejected publishing to Google Play. A Steam listing has been discussed elsewhere, but no Steam publishing action is authorized merely by this handover.

## 2. Public destinations and current state

| Destination | URL / identity | State at this handover |
| --- | --- | --- |
| Repository | https://github.com/octopuskid/word-rain | Main source and maintenance documentation |
| Browser game | https://octopuskid.github.io/word-rain/ | HTML dev **2.0-dev3** |
| Browser test lab | https://octopuskid.github.io/word-rain/test.html | Shared current game plus test-only controls; maintenance changes have no separate release |
| Statistics | https://octopuskid.github.io/word-rain/stats/ | Public counters and dated private-analytics snapshots |
| itch.io | https://octopuskid.itch.io/word-rain | Stable **1.7.1**, HTML and APK |
| Stable release | https://github.com/octopuskid/word-rain/releases/tag/v1.7.1 | HTML and APK **1.7.1**, Android version code **40** |
| Latest web dev release at handover | https://github.com/octopuskid/word-rain/releases/tag/v2.0-dev3 | Optional magnet blocks |
| Bluesky | https://bsky.app/profile/octopuskid.bsky.social | Project promotion account |
| YouTube | https://www.youtube.com/@octopuskid-arcade | Project channel |

Verify current state before another release. Do not infer that every platform has the same version: development updates deliberately run ahead of stable Android/itch.io.

Recent changes:

- **1.7.0 stable:** smaller self-contained HTML (83,102 bytes versus 88,361), minified synchronized lab (93,219 versus 99,179), pixel-identical SVG cloud group reuse, compact word lists and cached persistent UI elements. Global extension bindings remain available for Android/lab code. `tools/minify-options.cjs` supplies the shared safe policy; `build-web.cjs` awaits the exported asynchronous `build-test.cjs` function. The owner explicitly specified that 1.7.0 is stable. Browser regression and live tests passed. The owner restored the original production signing backup. Android 1.7.0 (code 38) is compiled and signed with the same certificate as 1.6.8, preserving signing compatibility. Keep signing files private and outside Git; never replace the production identity. Signature, alignment and payload checks pass; physical-device installation is not available in this environment.

- **1.7.0-pre1 DEV:** 120 entries per preset set (480 across four sets), preserving all earlier entries. This explicit owner-requested semantic prerelease name supersedes the usual appended dev-number convention for this release.

- **1.6.5:** promoted the mode × Overcast × speed scoring formula to stable web and Android.
- **1.6.6:** fixed BGM loop/recovery problems, including unexpected media pauses/ends and interrupted audio contexts.
- **1.6.7:** changed Android update-check timing; it was superseded by 1.6.8.
- **1.6.8:** Android attempts one update check per fresh app launch, with no later polling, retry or reconnection checks during that session.
- **1.6.8.1 DEV:** expanded Classic, Nature, Space and Tricky to **60 entries each**, 240 entries across sets, retaining all 85 original entries. Cross-set duplicates mean this is not a claim of 240 globally unique words.
- **1.6.8.2 DEV:** Overcast checkbox changes apply to the next new game; resuming a paused run preserves that run’s cloud visibility and scoring multiplier.
- Subsequent **test-page maintenance only:** replaced a diagonal watermark with a small top-left TEST MODE badge; added Test HP, draggable shield/speed bars, and direct Hard/Overcast selectors. These changes did not create a dev/stable release or alter the ordinary game.

## 3. Current gameplay contract

### Movement, targets and run state

- Move by clicking and dragging the basket, finger dragging on phones, A/D, left/right arrows, or on-screen arrow controls where shown. Mouse hover alone does not move it.
- Targets are shuffled words. Normal uses **4–7 letters**; Hard uses **6–7 letters** from the selected preset set.
- Preset sets are Classic, Nature, Space and Tricky. Word sets and color palettes are independent.
- Start with **3 HP**. Zero HP ends the run. Uncaught drops do not count as mistakes.
- The target appears beside/below the arena and faintly within it; completed letters and the next required letter must remain synchronized.
- Pause freezes play. Losing focus/backgrounding pauses it. Returning from Android Stats stays paused until the player resumes.
- Give up requires an in-game confirmation and preserves saved records/unlocks.

### Wrong letters, scoring pauses and shields

A wrong ordinary letter does not directly cost a heart. Unprotected mistakes break perfection, stop the perfect bonus, and remove wildcard mode.

| Catch | Current behavior |
| --- | --- |
| Unshielded wrong letter, Normal | First two consecutive mistakes keep current word progress; the third and later reset it until a correct catch clears the streak |
| Unshielded wrong letter, Hard | Resets current word progress on every mistake |
| Third consecutive wrong catch | Pauses scoring; the third earns zero, including when shielded |
| Next correct letter / wildcard after scoring pause | Advances progress and clears the pause, with zero letter points; any resulting completion bonus still follows the normal formula |
| Unshielded × | Lose one HP, reset word progress, break perfection |
| Wrong letter with a shield | Consume one of the shield’s two health units; preserve progress and perfection, including when the shield shatters |
| × with full shield | Shield shatters, no HP loss, perfection breaks |
| × with half shield | Shield shatters, lose one HP, perfection is preserved |
| Shield pickup with no shield | Equip full shield, no HP loss |
| Shield pickup with full shield | Lose two HP; Normal removes the shield, Hard retains half |
| Shield pickup with half shield | Lose one HP and remove the shield |

Shield-pickup damage preserves perfection but can end a run. Shield protection does not remove wrong-streak accounting or speed penalties. **Resetting word progress does not erase the accumulated score.** These are deliberate rules; do not “simplify” unusual shield cases without the owner’s direction.

### Points and perfect rewards

Every award is calculated separately:

`ceil(base × difficulty × Overcast × current speed)`

| Factor | Value |
| --- | --- |
| Normal / Hard | 1 / 2 |
| Clear / Overcast | 1 / 2 |
| Speed | Displayed percentage divided by 100 |
| Correct letter / caught wildcard base | 10 |
| Completed word base | 50 |
| Correct letter / completed word bases during perfect bonus | 20 / 100 |
| Wrong letter while scoring is active | Base 1; never doubled by the perfect bonus |

For example, a correct catch in Hard + Overcast at 180% earns `ceil(10 × 2 × 2 × 1.8) = 72`. Use speed **before** that catch’s penalty or completion reward. The final letter and completion bonus use the pre-completion bonus state. Preserve existing saved scores, including older fractional bests; do not retroactively recalculate them.

A perfect word has no catch that breaks perfection during that word, with the shield exceptions above. Six consecutive perfect words restore one heart, capped at three, and enable doubled correct/word bases for subsequent awards. The sixth word itself uses the old bases. The target turns yellow. Further multiples of six can heal again; healing at full health is skipped. The bonus does not stack beyond 2× and lasts until perfection breaks.

### Speed and spawning

| Mode | Starting/minimum speed | Maximum speed |
| --- | --- | --- |
| Normal | 100% | 220% |
| Hard | 140% | 260% |

Every two consecutive perfect words add 20 percentage points. Wrong catches subtract 5 points; × catches subtract 20, including protected catches. Clamp to the mode limits.

Ordinary falling speeds are scaled to 60% of the original classic pace before the displayed multiplier. Waves retain random skips, positions and varied speeds. A wave attempts one drop normally, two 15% of the time, or three 3% of the time. Density reductions and mean-wave-size compensation are intentional. Frequency grows slightly with speed: +3% per 20 percentage points above the mode minimum, interpolated and capped at +18%, in addition to the retained base-frequency adjustment.

Among ordinary letter selections, current-target / following-letter shares are **20% / 5% in Normal**, **8% / 5% in Hard**. Following-letter selection is omitted at the final blank. Multiple copies already on screen do not suppress another target selection. Printed letters never change after spawning. The weighted scheduling for letters does not make every aspect of spawning deterministic. See the source and spawning regression suite before changing this system.

### Wildcards and overlaps

One perfect word unlocks purple wildcard mode. Random wildcards are 1% per non-× drop in Normal, 0.5% in Hard. Shields have their own 3% share. Hard mode still supports wildcards; old notes saying they are removed are obsolete. Overlap-created wildcards work even before purple mode unlocks.

| Overlapping pair | Result |
| --- | --- |
| Letter + letter | One wildcard |
| Letter + × | Keep letter |
| × + × | Merge into one × |
| Shield + another kind | Remove shield, keep the other block |
| Shield + shield | Merge into one shield |
| Wildcard + letter | Keep wildcard |
| Wildcard + × | Consume both, immediately fill the next blank as a correct catch |
| Wildcard + wildcard | Consume both, immediately complete the current word as perfect |

Resolve overlaps before catches. Chains matter. Merged blocks use midpoint position and averaged speed. Overlap removal is not a basket catch and does not independently cause damage. Automatic fills must use the normal award/progress/completion path, including scoring-pause recovery, sixth-perfect boundaries, healing and records. Do not award already-filled letters twice.

### Overcast, appearance and the secret

Overcast hides the middle half of the arena with opaque embedded clouds and multiplies awards by two. It must not block input or change collision/spawn rules. Pause/confirmation overlays appear above it.

In **1.6.8.2**, `pendingOvercast` is the saved next-game choice; `overcast` is the current run’s active value. Checkbox changes do not change the active clouds or multiplier during pause/resume. A fresh start, including Apply & start new game, commits the choice. Appearance saves must preserve the pending preference. Stable HTML and Android 1.7.0 include this change.

Light/dark mode and Lime/Mint/Blue/Coral palettes are supported. Handwriting uses lined paper, an embedded custom font and sketched elements, overriding the color theme while enabled. Keep handwriting wildcard tiles purple. Rick/Copper is a saved unlock.

**RICK is intentionally absent from preset word sets.** Manually catching R → I → C → K consecutively triggers the case-sensitive `d Q w 4 w 9 W g X c Q` sequence. Catching the sequence unlocks Rick/Copper. The challenge awards no extra score; normal trigger catches still follow normal rules. Another caught letter interrupts the trigger; ×/shield/wildcard clear it. Missed drops and pausing do not clear it. Do not expose or remove this Easter egg casually.

## 4. Audio, Android and persistence: preserve these systems

The owner explicitly said **do not remove update checking or music downloading**.

- Original **Pocket Forecast** and synthesized sound effects are included offline.
- **Carefree** and **Monkeys Spinning Monkeys**, by Kevin MacLeod, are optional consent-based downloads with CC BY 4.0 credits. Keep the confirmation/cancel flow, expected-size/SHA-256 validation and offline Android cache. Do not silently fetch them or bundle them into normal HTML/ZIP/APK packages.
- Browsers keep downloaded recordings for the session; Android retains verified private cached files across reopening and in-place upgrades.
- Local music selection reads only the selected document, up to 24 MB, and uploads nothing.
- Music repeats during active play. Preserve 1.6.6 recovery from unexpected ends/pauses and interrupted Web Audio contexts. Game pause, backgrounding, BGM off, Stats and game over must still stop playback appropriately.
- Effects and BGM switches are independent. Effects initially on; BGM initially off. Wrong-letter sounds must remain distinct, including protected and scoring-paused wrong catches.
- Android update checks attempt once per fresh app launch. No periodic polling, retry scheduling, reconnection callback or recheck after returning from another app in the same session. Failed/offline attempts wait for another fresh launch.
- Only newer stable releases with a standard APK qualify. Ignore drafts/prereleases/dev tags. Show an update prompt, not silent installation. The old 1.6.2 checker required retired Full/Lite assets; those users need one manual upgrade.

Keep app ID **`io.github.octopuskid.wordrain`**, signing identity, local HTTPS WebView origin and saved-data keys stable. Existing keys include `word-rain-theme`, `word-rain-settings-v1`, `word-rain-rick-unlocked-v1`, `word-rain-audio-v1`, and Android `word-rain-mobile-records-v1`. Preserve old data and unlocks. Word encounters count when a word becomes the target, not on every progress reset. Resetting word stats must not erase personal best or unlocks.

Signing keys/passwords are deliberately private and absent from Git. Never commit them, paste them into documentation, upload them as assets or replace the production key with a newly generated one. If the original key is unavailable, report that the compatible APK cannot yet be signed. Installing over the existing app preserves records; uninstalling can lose them.

## 5. Source layout and build workflow

| Path | Purpose |
| --- | --- |
| `src/index.html` | Readable shared HTML/CSS/JavaScript source; make ordinary game changes here |
| `index.html` | Generated, self-contained live web game |
| `versions/word-rain-<version>.html` | Versioned standalone snapshots, including historical Full/Lite snapshots |
| `tools/build-web.cjs` | Minifies shared source, writes live HTML and version snapshot, then rebuilds test page |
| `tools/build-test.cjs` | Builds test-only HTML from ordinary game plus the panel and injected styles/controls |
| `tools/test-panel.html`, `tools/test-panel.js` | Test UI and test-only overrides |
| `test.html` | Generated test lab; never use as APK or itch.io release input |
| `tools/check-test-lab.cjs` | Test-lab regression harness |
| `android/mobile.py`, `mobile.js`, `mobile.css` | Inject Android-specific records, Stats and UI into shared HTML |
| `android/src/io/github/octopuskid/wordrain/` | Native WebView, bridge, music download/cache and update-policy code |
| `android/AndroidManifest.xml`, `android/build.py` | Android identity/version and build/sign/verify pipeline |
| `android/tests/` | Gameplay, audio, persistence, rendering and native policy checks |
| `assets/`, `tools/build_*` | Fonts, cloud/icon assets and their generators |
| `stats/index.html`, `stats/data.json` | Separate statistics UI and dated aggregate snapshots |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Bug report form |
| `README.md`, `HOSTING.md`, `CHANGELOG.md`, `RELEASE-PLAN.md` | Gameplay/user guide, hosting, history and distribution policy |

Typical web build:

```sh
npm ci
npm run build
```

**Always put versioned HTML on `main` inside `versions/`, never scattered at the root.** Keep the canonical live `index.html` and `test.html` at the root so their public URLs remain stable. `npm run build` automatically rebuilds the test lab; commit/deploy the generated files with the source change. For test-only maintenance run `npm run build:test` without rebuilding/bumping the ordinary game. Do not hand-edit generated HTML as the only source of a fix.

Android requires the SDK/build tools, Java, ECJ and original signing material described in [android/README.md](../android/README.md). Check both manifest versionName and monotonically increasing versionCode. A web dev update must not accidentally package an APK from the current dev source or promote it to stable.

The self-contained base game must work offline, including original music, font and textures. External optional downloads and aggregate statistics are separate functions; their failure must not block play.

## 6. Test mode is a separate tool, not another game release

The lab shares the game’s scoring/collision functions but isolates browser settings using `word-rain-lab-*` keys. It displays a small **TEST MODE badge in the top-left of the playfield**. The earlier large diagonal watermark was explicitly rejected and removed.

Available controls:

- Manual current/following/random letter, ×, shield and wildcard drops; scheduled waves and original random-wave generation.
- Fixed falling speed 10–1,000 px/s, wave interval, count, position and overlap stacking.
- Custom words: 1–200 entries, 2–16 A–Z letters, deduplicated. Single-word repetition works.
- Keep hearts at 3 protection, enabled by default.
- Test HP beside the hearts: 0–3, applied immediately; changing it disables protection. Zero ends the test run.
- Draggable shield bar: 0–2 health. Draggable speed bar: mode-specific percentage limits; it also proportionally adjusts the fixed falling speed, clamped to the lab’s bounds.
- Hard/Normal and Overcast selectors directly in the test panel; **Apply modes & reset run** starts a fresh test through the shared settings path. Custom test words remain possible even when they do not match normal preset word-length limits.

HP/bar edits keep a paused run paused. Lab fixed-speed behavior deliberately differs from ordinary random falling-speed behavior. Do not infer production spawn balance from an artificial test setup.

Test-page-only changes receive a notice on the test page and an unversioned changelog entry. **No dev release, stable release, APK, version bump or itch.io upload** is needed. A game-version footer on `test.html` identifies its shared base; it does not mean every test-panel modification was released as a game update. If asked whether a maintenance update was accidentally released, inspect actual tags/releases and changed artifacts before deleting anything. Existing 1.6.8.1/1.6.8.2 releases are legitimate game dev releases, not the later test HUD updates.

## 7. Verification and known limits

Playtest both development and stable game changes when available. **Do not publish an unplaytested change as stable**; explain exactly which tests could not be performed. Embedding tests are not required by the owner.

Useful focused checks:

```sh
node tools/check-test-lab.cjs
node android/tests/overcast-next-run-1682.cjs
node android/tests/scoring-1641.cjs
node android/tests/uniform-spawning.cjs
```

Several suites reuse the helper from `android/tests/mobile-records.cjs` and expect `android/build/assets/index.html`. For HTML-only verification, generate a mobile HTML fixture without building an APK:

```sh
python3 - <<'PY'
from pathlib import Path
import sys
sys.path.insert(0, 'android')
from mobile import mobile_html
out = Path('android/build/assets/index.html')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(mobile_html(Path('index.html').read_text()))
PY
```

Read each suite before invoking it: some historical tests encode old scoring or immediate Overcast-toggle expectations. An outdated expectation is not a reason to revert the newer contract or to claim the entire suite passed. The current focused scoring, next-run Overcast and test-lab checks were used for recent changes. Audio changes also warrant the BGM lifecycle checks and real playback, including loop wrap and pause/resume. Spawning/overlap/shield changes warrant the related suites.

Browser smoke tests should check actual progress/scoring, pause/resume, new-run settings and visual layout. For the latest Overcast change, test both off→on and on→off while paused: active clouds/multiplier remain fixed until a new game. For the lab, check HP survives HUD refresh, bars update state without resuming, Hard uses the right limits, and Hard + Overcast starts at **Points ×5.6** (2 × 2 × 1.4).

Native compilation, signing and payload checks do not establish physical-device behavior. Android installation, lifecycle/network update dialogs, codecs, haptics and real device audio remain device-dependent; disclose what was actually tested. Do not present a test-lab guided catch as an ordinary unaided gameplay session.

## 8. Publishing rules and owner preferences

The latest explicit owner instructions override older documentation when they conflict.

| Request | What to publish |
| --- | --- |
| Ordinary game change, no stable/APK mentioned | HTML-only dev prerelease on GitHub plus GitHub Pages; version suffix such as 1.6.8.3 unless another number is requested |
| Stable or APK requested | Coordinate the stable HTML/APK across GitHub Releases and itch.io; update Pages game HTML; follow the requested version |
| Test-page-only change | Test page and maintenance notice/changelog only; no game release or version bump |
| README/documentation/dashboard-only change | Normal repository maintenance; no game build/release merely for the text change |

Stable GitHub releases must include **APK, standalone HTML, and source ZIP/tar.gz packs** (GitHub’s automatically generated source archives satisfy the source-pack requirement). Recent packaging also includes an HTML ZIP and SHA256SUMS. Use a prerelease label for dev versions so stable update checking and `/releases/latest` continue to select stable releases. Verify uploaded assets, tag target and actual Pages deployment; a successful click or commit alone is not verification.

For stable synchronization, do not silently omit itch.io or APK. Preserve original signing identity and local data. Never strip update checking, optional music downloading or loop recovery as a shortcut.

**Issues and dashboard:** the owner first requested issue checks on GitHub visits, then required a dashboard update whenever issues are checked, then explicitly exempted **dev versions from both issue checks and dashboard updates**. For stable work, check issues and update the dashboard together. Outside dev work, if checking issues, also update the dashboard; report new issues to the owner. Do not repeatedly run the old unconditional issue check on every dev maintenance operation. The owner’s earlier instruction about contacting a reporter applies only after they decide to fix that issue; do not send unsolicited messages merely because a report exists.

**README presentation:** keep the live read-only visits badge under the title. Keep the test-page link after the ordinary play/download links and before “Watch how it was made.” Do not move it back above the introduction.

**Promotion:** write fresh copy. “Like the first post” means preserve the useful format/amount of detail, a playable link and hashtags, not copy the first post verbatim. The owner explicitly objected to a copied post. When screenshots are requested, use actual gameplay screenshots, not invented gameplay or video. Include no video if the owner says no videos. Add useful image descriptions and retain honest AI disclosure. A previous request to reply to someone praising the game was canceled because the owner had already replied; do not revive it. YouTube sign-in may be requested by the owner when a video is ready; never assume an old signed-in state is still valid.

## 9. Dashboard and privacy details

Read [STATS.md](STATS.md) before updating counters. GitHub visitors/clones are rolling 14-day owner-verified snapshots. itch.io page views/plays are dated owner-verified snapshots. Public release asset download counts and approximate Pages hits have automatic readers. Do not combine these into a unique-player total, fabricate unavailable values, add overlapping periods, or replace an error with zero.

The game-page hit counter is the incrementing request; the dashboard and README use a **read-only Shields dynamic JSON badge** for the same Hits total. Keep README/dashboard views from incrementing the game counter. Only canonical game routes count, not the test lab, archived versions or APK. Badge caching can delay visible changes. No player scores, word records or account credentials are sent by this counter, but third-party requests have normal network metadata. Avoid blanket claims of “no network requests/tracking of any kind” now that aggregate counters exist.

Do not publish credentials for private traffic/itch.io analytics. Update only aggregate values and actual observation timestamps in `stats/data.json`; keep reporting periods and unavailable-state explanations honest.

## 10. Roadmap: wanted, but not yet implemented

1. **Expanded word sets:** the first expansion is done in 1.6.8.1. Preserve all original words and appropriate Normal/Hard lengths when expanding further.
2. **Magnet block:** implemented in HTML dev 2.0-dev3; see the current-dev note above. The pickup uses a one-time pull; there is no timed persistent aura. Stable promotion is a separate owner decision.
3. **Story mode:** the owner’s core idea is **collect letters to complete words that spell out a story**. This goes beyond another random word set: completed words should build sentences and a readable narrative. Story selection, progression, reading pace, retries, persistence and how arcade pressure interacts with reading still require design decisions. Do not ship an invented complete story-mode specification as if approved.
4. General gameplay improvements and feedback-driven changes remain possible. A public roadmap mentioned votes on major changes; do not claim a voting system exists without implementing it.

Protect the finished arcade experience while these additions are developed. Prefer independent modes/options where the owner requests them, rather than quietly rewriting all existing rules.

## 11. Starting a future session

1. Read this handover, `RELEASE-PLAN.md`, the relevant source files and latest owner request. Check actual branch/platform state rather than relying on this dated version snapshot.
2. Classify the work as ordinary game dev, stable/APK, test-only or documentation maintenance before choosing versioning/publication steps.
3. Work from readable source; preserve unrelated changes and private signing material. Do not blindly reset a dirty checkout or publish transient local files.
4. Implement and run checks appropriate to the behavior changed. Rebuild the shared test page with game updates; keep test-only code out of ordinary artifacts.
5. Playtest, publish within the authorized scope, verify the live result/assets and report the change with relevant limits. Do not claim a release, test, sign-in or dashboard refresh that was only attempted.
6. Update this handover when project state or policy materially changes. Keep it public-safe: no account passwords, tokens, personal chat history, private keys or unrelated personal information.
