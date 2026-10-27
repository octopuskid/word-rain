'use strict';
// Android-only routes and finite story runs. Classic code and records stay separate.
let dreamScreen='home';
const storyKey='word-rain-story-v2';
// Original stories: each whitespace-separated token is one playable word.
const storyText50='At dusk, Mira found a letter beneath her pillow. Its ink shimmered like stars. She followed the words into a silent garden, where a frightened cloud had forgotten its name. Mira read the letter aloud. The cloud smiled, remembered the rain, and watered every sleeping flower before the morning arrived.';
const storyText100='Beyond the garden, Mira discovered a bridge woven from moonlight. Halfway across, the stars vanished, leaving only her little lantern. A voice beneath the bridge asked why she carried such a tiny light. Mira answered that small lights could still show the next step. The voice belonged to a lost giant who feared the dark. Together they crossed slowly, sharing stories about their homes. With every word, another star returned. At the far bank, the giant lifted Mira high enough to hang her lantern in the sky. Its gentle glow guided every traveler safely home, even on the darkest nights.';
const storyStages=[
 {title:'Ten scattered words',words:['GLOW','BICYCLE','PEPPER','CASTLE','VIOLIN','SOCK','PLANET','LADDER','LEMON','PUZZLE'],text:'',speed:76,hazards:0,intro:'Begin with ten unrelated words. There is no story to connect them: simply finish each word in order to complete Chapter 1.',ending:'Ten words collected. Now you are ready to turn falling letters into a complete story.'},
 {title:'The letter in the garden',text:storyText50,speed:94,hazards:.10,intro:'A mysterious letter leads Mira into a silent garden. This story is already written. Follow its fifty words in order: finish the displayed word to move to the next.'},
 {title:'The lantern bridge',text:storyText100,speed:110,hazards:.16,intro:'Mira reaches a bridge made of moonlight. Follow this prewritten hundred-word story. Finish each displayed word to move to the next word in the story.'}
];
for(const chapter of storyStages)if(chapter.text){chapter.tokens=chapter.text.split(/\s+/);chapter.words=chapter.tokens.map(token=>token.replace(/[^A-Za-z]/g,'').toUpperCase());chapter.ending=chapter.text;}
// The new curriculum has its own save; the earlier prototype save is retained.
let storySave={completed:0,checkpoints:[0,0,0]},storyStorageAvailable=true;
try{const saved=JSON.parse(localStorage.getItem(storyKey));if(saved&&Number.isInteger(saved.completed)&&saved.completed>=0&&saved.completed<=storyStages.length){storySave.completed=saved.completed;if(Array.isArray(saved.checkpoints))for(let i=0;i<3;i++){const word=saved.checkpoints[i];if(i<=saved.completed&&Number.isInteger(word)&&word>=0&&word<storyStages[i].words.length)storySave.checkpoints[i]=word;}}}catch(_){storyStorageAvailable=false;}
let storyRun=null,storySelected=0,storyPointer=null,storyLast=0;
const storyCanvas=$('dream-canvas'),storyCtx=storyCanvas.getContext('2d');
function saveStory(){try{localStorage.setItem(storyKey,JSON.stringify(storySave));}catch(_){storyStorageAvailable=false;}}
function renderDreamChapters(){
 for(let i=0;i<storyStages.length;i++){
  $('dream-stage-'+i).disabled=i>storySave.completed;
  $('dream-stage-state-'+i).textContent=i<storySave.completed?'Complete · Play again':i===storySave.completed?(storySave.checkpoints[i]?'Continue · '+storySave.checkpoints[i]+' / '+storyStages[i].words.length+' words':'Ready · '+storyStages[i].words.length+' words'):'Finish the previous chapter to unlock';
 }
 $('dream-save-note').textContent=storyStorageAvailable?'Every completed word is saved on this device.':'Storage is unavailable. Progress lasts until you close the app.';
 $('dream-continue-label').textContent=storyRun&&storyRun.status==='paused'?'Resume your dream':storySave.completed===3?'All chapters complete · Play again':storySave.completed+' / 3 chapters complete';
}
function routeDream(screen){
 if(tutorialActive)return;
 if(dreamScreen==='classic'&&state==='playing')pause();
 if(dreamScreen==='play'&&storyRun&&storyRun.status==='playing')pauseStory();
 dreamScreen=screen;document.documentElement.dataset.dreamScreen=screen;
 const classic=screen==='classic';$('android-classic').hidden=!classic;$('mobile-tabs').hidden=true;$('dream-shell').hidden=classic;
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
 $('dream-intro-number').textContent='CHAPTER 0'+(index+1);$('dream-intro-title').textContent=stage.title;$('dream-intro-copy').textContent=stage.intro;
 $('dream-intro-goal').textContent=(stage.text?'Follow a '+stage.words.length+' word story in order.':'Complete 10 unrelated words.')+(storySave.checkpoints[index]?' Continue from word '+(storySave.checkpoints[index]+1)+'.':'');routeDream('intro');
}
function beginStory(){
 if(tutorialActive||dreamScreen!=='intro')return;
 const stage=storyStages[storySelected];
 storyRun={stage:storySelected,status:'playing',word:storySave.completed>storySelected?0:storySave.checkpoints[storySelected],letter:0,hearts:3,x:180,target:180,items:[],spawn:.35,time:0};
 routeDream('play');$('dream-feedback').textContent='Catch the glowing letter.';unlockAudio();syncAudio();renderStoryHud();storyCanvas.focus({preventScroll:true});
}
function renderStoryHud(){
 if(!storyRun)return;const r=storyRun,stage=storyStages[r.stage],word=stage.words[r.word]||'';
 $('dream-play-stage').textContent='CHAPTER 0'+(r.stage+1)+' · '+stage.title.toUpperCase();$('dream-word-count').textContent=r.word+' / '+stage.words.length+' words';
 $('dream-hearts').textContent='♥ '.repeat(r.hearts).trim();$('dream-hearts').setAttribute('aria-label',r.hearts+' hearts');
 $('dream-progress-fill').style.width=(r.word/stage.words.length*100)+'%';
 $('dream-target').innerHTML=[...word].map((c,i)=>'<span class="'+(i<r.letter?'done':i===r.letter?'current':'')+'">'+c+'</span>').join('');
 $('dream-pause-overlay').hidden=r.status!=='paused';
 $('dream-current-word').textContent=stage.text?(stage.tokens[r.word]||''):word;
 $('dream-current-word').setAttribute('aria-label','Current word: '+(stage.text?(stage.tokens[r.word]||''):word));
}
function pauseStory(){if(storyRun&&storyRun.status==='playing'){storyRun.status='paused';storyPointer=null;renderStoryHud();syncAudio();}}
function resumeStory(){if(tutorialActive||!storyRun||storyRun.status!=='paused')return;routeDream('play');storyRun.status='playing';renderStoryHud();unlockAudio();syncAudio();storyCanvas.focus({preventScroll:true});}
function finishStory(won){
 const r=storyRun;if(!r||r.status!=='playing')return;r.status=won?'won':'lost';r.items=[];
 if(won){storySave.completed=Math.max(storySave.completed,r.stage+1);storySave.checkpoints[r.stage]=0;saveStory();sound('completed');}
 $('dream-result-kicker').textContent=won?'A LITTLE MORE LIGHT':'THE DREAM IS STILL HERE';
 $('dream-result-title').textContent=won?(r.stage===2?'Every word, restored.':'Chapter complete.'):'Rest, then try again.';
 $('dream-result-copy').textContent=won?storyStages[r.stage].ending:'The rain grew too restless this time. Your completed words are safe. Take a breath and continue from the next word with three fresh hearts.';
 $('dream-result-next').textContent=won?(r.stage===2?'Back to the sky →':'Next chapter →'):'Continue chapter →';routeDream('result');
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
  if(r.letter===stage.words[r.word].length){r.word++;r.letter=0;if(r.word<stage.words.length&&r.stage>=storySave.completed){storySave.checkpoints[r.stage]=r.word;saveStory();}r.items=[];r.spawn=.6;sound('completed');$('dream-feedback').textContent='Word complete. Follow the next word.';if(r.word===stage.words.length){finishStory(true);return;}}
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
const dreamOriginalApplyTheme=applyTheme;applyTheme=function(theme){dreamOriginalApplyTheme(theme);$('theme-toggle').disabled=false;$('theme-toggle').textContent=theme==='light'?'☾ Dark':'☀ Light';$('theme-toggle').setAttribute('aria-label',theme==='light'?'Switch to dark mode':'Switch to light mode');};applyTheme(document.documentElement.dataset.theme);
renderDreamChapters();
// The first-launch walkthrough is shown above Home; finishing it reveals Home.
if(tutorialActive){document.documentElement.dataset.dreamScreen='home';$('android-classic').hidden=true;$('mobile-tabs').hidden=true;$('dream-shell').inert=true;}else routeDream('home');
const dreamOriginalCloseTutorial=closeTutorial;closeTutorial=function(){dreamOriginalCloseTutorial();$('dream-shell').inert=false;if(dreamScreen==='home')routeDream('home');};$('tutorial-skip').onclick=closeTutorial;
requestAnimationFrame(storyFrame);
