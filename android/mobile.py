"""Inject Android-only UI and records into the shared HTML game."""
from pathlib import Path

def mobile_html(source: str) -> str:
    root=Path(__file__).resolve().parent
    style=(root/'mobile.css').read_text()
    script=(root/'mobile.js').read_text()
    assert '</header>' in source and '</main>' in source and '</style>' in source
    source=source.replace('</style>',style+'\n</style>',1)
    source=source.replace('</header>','</header><div class="mobile-panel" id="mobile-game-panel" role="tabpanel" aria-labelledby="mobile-game-tab">',1)
    marker='<div class="meters">'
    assert marker in source
    source=source.replace(marker,'<div class="mobile-high-score"><span>PERSONAL BEST</span><strong id="high-score">0</strong></div>'+marker,1)
    panel='''</div><section class="mobile-panel" id="mobile-stats-panel" role="tabpanel" aria-labelledby="mobile-stats-tab" hidden>
<h2>Word stats</h2><p class="mobile-stats-intro">Your words, across all games on this device. A word is met each time it becomes the target, including the first word of a new game. Restarting the same word after a wrong catch does not add an encounter.</p>
<div class="mobile-stats-summary" id="word-stats-summary">0 different words · 0 encounters · 0 perfect completions</div>
<table class="word-stats-table"><caption>Perfect counts follow the game's shield and hazard rules.</caption><thead><tr><th scope="col">Word</th><th scope="col">Met</th><th scope="col">Perfect</th></tr></thead><tbody id="word-stats-body"></tbody></table>
<p class="mobile-storage-note">Records are saved only on this device. Clearing app data or uninstalling removes them. Updating the app keeps them.</p></section>
<p class="mobile-storage-note" id="mobile-storage-warning" role="status" hidden>Local storage is unavailable. Records will last only until the app closes.</p></main>
<nav class="mobile-tabs" id="mobile-tabs" role="tablist" aria-label="Game and word statistics"><button type="button" role="tab" id="mobile-game-tab" aria-selected="true" aria-controls="mobile-game-panel" tabindex="0">☂ Game</button><button type="button" role="tab" id="mobile-stats-tab" aria-selected="false" aria-controls="mobile-stats-panel" tabindex="-1">▤ Word Stats</button></nav>'''
    source=source.replace('</main>',panel,1)
    source=source.replace('</body>','<script>\n'+script+'\n</script></body>',1)
    return source.replace(' target="_blank"','')
