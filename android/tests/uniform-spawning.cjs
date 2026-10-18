// Regression checks for bounded, randomized spawning (shared browser/APK generator).
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=`
const originalRandom=Math.random;
try {
 for(const hard of [false,true]){
  const t=session();t.run("start();difficulty="+JSON.stringify(hard?'hard':'normal')+";speedMultiplier=baseSpeed();words.splice(0,words.length,'LETTER');wordIndex=0;progress=0;resetSpawns();var seed=12345;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}");
  const counts=t.run("(()=>{let current=0,next=0,last=-100,gaps=new Set();for(let i=0;i<10000;i++){items=[];const c=randomLetter();if(c==='L'){current++;if(last>=0)gaps.add(i-last);last=i;}if(c==='E')next++;}return {current,next,gaps:gaps.size};})()");
  assert(Math.abs(counts.current-(hard?800:2000))<=2);assert(Math.abs(counts.next-(hard?800:500))<=2);assert(counts.gaps>3,'target rhythm is varied');
  t.run("resetSpawns();items=[{letter:'L',y:0},{letter:'E',y:0}]");for(let i=0;i<200;i++)assert(!['L','E'].includes(t.run('randomLetter()')),'no pending target duplicates');
  t.run('items=[];progress=5;resetSpawns()');assert(Math.abs(t.run("Array.from({length:1000},()=>randomLetter()).filter(c=>c==='R').length")-(hard?80:200))<=2);
  t.run('progress=0;resetSpawns();wildcardUnlocked=true;items=[]');
  const kinds=t.run("(()=>{let bombs=0,shield=0,wild=0,speeds=new Set(),positions=new Set();for(let i=0;i<6080;i++){items=[];spawnDrop();const a=items[0];bombs+=a.bomb;shield+=a.shield;wild+=a.wild;speeds.add(a.speed);positions.add(Math.round(a.x));}return {bombs,shield,wild,speeds:speeds.size,positions:positions.size};})()");
  assert(Math.abs(kinds.bombs-1400)<=2);assert(Math.abs(kinds.shield-140)<=2);assert(Math.abs(kinds.wild-(hard?0:70))<=2);assert.equal(kinds.speeds,1);assert(kinds.positions>350,'continuous random positions');
  assert(Math.abs(t.run('DROP_INTERVAL')-(.77/.608/1.05))<1e-12,'5% higher base rate');
  for(const offset of [0,.05,.2,.4,1.2]){
   t.run('speedMultiplier=baseSpeed()+'+offset);const frequency=1+.03*offset/.2;
   assert(Math.abs(t.run('spawnFrequency()')-frequency)<1e-12);
   const samples=t.run('Array.from({length:20000},()=>nextDropInterval())');const mean=t.run('DROP_INTERVAL/spawnFrequency()');
   assert(samples.every(x=>x>=mean*.8&&x<=mean*1.2),'bounded timing variation');assert(Math.abs(samples.reduce((a,b)=>a+b,0)/samples.length/mean-1)<.004,'expected mean rate');assert(new Set(samples).size>1000);
  }
  t.run('speedMultiplier=baseSpeed();spawn=1;setSpeed(baseSpeed()+.4)');assert(Math.abs(t.run('spawn')-1/1.06)<1e-12,'pending timer follows speed increase');t.run('setSpeed(baseSpeed())');assert(Math.abs(t.run('spawn')-1)<1e-12,'slowdown restores base frequency');
  t.run('elapsed=0;seed=98765');const first=t.run('nextDropInterval()');t.run('elapsed=9999;seed=98765');assert.equal(t.run('nextDropInterval()'),first,'no elapsed-time acceleration');
 }
 function cadence(step){const q=session();q.run('start();lives=100000;var frameSeed=123;Math.random=()=>{frameSeed=(Math.imul(frameSeed,1664525)+1013904223)>>>0;return frameSeed/4294967296;}');let count=0;q.c.traceDrop=()=>count++;q.run('const realDrop=spawnDrop;spawnDrop=()=>{traceDrop();realDrop();items=[]}');for(let i=0;i<Math.round(60/step);i++)q.run('update('+step+')');return count;}
 assert.equal(cadence(1/30),cadence(1/120));
 console.log('PASS: bounded timing randomness, 5% base increase, speed-linked frequency and reversal, balanced shares, varied target rhythm, no duplicate swarms, random positions and frame-rate-independent scheduling.');
} finally {Math.random=originalRandom;}
`;
vm.runInNewContext(helper+checks,{require,process:{argv:['node',__filename,process.argv[2]||path.join(__dirname,'../build/assets/index.html')]},__dirname,console,Math});
