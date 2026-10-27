const fs=require('fs'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=String.raw`
const webHtml=fs.readFileSync(require('path').join(__dirname,'../../index.html'),'utf8');
const web=[...webHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert(!webHtml.includes('id="tutorial"'),'Android tutorial must not ship in web');
assert(html.includes('id="tutorial"'),'APK includes tutorial markup');
assert(webHtml.indexOf('id="difficulty"')<webHtml.indexOf('id="word-set"'),'difficulty comes first');
for(const source of [web,scripts]){
 const t=session({},false,source);assert.equal(t.el('game-options').hidden,false);assert.equal(t.el('game-options').open,true);
 t.el('difficulty').value='hard';t.el('apply-settings').onclick();assert.equal(t.run('difficulty'),'hard');assert.equal(t.el('game-options').hidden,true);
 t.run('pause()');assert.equal(t.run('state'),'paused');assert.equal(t.el('game-options').hidden,true,'pause never restores settings');
 t.run('start()');assert.equal(t.el('game-options').hidden,true);
 t.run('lives=0;checkGameOver()');assert.equal(t.run('state'),'over');assert.equal(t.el('game-options').hidden,false);assert.equal(t.el('game-options').open,true);
 t.el('difficulty').value='normal';t.el('start').onclick();assert.equal(t.run('difficulty'),'normal');assert.equal(t.el('game-options').hidden,true);
 t.el('give-up').onclick();assert.equal(t.el('game-options').hidden,true,'give-up confirmation stays paused');t.el('confirm-give-up').onclick();assert.equal(t.el('game-options').hidden,false);
}
const t=session({},false,scripts,null,true);
assert(t.run('tutorialActive'));assert.equal(t.el('tutorial').hidden,false);assert.equal(t.run('state'),'ready');
assert.equal(t.run('Object.keys(mobileRecords.words).length'),0);assert.equal(t.run('mobileRecords.highScore'),0);
t.el('start').onclick();assert.equal(t.run('state'),'ready','tutorial blocks scoring runs');t.el('mobile-stats-tab').onclick();assert.equal(t.el('mobile-stats-panel').hidden,true,'tutorial blocks background tabs');
assert.equal(t.el('mobile-game-panel').inert,true);
t.el('tutorial-next').onclick();assert.equal(t.run('tutorialPage'),1);t.el('tutorial-back').onclick();assert.equal(t.run('tutorialPage'),0);
for(let i=0;i<6;i++)t.el('tutorial-next').onclick();assert.equal(t.run('tutorialActive'),false);assert.equal(t.el('tutorial').hidden,true);assert.equal(t.el('mobile-game-panel').inert,false);assert.equal(t.el('game-options').hidden,false);
assert.equal(t.store['word-rain-tutorial-v1'],'done');assert.equal(t.run('Object.keys(mobileRecords.words).length'),0,'walkthrough never adds encounters');
const returning=session(t.store,false,scripts,null,true);assert.equal(returning.run('tutorialActive'),false,'completed tutorial does not repeat after update/reload');
returning.el('replay-tutorial').onclick();assert(returning.run('tutorialActive'));returning.el('tutorial-skip').onclick();assert(!returning.run('tutorialActive'));
const skip=session({},false,scripts,null,true);skip.el('tutorial-skip').onclick();assert.equal(skip.store['word-rain-tutorial-v1'],'done');
const blocked=session({},true,scripts,null,true);assert(blocked.run('tutorialActive'));blocked.el('tutorial-skip').onclick();assert(!blocked.run('tutorialActive'),'storage failure never traps player');
const records=session({'word-rain-mobile-records-v1':JSON.stringify({highScore:123,words:{RAIN:{met:3,perfect:1}}})},false,scripts,null,true);const before=records.run('JSON.stringify(mobileRecords)');records.el('tutorial-skip').onclick();assert.equal(records.run('JSON.stringify(mobileRecords)'),before,'first tutorial preserves installed records');
console.log('PASS dev2: difficulty-first setup, play/pause/give-up/game-over visibility; Android-only first launch, back/next/skip/replay, blocked storage, persistence, no score/records changes, background interaction guard.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,process);
