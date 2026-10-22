# Release policy

Current stable: **1.6.8**.

Current HTML development version: **1.6.8.2** — Overcast changes apply to the next new game.

Unless the user mentions APK or stable, publish an HTML-only development prerelease to GitHub Releases and GitHub Pages. Do not build an APK or update itch.io. Dev versions append a sequence to current stable, such as 1.6.8.1.

For an APK or stable request, synchronize APK and HTML to GitHub Releases and itch.io, and publish the HTML game on GitHub Pages. Preserve the Android app ID, signing certificate and storage keys. Use the requested stable number, or increment the stable patch when omitted.

The separate browser test lab stays on GitHub Pages only, outside release APKs and itch.io packages.

Always rebuild and publish the browser test page alongside game updates. Test-page-only maintenance gets a notice on the test page and in CHANGELOG.md, without a new dev/stable release or version bump. Store versioned HTML snapshots under `versions/`.
