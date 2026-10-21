'use strict';
// This file is appended only to test.html. It is not bundled in index.html/APK.
let labWords=null,labClock=0,labStatusClock=0,labWaves=0,labDrops=0;
function labNumber(id,min,max,fallback){const value=Number($(id).value);return Math.max(min,Math.min(max,Number.isFinite(value)?value:fallback));}
function labSpeed(){return labNumber('lab-speed',10,1000,100);}
function labInterval(){return labNumber('lab-interval',.1,10,1);}
function labCount(){return Math.round(labNumber('lab-count',1,10,1));}
function labStatus(message){$('lab-status').textContent=(message?message+' · ':'')+labSpeed()+' px/s · '+(1/labInterval()).toFixed(2)+' scheduled waves/s · '+labWaves+' waves · '+labDrops+' drops · '+items.length+' on screen';}
const labOriginalShuffle=shuffleWords;
shuffleWords=function(previous){if(words.length>1)labOriginalShuffle(previous);};
const labOriginalStart=start;
start=function(){const fresh=state!=='paused';labOriginalStart();if(fresh){labClock=0;if(labWords){words.splice(0,words.length,...labWords);wordIndex=0;progress=0;resetSpawns();hud();}}spawn=Infinity;};
function labResume(){if(state==='ready'||state==='over')start();else if(state==='paused')start();}
function labReset(){state='ready';start();labWaves=labDrops=0;labClock=0;labStatus('Fresh test run');}
function labDrop(kind,count=1){
 labResume();if(rickChallenge){labStatus('Finish or reset the Rick challenge first');return;}
 const center=42+(fieldWidth-84)*labNumber('lab-position',0,100,50)/100;
 for(let i=0;i<count;i++){
  if(kind==='mixed'){const before=items.length;spawnWave();labDrops+=items.length-before;for(let j=before;j<items.length;j++)items[j].speed=labSpeed();continue;}
  let letter='';
  if(kind==='target')letter=words[wordIndex][progress];
  if(kind==='next'){if(progress+1>=words[wordIndex].length){labStatus('No following letter on the final blank');return;}letter=words[wordIndex][progress+1];}
  if(kind==='letter')letter='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random()*26)];
  const px=$('lab-stack').checked?center:Math.max(22,Math.min(fieldWidth-22,center+(i-(count-1)/2)*48));
  items.push({x:px,y:-25,speed:labSpeed(),letter,bomb:kind==='bomb',shield:kind==='shield',wild:kind==='wild'});labDrops++;
 }
 labWaves++;labStatus();
}
const labOriginalUpdate=update;
update=function(dt){
 spawn=Infinity;
 if($('lab-safe').checked)lives=3;
 for(const item of items)item.speed=labSpeed();
 if(!rickChallenge&&$('lab-auto').checked){labClock+=dt;let due=0;while(labClock>=labInterval()&&due++<4){labClock-=labInterval();labDrop($('lab-type').value,labCount());}}
 labOriginalUpdate(dt);
 if($('lab-safe').checked){lives=3;hud();}
 labStatusClock+=dt;if(labStatusClock>=.25){labStatusClock=0;labStatus();}
};
const labOriginalGameOver=checkGameOver;
checkGameOver=function(){if($('lab-safe').checked){lives=3;return;}labOriginalGameOver();};
for(const kind of ['target','next','letter','bomb','shield','wild'])$('lab-'+kind).onclick=()=>labDrop(kind);
$('lab-wave').onclick=()=>labDrop($('lab-type').value,labCount());
$('lab-clear').onclick=()=>{items=[];particles=[];labClock=0;labStatus('Blocks cleared');};
$('lab-restart').onclick=labReset;
$('lab-auto').onchange=()=>{labClock=0;if($('lab-auto').checked)labResume();labStatus();};
for(const id of ['lab-speed','lab-interval','lab-count'])$(id).onchange=()=>{labClock=0;for(const item of items)item.speed=labSpeed();labStatus();};
$('lab-apply-words').onclick=()=>{
 const entries=$('lab-words').value.toUpperCase().trim().split(/[\s,;]+/).filter(Boolean);
 if(!entries.length||entries.length>200||entries.some(word=>!/^[A-Z]{2,16}$/.test(word))){labStatus('Enter 1–200 words, each 2–16 letters A–Z');return;}
 labWords=[...new Set(entries)];labReset();labStatus('Custom words applied');
};
$('start').onclick=start;
labStatus();
