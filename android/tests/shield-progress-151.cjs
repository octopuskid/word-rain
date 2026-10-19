const fs=require('fs'),path=require('path'),assert=require('assert');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const tests=String.raw`
const web=[...fs.readFileSync(require('path').join(__dirname,'../../index.html'),'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
function boot(mode,source){const t=session({},false,source);t.el('difficulty').value=mode;t.el('apply-settings').onclick();t.run("start();words.splice(0,words.length,'RAIN','MOON');wordIndex=0;progress=0;items=[];spawn=99;hud()");return t;}
function catchLetter(t,letter){t.run('spawn=99;items=[{x:240,y:460,speed:0,bomb:false,wild:false,shield:false,letter:'+JSON.stringify(letter)+'}];x=target=240;update(0)');}
for(const source of [web,scripts])for(const mode of ['normal','hard']){
 for(const shield of [1,2])for(const progress of [1,2,3]){
  const t=boot(mode,source);t.run('shieldHealth='+shield+';progress='+progress+';perfectRun=6;perfectWords=0;doubleScore=true;wildcardUnlocked=true;setSpeed(baseSpeed()+.4)');
  const speed=t.run('speedMultiplier'),encounters=source===scripts?t.run('JSON.stringify(mobileRecords.words)'):null;
  catchLetter(t,'Z');assert.equal(t.run('progress'),progress);assert.equal(t.run('shieldHealth'),shield-1);assert(t.run('wordPerfect'));assert.equal(t.run('perfectRun'),6);assert(t.run('doubleScore'));assert(t.run('wildcardUnlocked'));assert(Math.abs(t.run('speedMultiplier')-(speed-.05))<1e-8);assert.equal(t.run('score'),mode==='hard'?2:1);
  if(encounters)assert.equal(t.run('JSON.stringify(mobileRecords.words)'),encounters,'protected mistake adds no encounter');
  assert(t.el('feedback').textContent.includes('Word progress kept. Continue with '+'RAIN'[progress]),t.el('feedback').textContent);
  for(let i=progress;i<4;i++)catchLetter(t,'RAIN'[i]);assert.equal(t.run('words[wordIndex]'),'MOON');assert.equal(t.run('perfectRun'),7);
  if(source===scripts)assert.equal(t.run('mobileRecords.words.RAIN.perfect'),1);
 }
 const shattered=boot(mode,source);shattered.run('shieldHealth=1;progress=2;wildcardUnlocked=true');catchLetter(shattered,'Z');assert.equal(shattered.run('progress'),2);assert(shattered.run('wordPerfect'));catchLetter(shattered,'Z');assert.equal(shattered.run('progress'),2);assert(!shattered.run('wordPerfect'));assert(!shattered.run('wildcardUnlocked'));
 const imperfect=boot(mode,source);imperfect.run('shieldHealth=2;progress=2;wordPerfect=false');catchLetter(imperfect,'Z');assert.equal(imperfect.run('progress'),2);assert(!imperfect.run('wordPerfect'),'shield does not restore previously lost perfection');
 const paused=boot(mode,source);paused.run('shieldHealth=1;progress=2;wrongStreak=2');catchLetter(paused,'Z');assert(paused.run('scoringPaused'));assert.equal(paused.run('score'),0);assert.equal(paused.run('progress'),2);catchLetter(paused,'I');assert.equal(paused.run('progress'),3);assert.equal(paused.run('score'),0);assert(!paused.run('scoringPaused'));
}
console.log('1.5.1 shield progress tests passed for web and mobile, Normal and Hard.');
`;
new Function('require','__dirname','process',helper+'\n'+tests)(require,__dirname,process);
