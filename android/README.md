# Word Rain for Android

Offline Android wrapper for the HTML game in the repository root. Android 8.0 (API 26) or newer and an up-to-date Android System WebView are required.

- The APK embeds the game and MIT license. It does not fetch the game from a website.
- No Android permissions are requested, including INTERNET or storage access.
- JavaScript and local theme storage are enabled; file/content access and network loads are disabled. No JavaScript-to-native bridge is exposed.
- Phones (smallest width below 600dp) request sensor portrait; larger devices request sensor landscape. Android may override orientation requests in multitasking or on large screens.
- Move the basket by dragging across the play area. The Android UI hides the left/right buttons and shows a touch-specific tip; attached-keyboard controls remain available.
- The game pauses when the Activity goes into the background.
- A native container reserves system-bar/cutout insets plus 6dp top and bottom breathing room. The WebView viewport and fixed bottom tabs stay inside this area, away from the status and navigation bars.
- User-selected itch.io/GitHub links open in the installed browser, separately from the offline game.
- The Game screen shows a persistent personal best. Bottom tabs switch between Game and Word Stats; opening the table pauses active play. The pause/resume and Give up buttons are hidden in Word Stats, and the game stays paused when returning until the player chooses to resume. Keyboard shortcuts cannot resume play behind the table.
- The mobile header uses a smaller title and spacing while retaining native safe-area clearance. Reset word stats in the Stats tab asks for confirmation, clears only word encounters/perfect counts, and keeps the personal best, theme and current game.
- Word sets and difficulty match the browser game. Records include all sets and keep old entries even when another set is selected. Switching settings starts a new round without deleting the personal best or word records.
- The Word Stats table stores how often each word became the target and how often it was perfected. A wrong-letter restart or pause/resume does not add an encounter. Perfect counts follow the existing shield exceptions.
- High score, word records, and theme preference are stored only in the app’s local WebView storage. Updating with the same app ID and signing key preserves them; uninstalling or clearing app data removes them. There is no MySQL/server or online leaderboard.
- The Rick unlock and selected word set/difficulty/color theme are also saved locally. Reset word stats keeps all of these. Rick challenge symbols do not add scores or word records.
- If local storage is unavailable, a notice explains that records last only for the current session.

## Build

Requires Python 3, Java 17+, Android SDK Platform 35, Android SDK Build Tools 35.0.0, and Eclipse ECJ 3.40.0 (`org.eclipse.jdt:ecj:3.40.0` from Maven Central). Android SDK downloads are available from Google's Android developer tools page. Use SDK Manager to install `platforms;android-35` and `build-tools;35.0.0`.

Create your own signing key (keep it and the password private). The alias must be `word-rain`. Do not put private keys or passwords in Git.

```sh
python3 android/build.py \
  --build-tools "$ANDROID_HOME/build-tools/35.0.0" \
  --android-jar "$ANDROID_HOME/platforms/android-35/android.jar" \
  --ecj /path/to/ecj-3.40.0.jar \
  --keystore /private/word-rain-release.p12 \
  --password-file /private/signing-password.txt
```

Output: `android/build/word-rain-1.3.0.apk` and `SHA256SUMS.txt`. The build reads versionName from AndroidManifest.xml. The script compiles resources, compiles Java, converts classes to DEX, aligns the APK, signs it, and verifies the signature and alignment. It combines the root game’s HTML with Android-only `mobile.css` and `mobile.js` through `mobile.py`, then removes `target="_blank"` so native link handling can open the browser. The web versions are unaffected.

The published release uses a private release key, not Android's shared debug key. Future updates to the same app must use that same private key and a higher manifest versionCode. The signing key is intentionally absent from this repository and release assets.

## Records tests

After building, run `node android/tests/mobile-records.cjs` (Node.js required). The checks exercise real game catches, score persistence/migration, all word sets and difficulties, yellow 2× scoring boundaries, shield/purple behavior, exact wildcard roll chances, the complete Rick sequence and delayed failures, unlock persistence, Give up confirmation, tab pause behavior, and corrupt or unavailable storage in both web and bundled Android game code.

## Validation and limitations

Release checks verify compilation, APK signatures, ZIP alignment, embedded game bytes, launch Activity, SDK versions, and the absence of permissions. These checks do not replace testing on a real Android device. This first APK has not been tested on physical Android hardware or an Android emulator in the build environment.

MIT license, as in the repository root.
