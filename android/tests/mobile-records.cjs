const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(process.argv[2]||require('path').join(__dirname,'../build/assets/index.html'),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);for(const s of scripts)new vm.Script(s);
function session(store={},blocked=false,sourceScripts=scripts,native=null){
 const elements=new Map(),events={};
 function el(id){if(!elements.has(id))elements.set(id,{id,textContent:'',innerHTML:'',hidden:id==='mobile-stats-panel'||id==='reset-stats-confirm',style:{},attributes:{},classList:{values:new Set(),toggle(name,on){if(on)this.values.add(name);else this.values.delete(name)},contains(name){return this.values.has(name)}},setAttribute(k,v){this.attributes[k]=String(v)},focus(){},addEventListener(k,v){events[id+':'+k]=v},getContext(){return new Proxy({},{get:()=>()=>{}})}});return elements.get(id)}
 const c=vm.createContext({Math,Set,Array,String,Object,Number,JSON,console,navigator:{userAgent:'Android Mobile'},screen:{width:412,height:915},document:{documentElement:{dataset:{}},querySelector:q=>el(q==='canvas'?'game':'meta'),getElementById:el,addEventListener(){}},window:{matchMedia:()=>({matches:false}),addEventListener(){}},localStorage:{getItem(k){if(blocked)throw Error('blocked');return store[k]||null},setItem(k,v){if(blocked)throw Error('blocked');store[k]=v}},getComputedStyle:()=>({getPropertyValue:()=> '#ffffff06'}),requestAnimationFrame(){}});
 if(native)c.window.WordRainNative=native;
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
 assert.equal(hard.run('score')-beforeSixth,(sixthLength*10+50)*1.5,'sixth word still earns base points');assert(hard.run('doubleScore'));
 const beforeBonus=hard.run('score');correct(hard);assert.equal(hard.run('score')-beforeBonus,30,'bonus correct catch doubles');
 const beforeBonusWord=hard.run('score'),remaining=hard.run('words[wordIndex].length-progress');complete(hard);assert.equal(hard.run('score')-beforeBonusWord,(remaining*20+100)*1.5,'word completion doubles');
 catchItem(hard,{wild:true});assert(hard.run('doubleScore'),'wildcards retain bonus');
 const streak=hard.run('perfectRun');hard.run('shieldHealth=2');catchItem(hard,{letter:hard.run("'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(c=>c!==words[wordIndex][progress])")});
 assert.equal(hard.run('doubleScore'),true,'shielded wrong catch preserves bonus');assert.equal(hard.run('perfectRun'),streak,'shield still protects perfection');
 let ordinary=hard.run('score');correct(hard);assert.equal(hard.run('score')-ordinary,30);
 complete(hard);assert(hard.run('doubleScore'),'preserved perfection keeps bonus');
 for(let n=0;n<5;n++)complete(hard);assert(hard.run('doubleScore'),'six new perfect words restore bonus');
 for(const shield of [2,1,0]){hard.run('doubleScore=true;perfectRun=6;shieldHealth='+shield+';lives=3');catchItem(hard,{bomb:true});assert.equal(hard.run('doubleScore'),shield===1,'half-shield x preserves bonus');assert.equal(hard.run('perfectRun'),shield===1?6:0);}
 hard.el('word-set').value='nature';hard.el('difficulty').value='normal';hard.el('apply-settings').onclick();assert(!hard.run('doubleScore'));assert.equal(hard.run('score'),0);assert(hard.run('words.every(w=>wordSets.nature.words.includes(w))'));
 for(let n=0;n<6;n++)complete(hard);assert(hard.run('doubleScore'),'normal unlocks bonus too');
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
  const t=session({},false,source);t.run('start();shieldHealth='+health+';wildcardUnlocked=true;setSpeed(1.5);doubleScore=true;perfectRun=6');
  const wrong=t.run("'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(c=>c!==words[wordIndex][progress])");catchItem(t,{letter:wrong});
  assert(t.run('wildcardUnlocked'),'shielded wrong catch preserves purple mode');assert.equal(t.run('speedMultiplier'),1.45);assert.equal(t.run('shieldHealth'),health-1);assert(t.run('wordPerfect'));assert(t.run('doubleScore'));
 }
 const unshielded=session({},false,source);unshielded.run('start();wildcardUnlocked=true');catchItem(unshielded,{letter:unshielded.run("'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(c=>c!==words[wordIndex][progress])")});assert(!unshielded.run('wildcardUnlocked'));
 // Exhaust the pickup-roll distribution: 3% shields and exactly 1% wildcards.
 const drops=session({},false,source);drops.run('start();wildcardUnlocked=true');
 const distribution=drops.run(`(()=>{const old=Math.random;let shield=0,wild=0;try{for(let i=0;i<1000;i++){const draws=[.9,0,(i+.5)/1000,.5,.5,.5,.5];Math.random=()=>draws.shift()??.5;items=[];spawnDrop();if(items[0].shield)shield++;if(items[0].wild)wild++;}}finally{Math.random=old;}return {shield,wild};})()`);
 assert.equal(distribution.shield,30);assert.equal(distribution.wild,10);
 // Reach the Easter egg by deliberately catching R-I-C-K outside the target word.
 const egg=session({},false,source);egg.run("start();words.splice(0,words.length,'PUNNY');wordIndex=0;progress=0;items=[{x:50,y:20,speed:10,letter:'Z'}];particles=[{life:.5}]");
 for(const letter of 'RICK')catchItem(egg,{letter});
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
console.log('PASS: Rick exact sequence, screen clearing, success/unlock persistence, delayed first/middle/final misses, no challenge score; shield overload/purple preservation, 1% wildcard rolls, yellow bonus word, Give Up and Stats challenge pause.');

for(const source of [webScripts,scripts]){
 const t=session({},false,source);assert.equal(t.el('game-options').hidden,false);t.el('difficulty').value='hard';t.el('apply-settings').onclick();assert.equal(t.el('game-options').hidden,true);assert.equal(t.run('speedMultiplier'),1.4);t.run('pause()');assert.equal(t.el('game-options').hidden,false);t.run('start()');assert(t.el('game-options').hidden);
 for(let n=0;n<14;n++)complete(t);assert.equal(t.run('speedMultiplier'),2.6);assert(t.run('wildcardUnlocked'));assert.equal(t.el('speed-meter').attributes['aria-valuemax'],'260');assert.equal(t.el('speed-fill').style.width,'100%');
 t.run('setSpeed(0);hud()');assert.equal(t.run('speedMultiplier'),1.4);assert.equal(t.el('speed-meter').attributes['aria-valuemin'],'140');assert.equal(t.el('speed-fill').style.width,'0%');
 t.run("words.splice(0,words.length,'LETTER','RHYTHM');wordIndex=0;progress=0");
 const odds=t.run(`(()=>{const old=Math.random;let current=0,next=0;try{for(let i=0;i<1000;i++){let first=true;Math.random=()=>{if(first){first=false;return (i+.5)/1000;}return .5;};const c=randomLetter();if(c==='L')current++;if(c==='E')next++;}}finally{Math.random=old;}return {current,next};})()`);assert.equal(odds.current,80);assert.equal(odds.next,50);
 t.run('progress=5');const lastOdds=t.run(`(()=>{const old=Math.random;let count=0;try{for(let i=0;i<1000;i++){let first=true;Math.random=()=>{if(first){first=false;return (i+.5)/1000;}return .5;};if(randomLetter()==='R')count++;}}finally{Math.random=old;}return count;})()`);assert.equal(lastOdds,80);
 for(const [health,remaining,hp] of [[0,2,3],[1,0,2],[2,1,1]]){t.run('lives=3;shieldHealth='+health);catchItem(t,{shield:true});assert.equal(t.run('lives'),hp);assert.equal(t.run('shieldHealth'),remaining);}
 const noWild=t.run(`(()=>{const old=Math.random;try{const draws=[.9,0,.04,.5,.5,.5,.5];Math.random=()=>draws.shift()??.5;items=[];wildcardUnlocked=true;spawnDrop();return items[0].wild;}finally{Math.random=old;}})()`);assert.equal(noWild,false,'roll beyond Hard 0.5% wildcard window stays ordinary');
 t.run('lives=1;shieldHealth=2');catchItem(t,{shield:true});assert.equal(t.run('state'),'over');assert.equal(t.el('game-options').hidden,false,'game over restores settings');
 t.el('difficulty').value='normal';t.el('apply-settings').onclick();assert.equal(t.run('speedMultiplier'),1);t.run('setSpeed(99)');assert.equal(t.run('speedMultiplier'),2.2);
}
console.log('PASS: active/paused/over settings visibility; Hard 140–260% speed, 8% + 5% letter odds, last-letter exception, wildcard mode, full/half duplicate shield rules; Normal preserved.');

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

for(const source of [webScripts,scripts])for(const mode of ['normal','hard']){
 const t=session({},false,source);t.el('difficulty').value=mode;t.el('word-set').value='nature';t.el('apply-settings').onclick();t.run('lives=2');
 for(let n=0;n<5;n++)complete(t);assert(!t.run('doubleScore'));assert.equal(t.run('lives'),2);
 const before=t.run('score'),length=t.run('words[wordIndex].length');complete(t);assert.equal(t.run('score')-before,(length*10+50)*(mode==='hard'?1.5:1));assert.equal(t.run('lives'),3,'sixth word heals');assert(t.run('doubleScore'),'sixth word unlocks bonus in '+mode);
 const beforeLetter=t.run('score');correct(t);assert.equal(t.run('score')-beforeLetter,20*(mode==='hard'?1.5:1));
 const beforeWord=t.run('score'),remaining=t.run('words[wordIndex].length-progress');complete(t);assert.equal(t.run('score')-beforeWord,(remaining*20+100)*(mode==='hard'?1.5:1));
 t.run('shieldHealth=2');for(let n=0;n<2;n++){catchItem(t,{letter:t.run("'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(c=>c!==words[wordIndex][progress])")});assert(t.run('doubleScore'),'protected mistakes preserve bonus');}assert.equal(t.run('shieldHealth'),0);
 t.run('shieldHealth=1');catchItem(t,{bomb:true});assert(t.run('doubleScore'));assert.equal(t.run('lives'),2);assert.equal(t.run('perfectRun'),7);
 complete(t);assert.equal(t.run('perfectRun'),8);assert.equal(t.run('lives'),2,'no stored heal after full-health reward');for(let n=0;n<4;n++)complete(t);assert.equal(t.run('lives'),3,'twelfth perfect word heals');assert(t.run('doubleScore'));
 t.run('shieldHealth=2');catchItem(t,{bomb:true});assert(!t.run('doubleScore'),'full shield x breaks perfection');assert.equal(t.run('lives'),3);assert.equal(t.run('perfectRun'),0);
 complete(t);assert.equal(t.run('perfectRun'),0,'damaged word is not perfect');for(let n=0;n<6;n++)complete(t);assert(t.run('doubleScore'));
 t.run('shieldHealth=0');catchItem(t,{letter:t.run("'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(c=>c!==words[wordIndex][progress])")});assert(!t.run('doubleScore'));assert.equal(t.run('perfectRun'),0);
}
console.log('PASS: Normal + Hard six-perfect-word healing/2x, sixth-word boundary, doubled later letters/words, 3-HP cap, recurring healing, shield protection and disqualifying-catch reset.');

// Audio event hooks are tested on actual catch paths, independently of audio hardware.
for(const source of [webScripts,scripts]){
 const t=session({},false,source);t.el('word-set').value='nature';t.el('apply-settings').onclick();t.run("var cues=[],buzz=[];sound=name=>cues.push(name);window.WordRainNative={haptic:kind=>buzz.push(kind)};");
 function clear(){t.run('cues=[];buzz=[]');}function has(name){assert(t.run('cues.includes('+JSON.stringify(name)+')'),'cue: '+name);}
 correct(t);has('correct');clear();catchItem(t,{letter:'!'});has('wrong');assert.equal(t.run('buzz.length'),0);
 clear();catchItem(t,{shield:true});has('shield');assert.equal(t.run('buzz.length'),0);
 clear();catchItem(t,{wild:true});has('wildcard');
 t.run('progress=words[wordIndex].length-1;wordPerfect=false');clear();correct(t);has('completed');assert(!t.run("cues.includes('perfect')"));
 t.run('progress=words[wordIndex].length-1;wordPerfect=true;wildcardUnlocked=false');clear();correct(t);has('perfect');has('wildcardMode');assert(!t.run("cues.includes('completed')"),'perfect never plays ordinary completion');
 t.run('progress=words[wordIndex].length-1;wordPerfect=true;perfectWords=1;perfectRun=5;lives=2');clear();correct(t);has('speedUp');has('regen');has('perfect');assert(!t.run("cues.includes('wildcardMode')"),'mode-enter cue only when newly unlocked');
 t.run('progress=words[wordIndex].length-1;wordPerfect=true;perfectRun=11;lives=3;setSpeed(maxSpeed());perfectWords=1');clear();correct(t);assert(!t.run("cues.includes('regen')"));assert(!t.run("cues.includes('speedUp')"),'no acceleration cue at cap');
 for(const health of [0,1,2]){t.run('lives=3;shieldHealth='+health);clear();catchItem(t,{bomb:true});assert.equal(t.run("cues.includes('loseHP')"),health!==2);assert.equal(t.run("cues.includes('shatter')"),health>0);assert.equal(t.run('buzz[0]'),health===2?'shield':health===1?'both':'hp');}
 t.run('lives=3;shieldHealth=1');clear();catchItem(t,{letter:'!'});has('wrong');has('shatter');assert.equal(t.run('buzz[0]'),'shield');
 t.run('lives=3;shieldHealth=2');clear();catchItem(t,{shield:true});has('shield');has('loseHP');has('shatter');assert.equal(t.run('buzz[0]'),'both');
 t.el('difficulty').value='hard';t.el('apply-settings').onclick();catchItem(t,{letter:'!'});assert.equal(t.run('score'),2);catchItem(t,{letter:'!'});assert.equal(t.run('score'),4);catchItem(t,{letter:'!'});assert.equal(t.run('score'),4);correct(t);assert.equal(t.run('score'),4,'recovery catch remains unscored in Hard');correct(t);assert.equal(t.run('score'),19);
 if(source===scripts){t.run('score=1000.5;hud()');assert.equal(session(t.store).run('mobileRecords.highScore'),1000.5,'half-point best survives reload');}
}
// 1.4.5: wrong-letter points are fixed by mode, including protected bonus catches.
for(const source of [scripts,webScripts])for(const mode of ['normal','hard'])for(const health of [0,1,2]){
 const t=session({},false,source);t.el('difficulty').value=mode;t.el('apply-settings').onclick();
 t.run('shieldHealth='+health+';doubleScore=true;perfectRun=6');
 const expected=mode==='hard'?2:1;
 catchItem(t,{letter:'!'});assert.equal(t.run('score'),expected,'fixed wrong points, no perfect doubling');
 catchItem(t,{letter:'!'});assert.equal(t.run('score'),expected*2);
 catchItem(t,{letter:'!'});assert.equal(t.run('score'),expected*2,'third wrong catch earns zero');
 correct(t);assert.equal(t.run('score'),expected*2,'recovery catch earns zero');
 correct(t);assert.equal(t.run('score'),expected*2+(mode==='hard'?15:10));
}
console.log('PASS 1.4.5: Normal +1 / Hard +2, shield and bonus exceptions, third wrong/recovery zero, subsequent correct scoring.');
// Exercise actual synthesis/mixing/transport with a deterministic Web Audio stand-in.
const music=session();music.run(`
var audioNodes=[];
function audioNode(){return {gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},frequency:{value:0},connect(){},disconnect(){},start(...args){this.started=args;},stop(){this.stopped=true;}};}
window.AudioContext=class {
 constructor(){this.state='running';this.currentTime=0;this.destination={};}
 createGain(){return audioNode();}
 createOscillator(){const node=audioNode();audioNodes.push(node);return node;}
 createBufferSource(){const node=audioNode();audioNodes.push(node);return node;}
 createBuffer(channels,length,rate){const data=new Float32Array(length);return {duration:length/rate,getChannelData(){return data;}};}
};
start();
`);
assert(music.run('Boolean(audioContext)'));music.el('bgm-toggle').onclick();assert(music.run('musicSource.loop'));assert(music.run('musicBuffer.getChannelData(0).every(Number.isFinite)'));assert(music.run('musicBuffer.getChannelData(0).some(n=>n!==0)'));
const peak=music.run('musicBuffer.getChannelData(0).reduce((m,n)=>Math.max(m,Math.abs(n)),0)');assert(peak<1&&peak>.05,'original music has signal and headroom');
music.run('audioContext.currentTime=3;pause()');assert.equal(music.run('musicSource'),null);assert.equal(music.run('musicOffset'),3);music.run('start()');assert.equal(music.run('musicSource.started[1]'),3,'BGM resumes at paused position');
const tones=music.run('audioNodes.length');music.run("sound('correct')");assert.equal(music.run('audioNodes.length'),tones+2);music.el('sfx-toggle').onclick();music.run("sound('wrong')");assert.equal(music.run('audioNodes.length'),tones+2,'muted SFX schedules no tones');assert(music.run('Boolean(musicSource)'),'SFX switch does not mute BGM');
music.el('bgm-toggle').onclick();assert.equal(music.run('musicSource'),null);assert.equal(session(music.store).run('audioPrefs.sfx'),false);assert.equal(session(music.store).run('audioPrefs.bgm'),false);
music.run("window.Audio=class {constructor(src){this.src=src;this.paused=true;} play(){this.paused=false;} pause(){this.paused=true;}removeAttribute(){}load(){}};pause();loadCustomMusic('data:audio/mpeg;base64,AAA')");assert(music.run('customMusic.paused'));music.run('start()');assert(!music.run('customMusic.paused'));music.run('pause()');assert(music.run('customMusic.paused'));music.el('reset-music').onclick();assert.equal(music.run('customMusic'),null);
console.log('PASS: eleven sound events; perfect/completion exclusion; real regen, speed and wildcard transitions; HP/shield vibration; Hard 1.5x including half-point best migration; original music synthesis, independent switches, pause/resume and local-music override.');

for(const source of [webScripts,scripts]){
 const t=session({},false,source);
 t.el('color-theme').value='space';t.el('color-theme').onchange();
 t.el('handwriting-mode').checked=true;t.el('handwriting-mode').onchange();assert(t.el('color-theme').disabled,'paper disables palette');
 t.el('color-theme').value='nature';t.el('color-theme').onchange();assert.equal(t.run('colorTheme'),'space','paper keeps chosen palette');
 t.el('handwriting-mode').checked=false;t.el('handwriting-mode').onchange();assert.equal(t.el('color-theme').disabled,false);assert.equal(t.el('color-theme').value,'space');
 t.run("window.Audio=class {constructor(src){this.src=src;this.paused=true;}play(){this.paused=false;}pause(){this.paused=true;}removeAttribute(){}load(){}};start();score=42;progress=1;perfectRun=2;");
 t.run("window.confirm=()=>false;window.WordRainNative={downloadMusic(){throw Error('must not download without consent')}}");
 for(const id of ['carefree','monkeys']){
  t.el('music-track').value=id;t.el('music-track').onchange();assert.equal(t.run('selectedTrack'),id==='carefree'?'original':'carefree');assert(!t.run('musicTracks.'+id+'.src'),'cancel does not fetch or attach audio');assert.equal(t.run('state'),'paused');
  t.run("window.confirm=()=>true;window.WordRainNative={downloadMusic(id){window.requested=id}};");
  t.el('music-track').value=id;t.el('music-track').onchange();assert.equal(t.run('downloadingMusic'),id);assert.equal(t.run('window.requested'),id);assert.equal(t.run('selectedTrack'),id==='carefree'?'original':'carefree','wait for verified download');
  t.run('window.wordRainDownloadReady('+JSON.stringify(id)+')');assert.equal(t.run('selectedTrack'),id);assert(t.run('customMusic.src').endsWith('.mp3'));
  assert.equal(t.run('score'),42);assert.equal(t.run('progress'),1);assert.equal(t.run('perfectRun'),2,'download never alters game records');
  assert.equal(session(t.store,false,source).run('selectedTrack'),'original','missing downloaded track falls back without fetching');
  const reload=session(t.store,false,source,{hasMusic:()=>true});assert.equal(reload.run('selectedTrack'),id,'cached native selection survives update/reopen');
 }
 t.el('bgm-toggle').onclick();t.run('start()');assert(!t.run('customMusic.paused'));t.run('pause()');assert(t.run('customMusic.paused'));
 t.run("loadCustomMusic('data:audio/mpeg;base64,AAAA')");assert.equal(t.run('selectedTrack'),'local');assert.equal(t.el('local-music-option').disabled,false);assert.equal(session(t.store,false,source).run('selectedTrack'),'original','local files are not saved');
 t.el('reset-music').onclick();assert.equal(t.run('selectedTrack'),'original');assert.equal(t.run('customMusic'),null);
 const invalid=session({'word-rain-audio-v1':JSON.stringify({bgm:false,sfx:true,track:'__proto__'})},false,source);assert.equal(invalid.run('selectedTrack'),'original','saved track is whitelisted');
}
console.log('PASS: handwriting disables/restores palette without changing selection; optional music consent/cancel, verified native completion, offline selection, pause/resume, local override/reset, invalid-track fallback and unchanged live scores/streaks.');
