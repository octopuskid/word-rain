# Word Rain Android — native edition

From **2.0-dev10 DEV / build 49**, Android runs Java gameplay rules, Android Views and Canvas. It does not instantiate WebView, execute JavaScript, or package HTML/CSS. The web edition remains a separate Classic game built from `src/index.html`.

Current stable: **2.0.3 / build 55**. Story uses `StoryUi`/`StoryGameView`, a dedicated static weight-800 `story-ui.ttf` for rounded heavy headings/UI, and readable system text for prose/word prompts. Chapters 2/3 show completed original tokens below the game. Classic uses gentle rainfall instead of its grid. 2.0.1 adds atomic magnet pulls, both 1% pickups, a larger multiline final score and opaque HTML cloud artwork; save/audio formats remain unchanged; the web edition now also has Story, with no player Stats UI.

Dev11's Stats table, exclusive 1% magnet/shield pickups, synchronized Classic target progress, large coloured HUD and basket-bottom magnet boundary remain in place.

## Code

- `GameEngine.java`: platform-independent Classic/story simulation, matching portrait coordinates, timing, balanced letter selection, scoring, shields, wildcard overlaps, magnets, combos, speed, hearts and Rick challenge.
- `GameData.java`: four 120-word sets, ten unrelated Chapter 1 words, and prewritten 50/100-word stories. Story words advance in order; completed words checkpoint separately from Classic records.
- `StatsTable.java`, `PlayPresentation.java`: aligned native word records, shared target/progress state and independent HUD bonus flags.
- `StoryUi.java`, `StoryGameView.java`: native Story-only dev7 Dream Sans styling; shared dev11 engine/input, original 360×430 visual composition mapped to the unchanged simulation coordinates.
- `MainActivity.java`, `NativeHome.java`, `GameView.java`: native menus, difficulty-first setup, fixed Home layout, direct drag/keyboard input, pause, results, chapter selection, records and first-run tutorial. Home title uses the Classic system font.
- `NativeStore.java`, `LegacyStore.java`: local SharedPreferences and read-only migration of the previous app's Chromium local storage. Reads LevelDB logs and compacted tables, including Snappy-compressed blocks. Existing Chromium files stay untouched. Invalid/unreadable entries are skipped; actual device migration remains to be verified.
- `NativeAudio.java`, `native-audio.cjs`: SoundPool effects, MediaPlayer music, original eight-bar Pocket Forecast synthesis, audio focus/lifecycle pause, verified optional downloads and session-only local audio.
- `UpdatePolicy.java`: stable-only, once-per-launch update check without downgrading a dev installation.

The old `mobile.py`/`mobile.js`/`dream.js` and their tests document the previous HTML Android implementation. The native APK build does not use them. Do not reintroduce them into the APK to resolve native bugs.

## Build

Requires Java 17+, Node, Python 3, Eclipse ECJ and Android SDK platform/build tools. Keep signing material outside the repository; use the original app identity/key to install over existing versions.

```sh
python android/build.py \
  --build-tools /path/to/android/build-tools \
  --android-jar /path/to/platform/android.jar \
  --ecj /path/to/ecj.jar \
  --keystore /private/word-rain-release.p12 \
  --password-file /private/signing-password.txt
```

The script synthesizes offline WAV assets, copies native TTF fonts/art/licenses, compiles Java 8 bytecode (ECJ uses its host JRE and the Android API classpath), desugars through D8 for API 26, aligns and signs the APK. Check `versionName`, monotonically increasing `versionCode`, original certificate and payload. APK assets must contain no `.html`, `.js` or `.css` files. Optional recordings are never bundled.

## Tests

Compile `GameData.java`, `GameEngine.java`, `LegacyStore.java`, `UpdatePolicy.java` and `tests/NativeEngineTest.java`, `tests/NativeLegacyTest.java`, `tests/UpdatePolicyTest.java` with ECJ to a temporary class directory, then run their main classes with Java. These tests exercise the real platform-independent native classes. `node android/tests/native-parity.cjs /path/to/ecj.jar` compares 176 state transitions against the separate HTML engine; the generated HTML reference is test-only and never enters the APK. `tests/native-package.cjs` verifies the signed APK structure, word data and native source boundaries.

Compilation, Java tests, migration fixtures and APK inspection do not establish physical-device behavior. Before stable release, install on a phone and check: actual Home buttons and absence of scrolling; drag catches; small displays/large text; migrated records/settings/story saves; pause/background/update prompts; local/downloaded/original music playback and loop wrap; audio focus and haptics. 2.0.0 is published as stable at the owner’s request; these physical-device checks remain unverified in this environment.

2.0.1 pickup checks: `NativeMagnet201Test.java` and `magnet-201.cjs` supersede the historical dev11 exclusive-pickup tests. Story chapter rules remain unchanged. Native cloud PNGs are rendered from the existing HTML SVG artwork with Inkscape.

2.0.2 enhances rendering performance by reusing Overcast drawing objects. Current maintainer handover: `../docs/HANDOVER-2.0.2.md`.

2.0.3 adds Android Home → Cheat code → `export` / `import` for versioned JSON save backups, using system document pickers, bounded validation, confirmation and atomic allowlisted preference replacement. Music files and active runs are excluded.

Backup regression command: `node android/tests/save-backup.cjs /path/to/ecj.jar /path/to/json-20240303.jar`. The test-only org.json runtime is available from Maven Central; it is not bundled in the APK, which uses Android org.json. Minimal SharedPreferences/Context doubles live in tests/support and are excluded from production compilation.
