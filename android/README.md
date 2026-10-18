# Word Rain for Android

Offline Android wrapper for the HTML game in the repository root. Android 8.0 (API 26) or newer and an up-to-date Android System WebView are required.

- The APK embeds the game and MIT license. It does not fetch the game from a website.
- No Android permissions are requested, including INTERNET or storage access.
- JavaScript and local theme storage are enabled; file/content access and network loads are disabled. No JavaScript-to-native bridge is exposed.
- Phones (smallest width below 600dp) request sensor portrait; larger devices request sensor landscape. Android may override orientation requests in multitasking or on large screens.
- The game pauses when the Activity goes into the background.
- User-selected itch.io/GitHub links open in the installed browser, separately from the offline game.
- App data contains only the theme preference. Uninstalling removes it.

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

Output: `android/build/word-rain-1.0.0.apk` and `SHA256SUMS.txt`. The script compiles resources, compiles Java, converts classes to DEX, aligns the APK, signs it, and verifies the signature and alignment. It copies the root game's current HTML into the APK at build time, removing only the `target="_blank"` attribute so native link handling can open the browser.

The published release uses a private release key, not Android's shared debug key. Future updates to the same app must use that same private key and a higher manifest versionCode. The signing key is intentionally absent from this repository and release assets.

## Validation and limitations

Release checks verify compilation, APK signatures, ZIP alignment, embedded game bytes, launch Activity, SDK versions, and the absence of permissions. These checks do not replace testing on a real Android device. This first APK has not been tested on physical Android hardware or an Android emulator in the build environment.

MIT license, as in the repository root.
