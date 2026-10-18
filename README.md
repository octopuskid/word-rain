# Word Rain

A browser arcade game: catch letters, spell words, and survive with shields and wildcards.

**[Play on itch.io](https://octopuskid.itch.io/word-rain)** · **[Play on GitHub Pages](https://octopuskid.github.io/word-rain/)**

Designed by [octopuskid](https://github.com/octopuskid) and developed with ChatGPT. Built with HTML, CSS, and JavaScript, with no external dependencies or build step.

## Android app

[Download the offline Android APK](https://github.com/octopuskid/word-rain/releases/tag/v1.0.0) (Android 8.0+). The game is bundled inside the app and works without internet access. See [Android source and build instructions](android/README.md).

## Play

Download `index.html` and open it in a modern browser. The game works offline.

- Drag across the game area, use the on-screen arrow buttons, or press the left/right arrow keys.
- Catch letters in order to complete words of 4–7 letters.
- Use the pause button or press Space to pause/resume. Space also starts a new game from the start or game-over screen.
- The game pauses when the page loses focus.

## Scoring and hearts

- Correct letter: +10 points. Completed word: +50 points.
- Wrong letter: +1 point while scoring is active, and word progress resets.
- Three consecutive wrong letters pause scoring; the third earns no point. A correct catch clears the pause without awarding points, then normal scoring resumes.
- Start with three hearts. Reaching zero ends the game.

## Perfect words, speed, and healing

A word is perfect if it is completed without a disqualifying catch during that word. Uncaught drops do not affect perfection. Shield exceptions are described below.

- Every two consecutive perfect words increase falling speed by 20 percentage points, capped at 220% of normal.
- Each wrong letter lowers speed by 5 percentage points; each caught × lowers it by 20 percentage points. Speed cannot fall below 100%.
- Every six consecutive perfect words restore one heart, capped at three. Rewards at full health are skipped, not stored.

## Special blocks

### Purple ✦ wildcard

One perfect word unlocks wildcard mode. Each non-× drop has a 2.5% chance of being a wildcard while the mode is active. A wildcard fills the next blank and behaves like a normal correct catch, including scoring-pause recovery. It preserves perfection. Hearts turn purple while this mode is active. Catching a wrong letter removes the mode; another perfect word restores it.

### Blue 🛡️ shield

Each non-× drop has a 3% chance of being a shield, without unlock conditions. Picking one up equips a full shield with two health points.

| Event | Result |
| --- | --- |
| Pick up a shield with no shield | Equip a full shield; no heart loss; preserve perfection |
| Pick up a shield with a full shield | Lose two hearts; equip a full shield; preserve perfection |
| Pick up a shield with a half shield | Lose one heart; equip a full shield; preserve perfection |
| Catch × with a full shield | Shield shatters; no heart loss; lose perfection |
| Catch × with a half shield | Shield shatters; lose one heart; preserve perfection |
| Catch a wrong letter while shielded | Consume half a shield; preserve perfection, including the catch that shatters it |
| Catch × without a shield | Lose one heart and perfection |
| Catch a wrong letter without a shield | Lose perfection |

Scoring, word-progress, speed, and wildcard-mode penalties still apply during shielding. Shield pickups do not restore perfection already lost for the current word. Shield pickup damage can end the game immediately.

## Letter generation

Ordinary letter drops use a 20% current-letter selection and a 5% following-letter selection. The following-letter rule is skipped on the final letter. Remaining letters exclude those selected targets. When two consecutive letters are identical, both selections produce the same character. Letters remain fixed after spawning, and catching the following letter before it is needed counts as wrong.

Letter drop density is reduced by 35% relative to the initial spawning schedule; × drops are reduced by 50%. Shields and wildcards share non-× drop opportunities. The spawning interval gradually decreases during a run.

## Source and privacy

The complete game is in `index.html`. It contains no analytics, tracking, account login, database, or high-score storage. The shield emoji is rendered by the browser/system font; no third-party image or font files are bundled.

## License

MIT. See [LICENSE](LICENSE). This permits modification, redistribution, and commercial reuse with the required notices retained. No warranty is provided.
