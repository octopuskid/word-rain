# Word Rain for Android

Current test APK: **2.0-dev5 DEV / build 44**, published as a GitHub prerelease by explicit request. itch.io remains stable 1.7.1. Install over the existing app to keep records. This update adds a dreamy Android-only Classic / Story / Stats home, W2 logo and icon, offline Nunito font, and a three-stage story chapter with separate saved progress. It retains the Android-only first-launch tutorial (skippable/replayable, saved locally) and settings shown only before runs and after game over. A future stable APK must use a version code above 44.

Current stable: **1.7.1**, version code **40**. One APK replaces either older Full or Lite in place. Install over the existing app to keep personal best, word records, settings and Rick unlocks. App ID, signing certificate, stable HTTPS WebView origin and storage keys are unchanged. Do not uninstall first.

The game, Pocket Forecast and sound effects are bundled for offline play. Neither Kevin MacLeod recording is packaged. Selecting an optional song asks for download permission, then fetches only that approved track from the Word Rain GitHub repository. Size/SHA-256 checks precede an atomic private-file save. Verified tracks survive reopening and in-place updates. Failed downloads leave original music usable and can be retried. Only the two catalog IDs/files/URLs are accepted by the native bridge; private cached audio supports byte ranges through the existing local HTTPS origin. Local audio importing still reads only the selected document, up to 24 MB, with no upload.

The native checker attempts the latest stable GitHub release once on opening, with validated connectivity. It does not poll, retry, check on reconnection, or check again after returning from another app in the same session. An offline or failed attempt waits until the next fresh launch. Dev/draft/prerelease entries are ignored, and a standard APK asset is required. A newer version pauses play and offers the release page; APK downloading/installation is manual. **1.6.2 users must manually install 1.6.3 or later once** because that older checker requires both retired APK variants.

Normal permissions: INTERNET and ACCESS_NETWORK_STATE for update checks and approved music downloads, VIBRATE for HP loss/shield shattering. No storage permission, analytics, accounts, player-data upload or background service. GitHub receives ordinary requests including IP address. WebView network loads and file/content access remain blocked. Only bundled HTML runs with the native bridge; external links open separately in the browser.

Android uses the portrait playfield on all devices; landscape is exclusive to HTML. Native insets keep the header/footer away from system bars. Drag to move; on-screen arrows are hidden on phones. Opening Stats pauses play and hides pause/Give up/BGM/SFX; returning stays paused. Stats reset asks first and preserves personal best. All saved game data stays local; clearing app data/uninstalling removes it.

## Build

Requires Python 3, Java 17+, Android SDK Platform 35, Android SDK Build Tools 35.0.0, and Eclipse ECJ 3.40.0 (`org.eclipse.jdt:ecj:3.40.0` from Maven Central). Android SDK downloads are available from Google's Android developer tools page. Use SDK Manager to install `platforms;android-35` and `build-tools;35.0.0`.

Use the original production signing key and password (keep both private). Never generate a replacement key for an existing installation. The alias must be `word-rain`. Do not put private keys or passwords in Git.

```sh
python3 android/build.py \
  --build-tools "$ANDROID_HOME/build-tools/35.0.0" \
  --android-jar "$ANDROID_HOME/platforms/android-35/android.jar" \
  --ecj /path/to/ecj-3.40.0.jar \
  --keystore /private/word-rain-release.p12 \
  --password-file /private/signing-password.txt
```

Output follows the manifest version, currently `android/build/word-rain-2.0-dev5.apk`. No separate checksum file is generated. The build reads versionName from AndroidManifest.xml. The script compiles resources, compiles Java, converts classes to DEX, aligns the APK, signs it, and verifies the signature and alignment. It combines the root game’s HTML with Android-only `mobile.css` and `mobile.js` through `mobile.py`, then removes `target="_blank"` so native link handling can open the browser. The web versions are unaffected.

The published release uses a private release key, not Android's shared debug key. Future updates to the same app must use that same private key and a higher manifest versionCode. The signing key is intentionally absent from this repository and release assets.

## Validation

Run all `android/tests/*.cjs` suites against `android/build/assets/index.html`. They cover gameplay, saves/migration, stats, shield and hazard rules, sounds, Overcast and optional music confirmation/cancel/native completion. UpdatePolicyTest.java covers numeric stable ordering and development-tag rejection. Release checks include compilation, signatures, alignment, embedded HTML identity and absence of packaged MP3s. Physical Android connectivity, dialogs, audio codecs, haptics and installation still require a device smoke test.

Cloud generation: `python tools/build_cloud_textures.py`; launcher generation: `python tools/build_launcher_icon.py`. Earlier release details are in [CHANGELOG.md](../CHANGELOG.md).

1.6.4 (code 33) promotes 1.6.3.3: compressed self-contained HTML, shorter intro, Quick rules and purple paper wildcards. No lab tools are present in the APK. The separate GitHub Pages test lab is browser only.

1.6.8 (code 37) promotes the 1.6.4.1 scoring changes: ceil(base × mode × Overcast × current speed), with Hard and Overcast each multiplying by 2.

1.7.1 (code 40) resumes from 1.7.0-pre1, links the title to GitHub and keeps Android portrait-only. Once-per-launch update checking and optional music downloading remain intact. Landscape clouds are exclusive to the HTML wide layout.

Story implementation: `dream.html`, `dream.css`, `dream.js`; all story assets are embedded by `mobile.py` only for Android. Story records use `word-rain-story-v1`; Classic storage keys are unchanged. Nunito license is bundled as `assets/Nunito-OFL.txt`. Home pauses both modes; native update/background paths call `wordRainPauseAll`.
