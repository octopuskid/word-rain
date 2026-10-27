'use strict';
// Android-only routes and finite story runs. Classic code and records stay separate.
let dreamScreen='home';
const storyKey='word-rain-story-v1';
const storyStages=[
 {title:'The sleeping sky',words:['GLOW','STAR','DREAM'],speed:76,hazards:0,intro:'A small star lands on your windowsill. “The dawn has lost its words,” it whispers. Gather a glow, a star, and a dream to light the first cloud.',ending:'The little star warms in your hands. A silver path appears between the clouds. Somewhere beyond it, a letter is waiting.'},
 {title:'The cloud post',words:['WIND','LIGHT','DAWN'],speed:94,hazards:.10,intro:'At the cloud post, undelivered letters drift through the night. Follow the wind. Bring back the light. Watch for the dark knots marked ×.',ending:'The letters rise like tiny lanterns. Their light spells a direction: home. The sky begins to remember a pale blue morning.'},
 {title:'A place called home',words:['WISH','HEART','HOME'],speed:110,hazards:.16,intro:'The last cloud guards a quiet doorway. The star asks for a wish, a heart, and a place to belong. Carry these final words through the restless rain.',ending:'The doorway opens. Your star settles into the sunrise, and the first warm light falls across your window. The dawn remembers. So do you. Chapter one complete.'}
];
let storySave={completed:0},storyStorageAvailable=true;
try{const saved=JSON.parse(localStorage.getItem(storyKey));if(saved&&Number.isInteger(saved.completed)&&saved.completed>=0&&saved.completed<=storyStages.length)storySave.completed=saved.completed;}catch(_){storyStorageAvailable=false;}
let storyRun=null,storySelected=0,storyPointer=null,storyLast=0;
const storyCanvas=$('dream-canvas'),storyCtx=storyCanvas.getContext('2d');
function saveStory(){try{localStorage.setItem(storyKey,JSON.stringify(storySave));}catch(_){storyStorageAvailable=false;}}
function renderDreamChapters(){
 for(let i=0;i<storyStages.length;i++){
  $('dream-stage-'+i).disabled=i>storySave.completed;
  $('dream-stage-state-'+i).textContent=i<storySave.completed?'Restored · Play again':i===storySave.completed?'Ready to discover':'Finish the previous stage to unlock';
 }
 $('dream-save-note').textContent=storyStorageAvailable?'Your chapter progress is saved on this device.':'Storage is unavailable. Progress lasts until you close the app.';
 $('dream-continue-label').textContent=storyRun&&storyRun.status==='paused'?'Resume your dream':storySave.completed===3?'Chapter 01 restored · Play again':'The missing dawn · '+storySave.completed+' / 3 stages restored';
}
function routeDream(screen){
 if(tutorialActive)return;
 if(dreamScreen==='classic'&&state==='playing')pause();
 if(dreamScreen==='play'&&storyRun&&storyRun.status==='playing')pauseStory();
 dreamScreen=screen;document.documentElement.dataset.dreamScreen=screen;
 const classic=screen==='classic';$('android-classic').hidden=!classic;$('mobile-tabs').hidden=!classic;$('dream-shell').hidden=classic;
 for(const page of ['home','chapters','intro','play','result','records'])$('dream-'+page).hidden=page!==screen;
 if(screen==='home'||screen==='chapters')renderDreamChapters();
 if(screen==='records'){
  $('dream-best').textContent=mobileRecords.highScore;$('dream-finished').textContent=storySave.completed+' / 3';
  $('dream-met').textContent=Object.values(mobileRecords.words).reduce((n,e)=>n+e.met,0);
  $('dream-perfect').textContent=Object.values(mobileRecords.words).reduce((n,e)=>n+e.perfect,0);
 }
 syncAudio();
}
function openDreamClassic(){routeDream('classic');selectMobileTab('game');}
function chooseStoryStage(index){
 if(!Number.isInteger(index)||index<0||index>=storyStages.length||index>storySave.completed||tutorialActive)return;
 storySelected=index;const stage=storyStages[index];
 $('dream-intro-number').textContent='CHAPTER 01 · STAGE 0'+(index+1);$('dream-intro-title').textContent=stage.title;$('dream-intro-copy').textContent=stage.intro;
 $('dream-intro-goal').textContent='Restore '+stage.words.length+' words · '+stage.words.join(' / ');routeDream('intro');
}
function beginStory(){
 if(tutorialActive||dreamScreen!=='intro')return;
 const stage=storyStages[storySelected];
 storyRun={stage:storySelected,status:'playing',word:0,letter:0,hearts:3,x:180,target:180,items:[],spawn:.35,time:0};
 routeDream('play');$('dream-feedback').textContent='Catch the glowing letter.';unlockAudio();syncAudio();renderStoryHud();storyCanvas.focus({preventScroll:true});
}
function renderStoryHud(){
 if(!storyRun)return;const r=storyRun,stage=storyStages[r.stage],word=stage.words[r.word]||'';
 $('dream-play-stage').textContent='CHAPTER 01 · '+stage.title.toUpperCase();$('dream-word-count').textContent=r.word+' / '+stage.words.length+' words';
 $('dream-hearts').textContent='♥ '.repeat(r.hearts).trim();$('dream-hearts').setAttribute('aria-label',r.hearts+' hearts');
 $('dream-progress-fill').style.width=(r.word/stage.words.length*100)+'%';
 $('dream-target').innerHTML=[...word].map((c,i)=>'<span class="'+(i<r.letter?'done':i===r.letter?'current':'')+'">'+c+'</span>').join('');
 $('dream-pause-overlay').hidden=r.status!=='paused';
}
function pauseStory(){if(storyRun&&storyRun.status==='playing'){storyRun.status='paused';storyPointer=null;renderStoryHud();syncAudio();}}
function resumeStory(){if(tutorialActive||!storyRun||storyRun.status!=='paused')return;routeDream('play');storyRun.status='playing';renderStoryHud();unlockAudio();syncAudio();storyCanvas.focus({preventScroll:true});}
function finishStory(won){
 const r=storyRun;if(!r||r.status!=='playing')return;r.status=won?'won':'lost';r.items=[];
 if(won){storySave.completed=Math.max(storySave.completed,r.stage+1);saveStory();sound('completed');}
 $('dream-result-kicker').textContent=won?'A LITTLE MORE LIGHT':'THE DREAM IS STILL HERE';
 $('dream-result-title').textContent=won?(r.stage===2?'Morning, at last.':'A word of light.'):'Rest, then try again.';
 $('dream-result-copy').textContent=won?storyStages[r.stage].ending:'The rain grew too restless this time. Your restored stages are safe. Take a breath and return to this page of the story.';
 $('dream-result-next').textContent=won?(r.stage===2?'Back to the sky →':'Next stage →'):'Try this stage →';routeDream('result');
}
function spawnStoryDrop(){
 const r=storyRun;if(!r||r.status!=='playing')return;
 const stage=storyStages[r.stage],hazard=Math.random()<stage.hazards;
 const needed=stage.words[r.word][r.letter];const letter=hazard?'×':Math.random()<.72?needed:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random()*26)];
 r.items.push({x:24+Math.random()*312,y:-24,letter,hazard,speed:stage.speed+Math.random()*16});
}
function catchStoryDrop(item){
 const r=storyRun;if(!r||r.status!=='playing')return;
 const stage=storyStages[r.stage];
 if(!item.hazard&&item.letter===stage.words[r.word][r.letter]){
  r.letter++;sound('correct');$('dream-feedback').textContent='A little more light.';
  if(r.letter===stage.words[r.word].length){r.word++;r.letter=0;r.items=[];r.spawn=.6;sound('completed');$('dream-feedback').textContent='Word restored.';if(r.word===stage.words.length){finishStory(true);return;}}
 }else{r.hearts--;sound('loseHP');try{if(window.WordRainNative)window.WordRainNative.haptic('hp');}catch(_){}$('dream-feedback').textContent='One heart lost. Catch only the glowing letter.';if(r.hearts===0){finishStory(false);return;}}
 renderStoryHud();
}
function updateStory(dt){
 const r=storyRun;if(!r||r.status!=='playing'||dreamScreen!=='play')return;
 r.time+=dt;r.x+=(r.target-r.x)*Math.min(1,16*dt);r.spawn-=dt;
 if(r.spawn<=0){spawnStoryDrop();r.spawn+=1.05;}
 for(let i=r.items.length-1;i>=0;i--){const a=r.items[i];a.y+=a.speed*dt;if(a.y>=370&&a.y<=412&&Math.abs(a.x-r.x)<37){r.items.splice(i,1);const oldWord=r.word;catchStoryDrop(a);if(r.status!=='playing'||r.word!==oldWord)break;}else if(a.y>460)r.items.splice(i,1);}
}
function drawStory(){
 const c=storyCtx,r=storyRun;c.clearRect(0,0,360,430);c.save();
 c.fillStyle='#ffffff88';for(let i=0;i<9;i++){c.beginPath();c.arc((i*71+35)%360,((i*53+(r?r.time:0)*5)%350),i%2?2:1,0,Math.PI*2);c.fill();}
 c.strokeStyle='#d0d7ec';c.lineWidth=1;c.beginPath();c.moveTo(25,410);c.quadraticCurveTo(180,430,335,410);c.stroke();
 if(r){const stage=storyStages[r.stage],needed=(stage.words[r.word]||'')[r.letter];
  for(const a of r.items){c.save();c.translate(a.x,a.y);c.shadowBlur=a.letter===needed?17:0;c.shadowColor='#d2bf89';c.fillStyle=a.hazard?'#b7abc9':a.letter===needed?'#fff7d9':'#e0e4f1';c.beginPath();c.roundRect(-16,-18,32,36,11);c.fill();c.shadowBlur=0;c.fillStyle=a.hazard?'#655375':'#616c91';c.font='800 21px "Dream Sans",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(a.letter,0,1);c.restore();}
  c.fillStyle='#9385b3';c.beginPath();c.roundRect(r.x-30,387,60,13,7);c.fill();c.strokeStyle='#9385b3';c.lineWidth=4;c.beginPath();c.moveTo(r.x-32,376);c.quadraticCurveTo(r.x-26,401,r.x,401);c.quadraticCurveTo(r.x+26,401,r.x+32,376);c.stroke();
 }c.restore();
}
function storyFrame(t){const dt=Math.min(.04,(t-storyLast)/1000||0);storyLast=t;if(dreamScreen==='play'){updateStory(dt);drawStory();}requestAnimationFrame(storyFrame);}
function moveStory(e){if(!storyRun||storyRun.status!=='playing')return;const rect=storyCanvas.getBoundingClientRect();storyRun.target=Math.max(34,Math.min(326,(e.clientX-rect.left)/rect.width*360));}
storyCanvas.onpointerdown=e=>{if(!storyRun||storyRun.status!=='playing'||storyPointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;storyPointer=e.pointerId;storyCanvas.setPointerCapture(e.pointerId);moveStory(e);};
storyCanvas.onpointermove=e=>{if(e.pointerId===storyPointer)moveStory(e);};
storyCanvas.onpointerup=storyCanvas.onpointercancel=storyCanvas.onlostpointercapture=e=>{if(e.pointerId===storyPointer)storyPointer=null;};
$('dream-classic').onclick=openDreamClassic;$('classic-home').onclick=()=>routeDream('home');
$('dream-story').onclick=()=>{if(storyRun&&storyRun.status==='paused')resumeStory();else routeDream('chapters');};
$('dream-stats').onclick=()=>routeDream('records');
for(const id of ['dream-chapters-home','dream-records-home','dream-play-home'])$(id).onclick=()=>routeDream('home');
for(let i=0;i<3;i++)$('dream-stage-'+i).onclick=()=>chooseStoryStage(i);
$('dream-intro-back').onclick=()=>routeDream('chapters');$('dream-begin').onclick=beginStory;
$('dream-pause').onclick=pauseStory;$('dream-resume').onclick=resumeStory;
$('dream-abandon').onclick=()=>{if(storyRun)storyRun.status='abandoned';routeDream('chapters');};
$('dream-result-next').onclick=()=>{if(!storyRun)return;if(storyRun.status==='won'&&storyRun.stage===2)routeDream('home');else chooseStoryStage(storyRun.stage+(storyRun.status==='won'?1:0));};
$('dream-result-chapters').onclick=()=>routeDream('chapters');
$('dream-full-records').onclick=()=>{openDreamClassic();selectMobileTab('stats');};
// Native lifecycle/update prompts call this hook even when Classic is idle.
window.wordRainPauseAll=()=>{pauseStory();if(state==='playing')pause();};
const dreamOriginalPause=pause;pause=function(){if(dreamScreen==='play'){pauseStory();return;}dreamOriginalPause();};$('pause').onclick=pause;
window.addEventListener('blur',pauseStory);document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseStory();});
window.addEventListener('keydown',e=>{if(dreamScreen!=='play'||!storyRun||storyRun.status!=='playing')return;if(e.key==='ArrowLeft'||e.key==='a'){e.preventDefault();storyRun.target=Math.max(34,storyRun.target-28);}if(e.key==='ArrowRight'||e.key==='d'){e.preventDefault();storyRun.target=Math.min(326,storyRun.target+28);}});
// Audio is active only for a visible, unpaused story run.
window.wordRainStoryPlaying=()=>dreamScreen==='play'&&Boolean(storyRun&&storyRun.status==='playing');
const storyOriginalSyncAudio=syncAudio;syncAudio=function(){storyOriginalSyncAudio();$('dream-music').textContent='♫ BGM '+(audioPrefs.bgm?'on':'off');$('dream-music').setAttribute('aria-pressed',String(audioPrefs.bgm));$('dream-sound').textContent='♪ SFX '+(audioPrefs.sfx?'on':'off');$('dream-sound').setAttribute('aria-pressed',String(audioPrefs.sfx));};
$('dream-music').onclick=()=>{$('bgm-toggle').onclick();};$('dream-sound').onclick=()=>{$('sfx-toggle').onclick();};
renderDreamChapters();
// The first-launch walkthrough is shown above Home; finishing it reveals Home.
if(tutorialActive){document.documentElement.dataset.dreamScreen='home';$('android-classic').hidden=true;$('mobile-tabs').hidden=true;$('dream-shell').inert=true;}else routeDream('home');
const dreamOriginalCloseTutorial=closeTutorial;closeTutorial=function(){dreamOriginalCloseTutorial();$('dream-shell').inert=false;if(dreamScreen==='home')routeDream('home');};$('tutorial-skip').onclick=closeTutorial;
requestAnimationFrame(storyFrame);
