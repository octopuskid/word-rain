# Release policy

Current stable: **1.6.4**. Unless the user requests APKs, updates are development releases containing HTML only. Dev numbers append a sequence to the current stable version: `1.6.4.1`, `1.6.4.2`, and so on. Verify when possible; if verification is unavailable, publish with a clear unverified notice.

An APK request means a stable release: build the single merged APK (Full/Lite were retired in 1.6.3). Use the requested stable number, or increment the stable patch by one when omitted. Preserve the app ID, signing certificate and storage keys. Update HTML, GitHub demo, itch.io and current How to play together unless the user limits destinations. No 1.6.0 APK was released.

itch.io hosts the latest stable only. GitHub Pages hosts the latest development game when present (otherwise current stable), plus the separate `test.html` lab. Do not ship the lab in Android or itch.io.
