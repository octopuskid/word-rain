# Word Rain — handover after 2.0.2

Prepared 29 October 2026 for octopuskid / Hina. This is the current-state summary; older sections in HANDOVER.md are historical. Follow the owner's newest instructions when they differ.

## Release and destinations

Current intended stable: **2.0.2**, native Android **versionCode 54**. Previous stable 2.0.1/build53 is the gameplay baseline. Source starts from main commit `9ee6b37a6ade46f269035497376286dabde6752f`; the finished release tag is the authoritative final source reference.

- Repository: https://github.com/octopuskid/word-rain
- Stable release: https://github.com/octopuskid/word-rain/releases/tag/v2.0.2
- Play: https://octopuskid.github.io/word-rain/
- Isolated web lab: https://octopuskid.github.io/word-rain/test.html
- Audience dashboard: https://octopuskid.github.io/word-rain/stats/
- itch.io: https://octopuskid.itch.io/word-rain (project 5179831)

Release assets: original-signed APK, standalone HTML, offline ZIP, Nunito font license, and this handover. No separate SHA256SUMS asset: the owner prefers GitHub's built-in digests. Stable releases are Latest, never prerelease. All development versions must visibly say DEV and be marked GitHub prerelease. Test-page-only maintenance needs no release, APK or version bump.

## 2.0.2 additions and documentation preference

Android Home has a native **Cheat code** button in its upper-right corner, using the same scaled, non-scrolling layout as the other Home controls. Trimmed, case-insensitive codes:

- `story`: mark all three chapters completed in existing `word-rain-story-v2` storage; clear the in-memory Story run so an unfinished old run cannot contradict the completion. This deliberately changes Story completion, while keeping Classic records.
- `test`: launch a separate native Classic engine with manual spawning initially enabled. TEST MODE Controls can drop current/next/random letters, ×, shield, wildcard or magnet; clear blocks; toggle ordinary automatic waves; choose speed and hearts; restart; or exit Home. It uses actual gameplay catches and overlaps. Its event callbacks have no record, best-score, checkpoint or unlock writes. Exiting/restarting disposes the test run; it does not replace the paused real Classic engine. Saved appearance/difficulty can be read, but sandbox controls never save those settings.

The codes are convenience shortcuts, not authentication or a secret security boundary. The owner asked not to advertise them in README; public release wording should focus on enhanced performance. Keep this maintainer information here. Rendering improvement: GameView now reuses its cloud RectF, ColorMatrix and dark color filter instead of allocating those objects on each Overcast frame. This is an allocation reduction, not a measured FPS claim.

Android remains native Java Views/Canvas. Do not put HTML or WebView back into the APK. Web has no cheat-code menu or native sandbox and no player Stats screen. It retains its separately isolated public test lab.

## Architecture and files

Native: `android/src/io/github/octopuskid/wordrain/`.

- MainActivity: navigation, native setup, HUD, tutorial, music controls, optional downloads, update checks and cheat/test dialogs.
- NativeHome: fixed 360×720 design coordinates scaled to usable space; 10 measured children after 2.0.2. If adding a child, also extend bounds and sizes. No Home scroll interception or WebView hacks.
- GameEngine: pure Java Classic/Story rules; `manualSpawns` only suppresses scheduled waves, so manual drops, catches, overlaps and pause still use real rules. Production engines default false.
- GameView: Classic portrait Canvas, rainfall, shared background word progress, opaque Overcast, basket and direct native touch input.
- StoryUi/StoryGameView: dreamy Story-only design, rounded heavy Nunito UI; readable system font for prose and word prompts.
- NativeStore: local SharedPreferences, records and Story checkpoints; LegacyStore: read-only Chromium LevelDB/log/SST/Snappy migration for former WebView versions. Never erase old files to migrate.
- NativeAudio: original synthesized music/SFX, MediaPlayer/SoundPool, optional verified downloads, local audio selection. Preserve consent, offline cache and lifecycle/audio-focus behavior.
- PlayPresentation: shared upper/background target, purple wildcard hearts, yellow double-score text and shield visibility. StatsTable: Android Word/Met/Perfect table.

Web: `src/index.html` contains ordinary Classic; `src/story.html`, `.css`, `.js` contain Home and Story. `tools/story-web.cjs` composes them; `node tools/build-web.cjs` writes root index, versioned HTML and lab. `node tools/build-test.cjs` rebuilds only test.html. Do not hand-edit generated HTML.

Clouds: HTML assets/clouds.svg and clouds-handwriting.svg; landscape gets its own wide artwork. `python tools/render-native-clouds.py` uses Inkscape to produce native PNGs. They are opaque, not transparent overlays. Cloud coverage is the middle half, not the whole playfield. Dark regular clouds use brightness .76; paper keeps its pencil style.

Fonts: static Nunito weight800 story-ui.ttf/woff for Story UI only. The older variable dream.ttf defaults to a very light weight; blindly using it recreates thin type. Classic wordmark uses the Classic system bold face. The W2 logo comes from the owner's sketch refined earlier; preserve it.

## Gameplay contract to preserve

Classic: four 120-entry sets (480 entries), Normal 4–7 letters and Hard 6–7; three HP; original movement, scoring, shuffled targets, speed, perfection, shields, wildcard and Rick rules. Ordinary catches differ from magnet batches. Do not change them by interpreting one mode's rule as universal.

Current 2.0.1 magnet rules retained in 2.0.2:

- Magnets and shields each occupy a separate 1% share of emitted Classic blocks in Normal and Hard. No selector; shield meter always visible. Ignore the obsolete saved magnet-mode selection.
- Picking a magnet atomically selects eligible blocks within126 engine units (3.5 tile widths). Centers beyond basket bottom y485 are permanently excluded. Later arrivals are not attracted.
- Snapshot current letter L0 and next L1. Each selected ordinary letter matching either fills one blank, including duplicate L0, L0+L1, or duplicate L1, regardless of order. Cap fills at this word boundary. Other pulled letters give exactly +1 without changing progress, speed, shields, scoring pause, wildcard status or perfection.
- One or more pulled × together cost one HP per pulse. A selected wildcard immediately perfects the current word via normal completion rewards. Multiple wildcards do not spill into the next word. Shield pickups retain their normal pickup/overload behavior.
- Selected drops carry magnetResolved: effects happen once at activation, then blocks visually move toward the basket without further overlap or catch rewards. Do not reapply their effects on arrival.
- Falling magnets disappear on touching other blocks; shield+magnet removes both. Normal overlap rules still apply to unselected blocks.

Classic final score is larger and multiline. Upper and faint background words synchronize progress. Purple hearts show wildcard mode; yellow score shows double scoring. Preserve the cropped native board (x0..480, top−28, bottom490) and basket bottom485.

Story is a separate finite challenge: Chapter1 ten unrelated words; Chapter2 one original exactly50-word story; Chapter3 one original exactly100-word story. Display the full prewritten next token first, catch its letters in order, then show the next word. Players do not compose the stories. Completed Chapter2/3 tokens accumulate below the game with original case/punctuation. Wrong letter or × costs a heart; missed blocks are harmless. Save word-level checkpoints under story-v2; retry with three hearts. Do not retroactively import old story-v1 chapter completion. Classic and Story preserve separate paused engines; navigation never silently resumes a run.

Rick remains an ordinary-catch secret sequence, not triggered by atomic magnet letters. Saves/unlocks and optional music are preserved. Do not add ads, accounts, a database, paywalls or Google Play publishing without a new request.

## Build, signing, tests and limits

Package `io.github.octopuskid.wordrain`; minSDK26, target35. VersionCode54 must be increased in future APKs. Original certificate fingerprint SHA256: `86dfb3c77defffb62216628182b6c3ee74bc9c5a8bc31f6e143c84d397bdd089`. Use the existing private release signing backup. Never generate a replacement key or publish credentials, tokens, keystores or password files. Install over the existing app to retain data; uninstalling loses it. Update checking stays stable-only, once per fresh launch, with no reconnection polling.

Build instructions and command arguments are in android/README.md and android/build.py. Compilation uses Android35 jar, ECJ, aapt2, D8, zipalign and apksigner. The private tools/signing files are outside the repo. In a new environment ask for the original private signing backup only if unavailable; don't claim this chat automatically transfers private files.

Regression suites: NativeEngineTest (291 assertions); NativeMagnet201Test; NativeTestMode202Test; NativeLegacyTest; UpdatePolicyTest; native-parity.cjs (176 native/HTML transitions); native-package.cjs; story-200.cjs (all160 Story words); magnet-201.cjs; check-test-lab.cjs; check-wordsets.cjs. Historical dev11 pickup suites encode superseded exclusive generation and are not current 2.0.1+ acceptance tests.

The web lab builder once removed id=meters while adding Test HP, crashing startup before the loop. Preserve every shared DOM ID; the real generated-DOM check exists because permissive VM mocks otherwise auto-created missing elements and hid the bug. Test lab heading now derives from the shared version. Lab Classic/Story settings/checkpoints/records are namespaced away from real play.

Native build, engine tests and APK inspection are not physical-phone tests. Actual Android Home button taps, cheat dialogs, small-screen/text-scale fit, drag input, audio focus, migration and update prompts still need device verification. Do not claim those were tested here. The performance change has no measured benchmark.

## Publishing and continuity

Use latest remote main as the base. The existing workspace's local Git HEAD can be stale and many already-published files appear dirty/untracked. Never reset or push all local changes indiscriminately. Publish explicitly selected files on the current remote tree with an expected-head lease. The GitHub connector supports source Git data, not release asset uploads; signed-in browser release forms provide uploads and Latest selection. Verify release uploaded sizes/digests against local artifacts. Never expose private auth.

Stable workflow: source + Pages + shared test lab, signed APK and release, itch playable HTML/downloads, and audience dashboard maintenance. Keep older itch files hidden rather than deleting history. itch description source editor needs a real keyboard change (e.g. End then Space), then toggle back and Save to synchronize the rich editor. Verify public content and run the actual embed after saving. Do not send promotional posts/messages unless specifically requested.

Dashboard counters are audience events, not player Stats. Don't add views/clones/plays into a people count. Retain dated private snapshots and their periods rather than pretending refresh is live analytics. Last private snapshots: GitHub7 visitors/218 views/1232 clones/333 unique cloners, 14–27Oct chart; itch24 views/2 browser plays, 29Sep–28Oct. 2.0.2 issue check found zero open issues. No new private analytics snapshot is implied by updating the release badge.

## Design direction and future work

The owner's goal is a small free pocket arcade with Classic score chasing and a distinct dreamy Story experience. Their sketches and specific behavior requests govern changes. They favored the native design after WebView tap/scroll failures. Preserve that direction and avoid redesigning unrelated screens.

Possible next work, not approved requirements: physical-device QA first; clarify whether future magnet letters beyond L1 should count (the requested examples and current implementation cover L0/L1); expand native sandbox with custom words/positioning only if desired; add more authored Story chapters with meaningful progression rather than arbitrary content; measure rendering time/allocations before broader performance work. No sequel schedule is mandated. Make a narrow fix when a concrete bug appears.

Communicate in English. The owner knowing some Chinese does not imply understanding Chinese responses. Be concise, act on authorized work, avoid repeated confirmation and clearly distinguish verified results from assumptions. Keep DEV labeling explicit and do not offer separate checksum files. User directions in the latest conversation override dated handover guidance.
