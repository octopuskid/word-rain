const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(process.argv[2]||require('path').join(__dirname,'../build/assets/index.html'),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);for(const s of scripts)new vm.Script(s);
function session(store={},blocked=false,sourceScripts=scripts){
 const elements=new Map(),events={};
 function el(id){if(!elements.has(id))elements.set(id,{id,textContent:'',innerHTML:'',hidden:id==='mobile-stats-panel'||id==='reset-stats-confirm',style:{},attributes:{},classList:{values:new Set(),toggle(name,on){if(on)this.values.add(name);else this.values.delete(name)},contains(name){return this.values.has(name)}},setAttribute(k,v){this.attributes[k]=String(v)},focus(){},addEventListener(k,v){events[id+':'+k]=v},getContext(){return new Proxy({},{get:()=>()=>{}})}});return elements.get(id)}
 const c=vm.createContext({Math,Set,Array,String,Object,Number,JSON,console,navigator:{userAgent:'Android Mobile'},screen:{width:412,height:915},document:{documentElement:{dataset:{}},querySelector:q=>el(q==='canvas'?'game':'meta'),getElementById:el,addEventListener(){}},window:{matchMedia:()=>({matches:false}),addEventListener(){}},localStorage:{getItem(k){if(blocked)throw Error('blocked');return store[k]||null},setItem(k,v){if(blocked)throw Error('blocked');store[k]=v}},getComputedStyle:()=>({getPropertyValue:()=> '#ffffff06'}),requestAnimationFrame(){}});
 for(const s of sourceScripts)vm.runInContext(s,c);
 return {c,el,store,run:s=>vm.runInContext(s,c)};
}
const a=session();assert.equal(a.run('Object.keys(mobileRecords.words).length'),0,'ready screen is not an encounter');
a.run('start()');let word=a.run('words[wordIndex]');assert.equal(a.run('mobileRecords.words[words[wordIndex]].met'),1);
a.run('pause();start()');assert.equal(a.run('mobileRecords.words[words[wordIndex]].met'),1,'resume must not add encounters');
function catchItem(s,props){s.run('spawn=99;items=[Object.assign({x:240,y:460,speed:0,bomb:false,wild:false,shield:false,letter:""},'+JSON.stringify(props)+')];x=target=240;update(0)')}
function correct(s){catchItem(s,{letter:s.run('words[wordIndex][progress]')})}
function complete(s){const w=s.run('words[wordIndex]');let guard=0;while(s.run('words[wordIndex]')===w&&guard++<8)correct(s);assert(guard<=7);if(s.run('Boolean(rickChallenge)'))playRick(s);return w}
correct(a);assert.equal(a.el('high-score').textContent,10);assert.equal(a.run('mobileRecords.highScore'),10,'high score updates during play');
const beforeStats=a.run('progress');a.el('mobile-stats-tab').onclick();assert.equal(a.run('state'),'paused');assert(a.el('mobile-game-panel').hidden);assert(!a.el('mobile-stats-panel').hidden);assert.equal(a.run('progress'),beforeStats);assert.equal(a.el('pause').hidden,true,'hide pause/resume on stats');a.run('pause();start()');assert.equal(a.run('state'),'paused','cannot resume behind stats');assert.equal(a.run('progress'),beforeStats);
a.el('mobile-game-tab').onclick();assert.equal(a.el('pause').hidden,false,'restore pause/resume on Game');assert.equal(a.run('state'),'paused','returning does not auto-resume');a.el('pause').onclick();assert.equal(a.run('state'),'playing','player explicitly resumes');
const first=complete(a);assert.equal(a.run('mobileRecords.words['+JSON.stringify(first)+'].perfect'),1);assert.equal(a.run('Object.values(mobileRecords.words).reduce((n,e)=>n+e.met,0)'),2,'new target adds exactly one encounter');
const second=a.run('words[wordIndex]');const wrong=a.run("'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(x=>x!==words[wordIndex][progress])");catchItem(a,{letter:wrong});assert.equal(a.run('mobileRecords.words[words[wordIndex]].met'),1,'wrong-letter restart is not another encounter');complete(a);assert.equal(a.run('mobileRecords.words['+JSON.stringify(second)+'].perfect'),0);
// Shielded mistakes preserve perfection, including the second shield-breaking catch.
a.run('shieldHealth=2;hud()');for(let i=0;i<2;i++)catchItem(a,{letter:a.run("'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(x=>x!==words[wordIndex][progress])")});const protectedWord=complete(a);assert.equal(a.run('mobileRecords.words['+JSON.stringify(protectedWord)+'].perfect'),1);
for(const [shield,perfect] of [[2,0],[1,1],[0,0]]){const t=session();t.run('start();shieldHealth='+shield+';hud()');catchItem(t,{bomb:true});const w=complete(t);assert.equal(t.run('mobileRecords.words['+JSON.stringify(w)+'].perfect'),perfect,'bomb shield exception '+shield);}
const savedBest=a.run('mobileRecords.highScore'),savedMet=a.run('Object.values(mobileRecords.words).reduce((n,e)=>n+e.met,0)');
const b=session(a.store);assert.equal(b.run('mobileRecords.highScore'),savedBest);assert.equal(b.run('Object.values(mobileRecords.words).reduce((n,e)=>n+e.met,0)'),savedMet,'reload preserves counts without adding encounter');b.run('start()');assert.equal(b.run('mobileRecords.highScore'),savedBest,'new game preserves personal best');
// Reset requires confirmation and never erases personal best, theme or live play.
const reset=session({...a.store,'word-rain-theme':'light'});reset.run('start();score=25;hud()');reset.el('mobile-stats-tab').onclick();
const resetBefore=JSON.stringify(reset.store),liveBefore=reset.run('JSON.stringify([score,progress,wordIndex])');
reset.el('confirm-reset-stats').onclick();assert.equal(JSON.stringify(reset.store),resetBefore,'unrequested reset ignored');
reset.el('reset-stats').onclick();assert.equal(reset.el('reset-stats-confirm').hidden,false);reset.el('cancel-reset-stats').onclick();assert.equal(JSON.stringify(reset.store),resetBefore,'cancel keeps records');
reset.el('reset-stats').onclick();reset.el('confirm-reset-stats').onclick();assert.equal(reset.run('Object.keys(mobileRecords.words).length'),0);assert.equal(reset.run('mobileRecords.highScore'),Math.max(savedBest,25));assert.equal(reset.store['word-rain-theme'],'light');assert.equal(reset.run('JSON.stringify([score,progress,wordIndex])'),liveBefore);assert.equal(reset.run('state'),'paused');
const afterReset=session(reset.store);assert.equal(afterReset.run('Object.keys(mobileRecords.words).length'),0,'reset persists on reload');assert.equal(afterReset.run('mobileRecords.highScore'),Math.max(savedBest,25));
reset.el('mobile-game-tab').onclick();reset.el('pause').onclick();complete(reset);assert(reset.run('Object.values(mobileRecords.words).every(e=>e.perfect<=e.met)'),'completion after reset keeps valid counts');
const corrupt=session({'word-rain-mobile-records-v1':'{broken'});assert.equal(corrupt.run('mobileRecords.highScore'),0);
const malicious=session({'word-rain-mobile-records-v1':JSON.stringify({highScore:-9,words:{PUNS:{met:2,perfect:999},'<script>':{met:2,perfect:1}}})});assert.equal(malicious.run('mobileRecords.highScore'),0);assert.equal(malicious.run('mobileRecords.words.PUNS.perfect'),2);assert(!malicious.el('word-stats-body').innerHTML.includes('<script>'));
const blocked=session({},true);blocked.run('start();score=42;hud()');assert.equal(blocked.run('mobileRecords.highScore'),42);assert.equal(blocked.el('mobile-storage-warning').hidden,false,'storage failure does not break play');
assert(html.includes('role="tablist"'));assert.equal(scripts.length,3);
console.log('PASS: scoring and persistent best; initial/new target encounters; no counting on resume, wrong resets or reload; perfect and shield exceptions; stats tab pauses/preserves play; corrupt/blocked storage; safe table rendering.');

// Exercise the same game mechanics in the browser HTML and bundled Android HTML.
const webScripts=[...fs.readFileSync(require('path').join(__dirname,'../../index.html'),'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
for(const source of [webScripts,scripts]){
 const hard=session({},false,source);
 hard.el('difficulty').value='hard';hard.el('word-set').value='tricky';hard.el('apply-settings').onclick();
 assert.equal(hard.run('difficulty'),'hard');assert(hard.run('words.every(w=>w.length>=6&&w.length<=7)'));
 assert.equal(hard.run('document.documentElement.dataset.wordSet'),'tricky');
 assert.equal(hard.run('doubleScore'),false);
 for(let n=0;n<5;n++)complete(hard);
 assert.equal(hard.run('doubleScore'),false,'five perfect words do not unlock bonus');
 const beforeSixth=hard.run('score'),sixthLength=hard.run('words[wordIndex].length');complete(hard);
 assert.equal(hard.run('score')-beforeSixth,sixthLength*10+50,'sixth word still earns base points');assert(hard.run('doubleScore'));
 const beforeBonus=hard.run('score');correct(hard);assert.equal(hard.run('score')-beforeBonus,20,'bonus correct catch doubles');
 const beforeBonusWord=hard.run('score'),remaining=hard.run('words[wordIndex].length-progress');complete(hard);assert.equal(hard.run('score')-beforeBonusWord,remaining*20+100,'word completion doubles');
 catchItem(hard,{wild:true});assert(hard.run('doubleScore'),'wildcards retain bonus');
 const streak=hard.run('perfectRun');hard.run('shieldHealth=2');catchItem(hard,{letter:hard.run("'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(c=>c!==words[wordIndex][progress])")});
 assert.equal(hard.run('doubleScore'),false,'shielded wrong catch ends bonus');assert.equal(hard.run('bonusRun'),0);assert.equal(hard.run('perfectRun'),streak,'shield still protects perfection');
 let ordinary=hard.run('score');correct(hard);assert.equal(hard.run('score')-ordinary,10);
 complete(hard);assert(!hard.run('doubleScore'),'preserved perfection cannot instantly restore bonus');
 for(let n=0;n<5;n++)complete(hard);assert(hard.run('doubleScore'),'six new perfect words restore bonus');
 for(const shield of [2,1,0]){hard.run('doubleScore=true;bonusRun=6;shieldHealth='+shield+';lives=3');catchItem(hard,{bomb:true});assert(!hard.run('doubleScore'),'all shield states lose bonus on x');assert.equal(hard.run('bonusRun'),0);}
 hard.el('word-set').value='nature';hard.el('difficulty').value='normal';hard.el('apply-settings').onclick();assert(!hard.run('doubleScore'));assert.equal(hard.run('score'),0);assert(hard.run('words.every(w=>wordSets.nature.words.includes(w))'));
 for(let n=0;n<6;n++)complete(hard);assert(!hard.run('doubleScore'),'normal has no bonus');
 const reloaded=session(hard.store,false,source);assert.equal(reloaded.run('activeSet'),'nature');assert.equal(reloaded.run('difficulty'),'normal');
 for(const set of ['classic','nature','space','tricky'])for(const level of ['normal','hard']){hard.el('word-set').value=set;hard.el('difficulty').value=level;hard.el('apply-settings').onclick();assert(hard.run('words.length>=2'));assert(hard.run('words.every(w=>/^[A-Z]{4,7}$/.test(w))'));assert.equal(hard.run('new Set(words).size'),hard.run('words.length'));}
}
const migration=session({'word-rain-settings-v1':JSON.stringify({wordSet:'space',difficulty:'hard'}),'word-rain-mobile-records-v1':JSON.stringify({highScore:1234,words:{PUNS:{met:4,perfect:2},RHYTHM:{met:3,perfect:1}}})});assert.equal(migration.run('mobileRecords.highScore'),1234);assert.equal(migration.run('mobileRecords.words.PUNS.met'),4,'old records survive inactive sets');assert.equal(migration.run('mobileRecords.words.RHYTHM.perfect'),1);
console.log('PASS: all word sets/difficulties, settings reload, existing-record migration, sixth-word boundary, doubled letters/words, wildcard, shielded errors, x and normal-mode scoring in web + APK.');

function playRick(s,missAt=-1){
 const startingScore=s.run('score');
 for(let i=0;i<11;i++){
  for(let clock=0;!s.run('items.length')&&clock<20;clock++)s.run('update(.04)');
  assert.equal(s.run('items[0].letter'),'dQw4w9WgXcQ'[i],'exact mixed-case Rick sequence');
  if(i!==missAt){s.run('x=target=240;items[0].x=240;items[0].y=460;update(0)');assert(s.run('items[0].caught'));}
  else s.run('x=target=430;items[0].x=42;items[0].y=460;update(0)');
  assert.equal(s.run('state'),'playing','no early failure before final symbol passes');
  s.run('items[0].y=490;update(0)');
  assert.equal(s.run('score'),startingScore,'Rick symbols do not score');
  if(i<10)assert.equal(s.run('state'),'playing','continue all symbols after a miss');
 }
}
for(const source of [webScripts,scripts]){
 // Shield overload removes all protection and preserves perfection.
 for(const [health,hp] of [[0,3],[1,2],[2,1]]){
  const t=session({},false,source);t.run('start();shieldHealth='+health+';wildcardUnlocked=true;doubleScore=true');catchItem(t,{shield:true});
  assert.equal(t.run('lives'),hp);assert.equal(t.run('shieldHealth'),health?0:2);assert(t.run('wordPerfect'));assert(t.run('wildcardUnlocked'));assert(t.run('doubleScore'));
 }
 for(const health of [1,2]){
  const t=session({},false,source);t.run('start();shieldHealth='+health+';wildcardUnlocked=true;setSpeed(1.5);doubleScore=true;bonusRun=6');
  const wrong=t.run("'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(c=>c!==words[wordIndex][progress])");catchItem(t,{letter:wrong});
  assert(t.run('wildcardUnlocked'),'shielded wrong catch preserves purple mode');assert.equal(t.run('speedMultiplier'),1.45);assert.equal(t.run('shieldHealth'),health-1);assert(t.run('wordPerfect'));assert(!t.run('doubleScore'));
 }
 const unshielded=session({},false,source);unshielded.run('start();wildcardUnlocked=true');catchItem(unshielded,{letter:unshielded.run("'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(c=>c!==words[wordIndex][progress])")});assert(!unshielded.run('wildcardUnlocked'));
 // Exhaust the pickup-roll distribution: 3% shields and exactly 1.5% wildcards.
 const drops=session({},false,source);drops.run('start();wildcardUnlocked=true');
 const distribution=drops.run(`(()=>{const old=Math.random;let shield=0,wild=0;try{for(let i=0;i<1000;i++){const draws=[.9,0,(i+.5)/1000,.5,.5,.5,.5];Math.random=()=>draws.shift()??.5;items=[];spawnDrop();if(items[0].shield)shield++;if(items[0].wild)wild++;}}finally{Math.random=old;}return {shield,wild};})()`);
 assert.equal(distribution.shield,30);assert.equal(distribution.wild,15);
 // Reach the Easter egg by actually completing RICK.
 const egg=session({},false,source);egg.run("start();wordIndex=words.indexOf('RICK');progress=0;items=[{x:50,y:20,speed:10,letter:'Z'}];particles=[{life:.5}]");
 for(let i=0;i<4;i++)correct(egg);
 assert(egg.run('Boolean(rickChallenge)'));assert.equal(egg.run('items.length'),0,'clear ordinary screen');assert.equal(egg.run('particles.length'),0);
 const eggScore=egg.run('score'),mainElapsed=egg.run('elapsed');egg.run('pause();start()');assert(egg.run('Boolean(rickChallenge)'),'manual resume preserves challenge');playRick(egg);
 assert.equal(egg.run('state'),'playing');assert.equal(egg.run('rickChallenge'),null);assert(egg.run('rickUnlocked'));assert.equal(egg.run('score'),eggScore);assert.equal(egg.run('elapsed'),mainElapsed,'challenge does not accelerate normal spawn density');
 const unlocked=session(egg.store,false,source);assert(unlocked.run('rickUnlocked'),'Rick theme survives reload');unlocked.el('color-theme').value='rick';unlocked.el('apply-settings').onclick();assert.equal(unlocked.run('document.documentElement.dataset.palette'),'rick');
 const locked=session({},false,source);locked.el('color-theme').value='rick';locked.el('apply-settings').onclick();assert.equal(locked.run('colorTheme'),'classic','locked palette cannot be selected');
 for(const missAt of [0,5,10]){const fail=session({},false,source);fail.run('start();score=77;beginRickChallenge()');playRick(fail,missAt);assert.equal(fail.run('state'),'over');assert(!fail.run('rickUnlocked'));assert.equal(fail.run('score'),77);}
 const giveup=session({},false,source);giveup.run('start();score=33;hud()');giveup.el('give-up').onclick();assert.equal(giveup.run('state'),'paused');assert.equal(giveup.el('confirm-give-up').hidden,false);giveup.el('start').onclick();assert.equal(giveup.run('state'),'playing');assert.equal(giveup.el('confirm-give-up').hidden,true,'cancel surrender');
 giveup.el('give-up').onclick();giveup.el('confirm-give-up').onclick();assert.equal(giveup.run('state'),'over');assert.equal(giveup.run('score'),33);
 const yellow=session({},false,source);yellow.el('difficulty').value='hard';yellow.el('apply-settings').onclick();for(let n=0;n<6;n++)complete(yellow);assert(yellow.el('word').classList.contains('bonus'),'target word carries yellow bonus style');assert(yellow.el('bonus-status').textContent.includes('2× ACTIVE'));
}
const statsEgg=session();statsEgg.run('start();beginRickChallenge()');statsEgg.el('mobile-stats-tab').onclick();assert.equal(statsEgg.run('state'),'paused');assert.equal(statsEgg.el('give-up').hidden,true);statsEgg.el('mobile-game-tab').onclick();assert.equal(statsEgg.run('state'),'paused');statsEgg.el('pause').onclick();assert.equal(statsEgg.run('state'),'playing');assert(statsEgg.run('Boolean(rickChallenge)'));
console.log('PASS: Rick exact sequence, screen clearing, success/unlock persistence, delayed first/middle/final misses, no challenge score; shield overload/purple preservation, 1.5% wildcard rolls, yellow bonus word, Give Up and Stats challenge pause.');

for(const source of [webScripts,scripts]){
 const t=session({},false,source);assert.equal(t.el('game-options').hidden,false);t.el('difficulty').value='hard';t.el('apply-settings').onclick();assert.equal(t.el('game-options').hidden,true);assert.equal(t.run('speedMultiplier'),1.6);t.run('pause()');assert.equal(t.el('game-options').hidden,false);t.run('start()');assert(t.el('game-options').hidden);
 for(let n=0;n<14;n++)complete(t);assert.equal(t.run('speedMultiplier'),2.8);assert(!t.run('wildcardUnlocked'));assert.equal(t.el('speed-meter').attributes['aria-valuemax'],'280');assert.equal(t.el('speed-fill').style.width,'100%');
 t.run('setSpeed(0);hud()');assert.equal(t.run('speedMultiplier'),1.6);assert.equal(t.el('speed-meter').attributes['aria-valuemin'],'160');assert.equal(t.el('speed-fill').style.width,'0%');
 t.run("words.splice(0,words.length,'LETTER','RHYTHM');wordIndex=0;progress=0");
 const odds=t.run(`(()=>{const old=Math.random;let current=0,next=0;try{for(let i=0;i<1000;i++){let first=true;Math.random=()=>{if(first){first=false;return (i+.5)/1000;}return .5;};const c=randomLetter();if(c==='L')current++;if(c==='E')next++;}}finally{Math.random=old;}return {current,next};})()`);assert.equal(odds.current,80);assert.equal(odds.next,80);
 t.run('progress=5');const lastOdds=t.run(`(()=>{const old=Math.random;let count=0;try{for(let i=0;i<1000;i++){let first=true;Math.random=()=>{if(first){first=false;return (i+.5)/1000;}return .5;};if(randomLetter()==='R')count++;}}finally{Math.random=old;}return count;})()`);assert.equal(lastOdds,80);
 for(const [health,remaining,hp] of [[0,2,3],[1,0,2],[2,1,1]]){t.run('lives=3;shieldHealth='+health);catchItem(t,{shield:true});assert.equal(t.run('lives'),hp);assert.equal(t.run('shieldHealth'),remaining);}
 const noWild=t.run(`(()=>{const old=Math.random;try{const draws=[.9,0,.04,.5,.5,.5,.5];Math.random=()=>draws.shift()??.5;items=[];wildcardUnlocked=true;spawnDrop();return items[0].wild;}finally{Math.random=old;}})()`);assert.equal(noWild,false,'no hard wildcard drop even if flag was stale');
 t.run('lives=1;shieldHealth=2');catchItem(t,{shield:true});assert.equal(t.run('state'),'over');assert.equal(t.el('game-options').hidden,false,'game over restores settings');
 t.el('difficulty').value='normal';t.el('apply-settings').onclick();assert.equal(t.run('speedMultiplier'),1);t.run('setSpeed(99)');assert.equal(t.run('speedMultiplier'),2.2);
}
console.log('PASS: active/paused/over settings visibility; Hard 160–280% speed, 8% + 8% letter odds, last-letter exception, no wildcards, full/half duplicate shield rules; Normal preserved.');

for(const source of [webScripts,scripts]){
 const t=session({},false,source);assert(!t.el('color-theme').innerHTML.includes('value="rick"'),'Rick is absent before unlock');
 t.el('color-theme').value='space';t.el('color-theme').onchange();assert.equal(t.run('colorTheme'),'space');
 t.el('word-set').value='nature';t.el('apply-settings').onclick();assert.equal(t.run('activeSet'),'nature');assert.equal(t.run('colorTheme'),'space','word set does not change palette');
 t.run('pause();score=67;shieldHealth=1;hud()');const game=t.run('JSON.stringify([score,progress,wordIndex,lives,shieldHealth,state])');
 t.el('handwriting-mode').checked=true;t.el('handwriting-mode').onchange();assert(t.run('handwriting'));assert.equal(t.run('document.documentElement.dataset.handwriting'),'true');assert.equal(t.run('colorTheme'),'space','paper does not erase palette');assert.equal(t.el('theme-toggle').disabled,true);t.run('draw()');assert.equal(t.run('JSON.stringify([score,progress,wordIndex,lives,shieldHealth,state])'),game,'appearance does not restart play');
 const reload=session(t.store,false,source);assert(reload.run('handwriting'));assert.equal(reload.run('colorTheme'),'space');
 t.el('handwriting-mode').checked=false;t.el('handwriting-mode').onchange();assert.equal(t.run('document.documentElement.dataset.handwriting'),'false');assert.equal(t.run('document.documentElement.dataset.palette'),'space');assert.equal(t.el('theme-toggle').disabled,false);
 t.run('rickUnlocked=true;updateRickOption()');assert(t.el('color-theme').innerHTML.includes('value="rick"'),'Rick appears after unlock');assert.equal(t.el('color-theme').value,'space','unlock does not change palette');
 const migrated=session({'word-rain-settings-v1':JSON.stringify({wordSet:'nature',difficulty:'hard',colorTheme:'set'})},false,source);assert.equal(migrated.run('colorTheme'),'nature','old automatic palette migrated');migrated.el('word-set').value='tricky';migrated.el('apply-settings').onclick();assert.equal(migrated.run('colorTheme'),'nature');
 const unlocked=session({'word-rain-rick-unlocked-v1':'true','word-rain-settings-v1':JSON.stringify({wordSet:'classic',colorTheme:'rick',handwriting:true})},false,source);assert(unlocked.el('color-theme').innerHTML.includes('value="rick"'));assert.equal(unlocked.run('colorTheme'),'rick');assert(unlocked.run('handwriting'));
}
assert(!webScripts.join('').includes('Rick · Locked'));assert(html.includes('data:font/woff;base64,'),'font is offline and bundled');
console.log('PASS: Rick absent until unlock; independent palettes, legacy settings migration, handwriting save/override/restore without changing live game; paper canvas renders with bundled font.');
