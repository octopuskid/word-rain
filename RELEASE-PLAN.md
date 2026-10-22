# Release policy

Current stable: **1.6.8**.

Unless the user mentions APK or stable, publish an HTML-only development prerelease to GitHub Releases and GitHub Pages. Do not build an APK or update itch.io. Dev versions append a sequence to current stable, such as 1.6.8.1.

For an APK or stable request, synchronize APK and HTML to GitHub Releases and itch.io, and publish the HTML game on GitHub Pages. Preserve the Android app ID, signing certificate and storage keys. Use the requested stable number, or increment the stable patch when omitted.

The separate browser test lab stays on GitHub Pages only, outside release APKs and itch.io packages.
