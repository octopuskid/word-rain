# Word Rain project counters

The separate public dashboard is at **https://octopuskid.github.io/word-rain/stats/**.

| Counter | Definition | Update method |
| --- | --- | --- |
| GitHub visitors | Unique visitors to the repository over GitHub's last 14 days; also shows views | Dated owner-verified snapshot in `stats/data.json` |
| GitHub clones | Full repository clones over the last 14 days; also shows unique cloners | Dated owner-verified snapshot |
| GitHub downloads | Sum of `download_count` for assets on all currently published releases, including prereleases | Public GitHub API on dashboard load / Refresh, with a Shields download-total badge fallback |
| GitHub Pages visits | Approximate game-page loads since counter installation on 21 October 2026 | Hits badge in the main game; dashboard reads without incrementing |
| itch.io visitors | Page views, **not** unique people | Dated owner-verified Analytics snapshot |
| itch.io plays | Browser plays; does not count offline or APK play sessions | Dated owner-verified Analytics snapshot |

These are not six measures of unique players. Do not sum them. GitHub/itch analytics may include maintenance and automated activity. Deleting release assets removes their historical counts from the downloads total. Source archives are not release assets and are not counted.

## Snapshot maintenance

Check GitHub **Insights → Traffic** and itch.io **Dashboard → Word Rain → Analytics**. Copy only the displayed aggregate figures into `stats/data.json` and set the relevant `checkedAt` to the actual observation time in ISO 8601 format. Retain the reporting period. Do not add overlapping 14-day snapshots together. itch.io does not provide unique visitors in this dashboard, so keep its label as page views.

Snapshots intentionally **do not update automatically**. A public GitHub Pages site cannot securely contain the credentials needed for these private dashboards. GitHub's traffic REST endpoints require repository Administration: read. Future authenticated automation must run on a server or workflow with secrets, publish only these aggregate values, and never put a token, session cookie or password in HTML, JavaScript, a URL or this JSON file. itch.io browser plays remain manually verified unless a supported source is available.

## Game-page counter

Only the canonical web game's `/word-rain/` and `/word-rain/index.html` routes on `octopuskid.github.io` load the Hits badge. The statistics page, test lab, version archives, itch.io, other hosts and APK do not count. A visible footer links to the dashboard and labels the service. The badge is requested once per document load with no referrer; it does not read saved scores or word records. It is optional and cannot block gameplay. Earlier untracked visits cannot be recovered.

The dashboard uses a Shields dynamic JSON badge to read `https://hits.sh/api/urns/octopuskid.github.io/word-rain` server-side (the Hits JSON endpoint does not provide browser CORS headers); refreshing the dashboard never requests the incrementing Hits SVG. An error is shown as unavailable, not zero. Blockers, service outages and public counter manipulation mean this is an approximate hit count, not a reliable unique-person count.

## Sources

- [GitHub traffic API and permission requirements](https://docs.github.com/en/rest/metrics/traffic)
- [GitHub release asset download_count](https://docs.github.com/en/rest/releases/assets)
- [itch.io Analytics](https://itch.io/game/summary/5179831) (owner only)
- [Hits source and badge documentation](https://github.com/silentsoft/hits)
- [Hits privacy policy](https://hits.sh/privacy/)

No new game release, APK, save format or gameplay change is needed for this dashboard.

- [Shields GitHub download-total badge](https://shields.io/badges/git-hub-downloads-all-assets-all-releases) is used when a browser cannot read the GitHub API directly. Both badge services may cache counts.
