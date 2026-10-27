const fs=require('fs'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=String.raw`
const path=require('path');
assert.equal((html.match(/id="theme-toggle"/g)||[]).length,1);
const homeStart=html.indexOf('id="dream-home"'),homeEnd=html.indexOf('id="dream-chapters"');
assert(html.indexOf('id="theme-toggle"')>homeStart&&html.indexOf('id="theme-toggle"')<homeEnd,'switch moved into Home markup');
const header=html.slice(html.indexOf('<header>'),html.indexOf('</header>'));assert(!header.includes('id="theme-toggle"'),'no duplicate switch in Classic header');
assert(html.includes('#mobile-tabs{display:none!important}'),'CSS cannot override hidden bar');
assert(html.includes('id="mobile-tabs" hidden inert aria-hidden="true"'),'legacy internal tab controls remain inaccessible');
assert(html.includes(':root[data-theme="dark"] .dream-shell'),'Dream UI has a real dark palette');
const t=session({'word-rain-tutorial-v1':'done'},false,scripts,null,true);
t.run("applyTheme('light')");t.el('theme-toggle').onclick();assert.equal(t.run('document.documentElement.dataset.theme'),'dark');assert.equal(t.store['word-rain-theme'],'dark');
const reload=session(t.store,false,scripts,null,true);assert.equal(reload.run('document.documentElement.dataset.theme'),'dark');
for(const screen of ['home','classic','records','chapters']){t.run('routeDream('+JSON.stringify(screen)+')');assert.equal(t.el('mobile-tabs').hidden,true,'no bar on '+screen);}
t.run('openDreamClassic();start();pause();routeDream("home")');const before=t.run('JSON.stringify([score,progress,wordIndex,lives,shieldHealth,state])');
t.el('theme-toggle').onclick();assert.equal(t.run('JSON.stringify([score,progress,wordIndex,lives,shieldHealth,state])'),before,'appearance preserves paused run');
t.run('openDreamClassic()');t.el('handwriting-mode').checked=true;t.el('handwriting-mode').onchange();t.run('routeDream("home")');assert.equal(t.el('theme-toggle').disabled,false,'Home theme remains available with Classic paper enabled');
t.el('dream-stats').onclick();t.el('dream-full-records').onclick();assert.equal(t.el('mobile-stats-panel').hidden,false,'full records reachable through Home stats');assert.equal(t.el('mobile-tabs').hidden,true);
console.log('PASS dev4: single Home theme switch, persistent light/dark, paper override compatibility, no bottom bar across routes, run preservation and records access.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,process);
