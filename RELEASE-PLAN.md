> Owner decision: skip 1.7.0 stable. Its release/tag were withdrawn; keep only the archived HTML. 1.7.1 is based on v1.7.0-pre1, Android build 40.

# Release policy

Current stable: **1.7.1**, Android build **40**.

Current HTML development version: **2.0-dev2 DEV** — difficulty-first setup and Android first-launch tutorial, with an explicitly requested signed test APK (build 41). Skip 1.8; development now targets 2.0. 1.7.0-pre1 remains archived and available.

Unless the user mentions APK or stable, publish an HTML-only development prerelease to GitHub Releases and GitHub Pages. Do not build an APK or update itch.io. Dev versions append a sequence to current stable, such as 1.6.8.1.

For a stable request, synchronize APK and HTML to GitHub Releases and itch.io, and publish the HTML game on GitHub Pages. Preserve the Android app ID, signing certificate and storage keys. Use the requested stable number, or increment the stable patch when omitted.

The separate browser test lab stays on GitHub Pages only, outside release APKs and itch.io packages.

Always rebuild and publish the browser test page alongside game updates. Test-page-only maintenance gets a notice on the test page and in CHANGELOG.md, without a new dev/stable release or version bump. Store versioned HTML snapshots under `versions/`.

The owner may request a semantic prerelease name such as `1.7.0-pre1`; use that exact version and mark it as a prerelease. Dev releases skip issue checks and dashboard updates.

Do not upload a separate SHA256SUMS/checksum file in future releases; use GitHub’s built-in asset digests. Keep integrity checks for optional music downloads.

Every development release must say **DEV** in its release title and game version label, with GitHub’s **Pre-release** flag enabled.

Owner exception for 2.0-dev2: publish a signed Android testing APK as a GitHub prerelease alongside HTML/Pages. Keep itch.io on stable 1.7.1. APK build 41 is consumed; any later in-place update must use a greater version code.
