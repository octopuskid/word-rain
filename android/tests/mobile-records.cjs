const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(process.argv[2]||require('path').join(__dirname,'../build/assets/index.html'),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);for(const s of scripts)new vm.Script(s);
function session(store={},blocked=false){
 const elements=new Map(),events={};
 function el(id){if(!elements.has(id))elements.set(id,{id,textContent:'',innerHTML:'',hidden:id==='mobile-stats-panel'||id==='reset-stats-confirm',style:{},attributes:{},classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=String(v)},focus(){},addEventListener(k,v){events[id+':'+k]=v},getContext(){return new Proxy({},{get:()=>()=>{}})}});return elements.get(id)}
 const c=vm.createContext({Math,Set,Array,String,Object,Number,JSON,console,navigator:{userAgent:'Android Mobile'},screen:{width:412,height:915},document:{documentElement:{dataset:{}},querySelector:q=>el(q==='canvas'?'game':'meta'),getElementById:el,addEventListener(){}},window:{matchMedia:()=>({matches:false}),addEventListener(){}},localStorage:{getItem(k){if(blocked)throw Error('blocked');return store[k]||null},setItem(k,v){if(blocked)throw Error('blocked');store[k]=v}},getComputedStyle:()=>({getPropertyValue:()=> '#ffffff06'}),requestAnimationFrame(){}});
 for(const s of scripts)vm.runInContext(s,c);
 return {c,el,store,run:s=>vm.runInContext(s,c)};
}
const a=session();assert.equal(a.run('Object.keys(mobileRecords.words).length'),0,'ready screen is not an encounter');
a.run('start()');let word=a.run('words[wordIndex]');assert.equal(a.run('mobileRecords.words[words[wordIndex]].met'),1);
a.run('pause();start()');assert.equal(a.run('mobileRecords.words[words[wordIndex]].met'),1,'resume must not add encounters');
function catchItem(s,props){s.run('spawn=99;items=[Object.assign({x:240,y:460,speed:0,bomb:false,wild:false,shield:false,letter:""},'+JSON.stringify(props)+')];x=target=240;update(0)')}
function correct(s){catchItem(s,{letter:s.run('words[wordIndex][progress]')})}
function complete(s){const w=s.run('words[wordIndex]');let guard=0;while(s.run('words[wordIndex]')===w&&guard++<8)correct(s);assert(guard<=7);return w}
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
