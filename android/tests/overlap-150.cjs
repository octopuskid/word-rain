const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const tests=`
const web=[...fs.readFileSync(require('path').join(__dirname,'../../index.html'),'utf8').matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].map(x=>x[1]);
function boot(mode,source){const t=session({},false,source);t.el('difficulty').value=mode;t.el('apply-settings').onclick();t.run("words.splice(0,words.length,'RAIN','MOON');wordIndex=0;progress=0;items=[];spawn=99;hud()");return t;}
function block(kind,extra={}){return Object.assign({x:100,y:100,speed:100,letter:kind==='letter'?'Z':'',wild:kind==='wild',bomb:kind==='bomb',shield:kind==='shield'},extra);}
function pair(t,a,b){t.run('items='+JSON.stringify([a,b])+';resolveBlockOverlaps()');}
for(const source of [web,scripts])for(const mode of ['normal','hard']){
 const matrix=[['letter','letter','wild'],['letter','bomb','letter'],['bomb','bomb','bomb'],['shield','letter','letter'],['shield','bomb','bomb'],['shield','wild','wild'],['shield','shield','shield'],['wild','letter','wild']];
 for(const [a,b,result] of matrix)for(const reverse of [false,true]){
  const t=boot(mode,source),drops=[block(a),block(b,{y:110,speed:200})];pair(t,...(reverse?drops.reverse():drops));
  assert.equal(t.run('items.length'),1,a+' + '+b);assert.equal(t.run('blockKind(items[0])'),result);assert.equal(t.run('score'),0);assert.equal(t.run('lives'),3);assert.equal(t.run('shieldHealth'),0);assert(t.run('wordPerfect'));assert(!t.run('wildcardUnlocked'));
  if(a===b){assert.equal(t.run('items[0].y'),105);assert.equal(t.run('items[0].speed'),150);}
 }
 for(const delta of [{x:136},{y:140},{y:-25},{y:500}]){const t=boot(mode,source);pair(t,block('letter',delta),block('letter'));assert.equal(t.run('items.length'),2,'edges/offscreen/catcher cutoff');}
 const moving=boot(mode,source);moving.run('items='+JSON.stringify([block('letter',{y:50,speed:100}),block('letter',{y:100,speed:0})])+';update(.2)');assert.equal(moving.run('items.length'),1);assert(moving.run('items[0].wild'),'overtaking blocks resolve after movement');
 for(const reverse of [false,true]){
  const t=boot(mode,source),drops=[block('wild'),block('bomb')];pair(t,...(reverse?drops.reverse():drops));assert.equal(t.run('items.length'),0);assert.equal(t.run('progress'),1);assert.equal(t.run('score'),mode==='hard'?28:10);assert.equal(t.run('lives'),3);assert(t.run('wordPerfect'));
 }
 const imperfect=boot(mode,source);imperfect.run('wordPerfect=false;scoringPaused=true;wrongStreak=3;rickInput="RIC"');pair(imperfect,block('wild'),block('bomb'));assert.equal(imperfect.run('score'),0);assert.equal(imperfect.run('progress'),1);assert(!imperfect.run('wordPerfect'));assert(!imperfect.run('scoringPaused'));assert.equal(imperfect.run('rickInput'),'');
 const word=boot(mode,source);word.run('progress=1;wordPerfect=false');pair(word,block('wild'),block('wild'));assert.equal(word.run('words[wordIndex]'),'MOON');assert.equal(word.run('perfectRun'),1);assert.equal(word.run('score'),mode==='hard'?224:80);assert(word.run('wildcardUnlocked'));
 if(source===scripts){assert.equal(word.run('mobileRecords.words.RAIN.perfect'),1);assert.equal(word.run('mobileRecords.words.MOON.met'),1);assert.equal(word.run('mobileRecords.highScore'),word.run('score'));}
 const sixth=boot(mode,source);sixth.run('progress=2;perfectRun=5;perfectWords=1;lives=2');pair(sixth,block('wild'),block('wild'));assert.equal(sixth.run('score'),mode==='hard'?196:70);assert.equal(sixth.run('lives'),3);assert.equal(sixth.run('perfectRun'),6);assert(sixth.run('doubleScore'));assert.equal(sixth.run('speedMultiplier'),mode==='hard'?1.6:1.2);
 const recover=boot(mode,source);recover.run('scoringPaused=true;wrongStreak=3');pair(recover,block('wild'),block('wild'));assert.equal(recover.run('score'),mode==='hard'?224:80);assert(!recover.run('scoringPaused'));
 const catcher=boot(mode,source);pair(catcher,block('letter',{x:240,y:460}),block('bomb',{x:240,y:460}));assert.equal(catcher.run('lives'),3);catcher.run('x=target=240;update(0)');assert.equal(catcher.run('lives'),3,'overlap removes hazard before basket catch');
 const chain=boot(mode,source);chain.run('items='+JSON.stringify(Array.from({length:12},()=>block('letter')))+';resolveBlockOverlaps()');assert(chain.run('items.length')<12,'multi-block chains terminate');assert.equal(chain.run('lives'),3);
 const paused=boot(mode,source);paused.run('pause()');pair(paused,block('wild'),block('wild'));assert.equal(paused.run('items.length'),2);assert.equal(paused.run('score'),0);
 const egg=boot(mode,source);egg.run('beginRickChallenge()');pair(egg,block('letter'),block('letter'));assert.equal(egg.run('items.length'),2,'Rick sequence excluded');
 // Exhaust actual non-hazard pickup rolls: shields 3%, wildcards only while unlocked.
 for(const unlocked of [false,true]){
  const odds=boot(mode,source);odds.run('wildcardUnlocked='+unlocked);
  const counts=odds.run(\`(()=>{const old=Math.random;let shield=0,wild=0;try{for(let i=0;i<2000;i++){const draws=[.9,0,(i+.5)/2000,.5,.5,.5,.5];Math.random=()=>draws.shift()??.5;items=[];spawnDrop();shield+=Number(items[0].shield);wild+=Number(items[0].wild);}}finally{Math.random=old;}return {shield,wild};})()\`);
  assert.equal(counts.shield,60);assert.equal(counts.wild,unlocked?(mode==='hard'?10:20):0);
 }
}
console.log('PASS: Normal/Hard web + mobile collision matrix both orders, boundaries, overtaking, pre-catch removal, chains, auto letter/word scoring, perfection restoration, bonus/healing/speed boundary, mobile records, pause/Rick exclusion and exact wildcard/shield chances.');
`;
new Function('require','__dirname','process',helper+'\n'+tests)(require,__dirname,process);
