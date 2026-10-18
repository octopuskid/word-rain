// Classic random dropping with uniformly distributed current/following-letter selections.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=`
const oldRandom=Math.random;
try{
 for(const hard of [false,true]){
  const t=session();t.run("start();difficulty="+JSON.stringify(hard?'hard':'normal')+";speedMultiplier=baseSpeed();words.splice(0,words.length,'LETTER');wordIndex=0;progress=0;resetSpawns();var seed=123;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}");
  const counts=t.run("(()=>{let current=0,next=0,last=-100,minGap=100,maxGap=0;for(let i=0;i<10000;i++){const c=randomLetter();if(c==='L'){current++;if(last>=0){minGap=Math.min(minGap,i-last);maxGap=Math.max(maxGap,i-last);}last=i;}if(c==='E')next++;}return {current,next,minGap,maxGap};})()");
  assert.equal(counts.current,hard?800:2000);assert.equal(counts.next,hard?800:500);assert(counts.maxGap-counts.minGap<=3);
  t.run("resetSpawns();items=[{letter:'L',y:0},{letter:'E',y:0}]");const pending=t.run("Array.from({length:1000},()=>randomLetter())");assert.equal(pending.filter(c=>c==='L').length,hard?80:200);assert.equal(pending.filter(c=>c==='E').length,hard?80:50);
  t.run('progress=5;resetSpawns()');assert.equal(t.run("Array.from({length:1000},()=>randomLetter()).filter(c=>c==='R').length"),hard?80:200);
  t.run('progress=0;items=[];resetSpawns();wildcardUnlocked=true');
  const drops=t.run("(()=>{let accepted=0,bombs=0,shield=0,wild=0;const speeds=new Set();for(let i=0;i<100000;i++){items=[];spawnDrop();if(!items.length)continue;const a=items[0];accepted++;bombs+=a.bomb;shield+=a.shield;wild+=a.wild;speeds.add(Math.round(a.speed*100));}return {accepted,bombs,shield,wild,speeds:speeds.size};})()");
  assert(Math.abs(drops.accepted/100000-.608)<.008);assert(Math.abs(drops.bombs/100000-.14)<.006);const nonBomb=drops.accepted-drops.bombs;assert(Math.abs(drops.shield/nonBomb-.03)<.004);assert(Math.abs(drops.wild/nonBomb-(hard?0:.015))<.003);assert(drops.speeds>100,'random fall speeds restored');
  for(const elapsed of [0,20,98,200]){t.run('elapsed='+elapsed+';speedMultiplier=baseSpeed()');assert(Math.abs(t.run('nextDropInterval()')-Math.max(.28,.77-elapsed*.005)*1.21/1.05)<1e-12);}
  t.run('elapsed=0;speedMultiplier=baseSpeed();spawn=1;setSpeed(baseSpeed()+.4)');assert(Math.abs(t.run('spawn')-1/1.06)<1e-12);t.run('setSpeed(baseSpeed())');assert(Math.abs(t.run('spawn')-1)<1e-12);
  const batches=t.run("(()=>{const real=spawnDrop;let calls=0,min=5,max=0;spawnDrop=()=>calls++;try{for(let i=0;i<10000;i++){const before=calls;spawnWave();min=Math.min(min,calls-before);max=Math.max(max,calls-before);}return {mean:calls/10000,min,max};}finally{spawnDrop=real;}})()");assert.equal(batches.min,1);assert.equal(batches.max,3);assert(Math.abs(batches.mean-1.21)<.02);
  const simultaneous=t.run("(()=>{const real=Math.random;let first=true;try{Math.random=()=>first?(first=false,.01):0;items=[];spawnWave();return items.length;}finally{Math.random=real;}})()");assert.equal(simultaneous,3,'three simultaneous accepted drops');
 }
 console.log('PASS: classic random attempts and speeds, original elapsed schedule, simultaneous waves, even target shares with pending copies, final-letter rule, density compensation and speed-linked rate.');
}finally{Math.random=oldRandom;}
`;
vm.runInNewContext(helper+checks,{require,process:{argv:['node',__filename,process.argv[2]||path.join(__dirname,'../build/assets/index.html')]},__dirname,console,Math});
