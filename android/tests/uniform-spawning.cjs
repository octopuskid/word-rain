const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=`
for(const hard of [false,true]){
 const t=session(); t.run("start();difficulty="+JSON.stringify(hard?'hard':'normal')+";words.splice(0,words.length,'LETTER');wordIndex=0;progress=0;resetSpawns();");
 const counts=t.run("(()=>{let current=0,next=0,last=-100,maxGap=0,minGap=100;for(let i=0;i<10000;i++){items=[];let c=randomLetter();if(c==='L'){current++;if(last>=0){maxGap=Math.max(maxGap,i-last);minGap=Math.min(minGap,i-last);}last=i;}if(c==='E')next++;}return {current,next,minGap,maxGap};})()");
 assert.equal(counts.current,hard?800:2000);assert.equal(counts.next,hard?800:500);console.log(hard,counts);assert(counts.maxGap-counts.minGap<=3,'target opportunities evenly spaced');
 t.run("resetSpawns();items=[{letter:'L',y:0},{letter:'E',y:0}]");for(let i=0;i<200;i++)assert(!['L','E'].includes(t.run('randomLetter()')),'no pending target duplicates');
 t.run("items=[];progress=5;resetSpawns()");const final=t.run("Array.from({length:1000},()=>randomLetter()).filter(c=>c==='R').length");assert.equal(final,hard?80:200);
 t.run('resetSpawns();wildcardUnlocked=true;items=[]');
 const kinds=t.run("(()=>{let bombs=0,shield=0,wild=0,n=0,lanes=new Set(),speeds=new Set();for(let i=0;i<6080;i++){items=[];spawnDrop();const a=items[0];bombs+=a.bomb;shield+=a.shield;wild+=a.wild;if(!a.bomb)n++;speeds.add(a.speed);if(i<6)lanes.add(Math.round((a.x-48)/76));}return {bombs,shield,wild,n,lanes:lanes.size,speeds:speeds.size};})()");
 assert.equal(kinds.bombs,1400);assert.equal(kinds.n,4680);assert.equal(kinds.speeds,1);assert.equal(kinds.lanes,6);assert.equal(kinds.wild,hard?0:70);assert(Math.abs(kinds.shield-140)<=1);
 // Replaying equal simulation time at different frame rates yields the same count.
 function cadence(step){const q=session();q.run('start();lives=100000;invulnerable=0');let count=0;q.c.traceDrop=()=>count++;q.run('const realDrop=spawnDrop;spawnDrop=()=>{traceDrop();realDrop();items=[]}');for(let i=0;i<Math.round(60/step);i++)q.run('update('+step+')');return count;}
 assert.equal(cadence(1/30),cadence(1/120));assert.equal(cadence(1/60),48);
 const lanes=session();lanes.run('start();resetSpawns()');for(let round=0;round<50;round++){const xs=lanes.run('Array.from({length:6},()=>spawnX())');assert.equal(new Set(xs.map(x=>Math.round((x-48)/76))).size,6);}
}
console.log('PASS: uniform cadence, exact weighted shares, bounded target gaps, no target swarms, equal falling speeds, lane coverage, final-letter rule, both difficulties.');
`;
vm.runInNewContext(helper+checks,{require,process:{argv:['node',__filename,process.argv[2]||path.join(__dirname,'../build/assets/index.html')]},__dirname,console});
