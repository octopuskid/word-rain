'use strict';
let tutorialActive=false;
$('custom-music-controls').hidden=false;
// Android-only local records. No server, account, or database is involved.
const mobileRecordKey='word-rain-mobile-records-v1';
let mobileStorageAvailable=true;
function validScore(value){return Number.isFinite(value)&&value>=0&&(Number.isSafeInteger(value)||Number.isSafeInteger(value*2))?value:0;}
function validCount(value){return Number.isSafeInteger(value)&&value>=0?value:0;}
function loadMobileRecords(){
 let raw=null;try{raw=localStorage.getItem(mobileRecordKey);}catch(_){mobileStorageAvailable=false;}
 let data;try{data=JSON.parse(raw);}catch(_){}
 const records={highScore:0,words:Object.create(null)};
 if(!data||typeof data!=='object')return records;
 records.highScore=validScore(data.highScore);
 const saved=data.words;
 if(saved&&typeof saved==='object')for(const word of new Set([...allWords,'RICK'])){
  const entry=Object.prototype.hasOwnProperty.call(saved,word)?saved[word]:null;
  if(entry&&typeof entry==='object'){
   const met=validCount(entry.met);records.words[word]={met,perfect:Math.min(met,validCount(entry.perfect))};
  }
 }
 return records;
}
const mobileRecords=loadMobileRecords();
let mobileNextWordPending=false;
function saveMobileRecords(){
 try{localStorage.setItem(mobileRecordKey,JSON.stringify(mobileRecords));}
 catch(_){mobileStorageAvailable=false;}
 $('mobile-storage-warning').hidden=mobileStorageAvailable;
}
function recordWordMet(){
 const word=words[wordIndex];
 if(!mobileRecords.words[word])mobileRecords.words[word]={met:0,perfect:0};
 mobileRecords.words[word].met++;saveMobileRecords();
}
function renderMobileRecords(){
 $('high-score').textContent=mobileRecords.highScore;
 let totalMet=0,totalPerfect=0;
 const entries=Object.keys(mobileRecords.words).filter(word=>mobileRecords.words[word].met>0).sort();
 $('word-stats-body').innerHTML=entries.length?entries.map(word=>{
  const entry=mobileRecords.words[word];totalMet+=entry.met;totalPerfect+=entry.perfect;
  // Word names are restricted to the game's own word pool; counts are validated integers.
  return '<tr><td>'+word+'</td><td>'+entry.met+'</td><td>'+entry.perfect+'</td></tr>';
 }).join(''):'<tr><td colspan="3">Play a game to meet your first word.</td></tr>';
 $('word-stats-summary').textContent=entries.length+' different words · '+totalMet+' encounters · '+totalPerfect+' perfect completions';
 $('mobile-storage-warning').hidden=mobileStorageAvailable;
}
const originalMobileHud=hud;
hud=function(){
 originalMobileHud();
 if(mobileNextWordPending&&!rickChallenge&&state==='playing'){mobileNextWordPending=false;recordWordMet();}
 if(score>mobileRecords.highScore){mobileRecords.highScore=score;saveMobileRecords();}
 renderMobileRecords();
};
const originalMobileStart=start;
start=function(){
 if(tutorialActive||(typeof dreamScreen!=='undefined'&&dreamScreen!=='classic')||!$('mobile-stats-panel').hidden)return;
 const resuming=state==='paused';if(!resuming)mobileNextWordPending=false;originalMobileStart();
 if(!resuming){recordWordMet();renderMobileRecords();}
};
const originalMobileFinishWord=finishWord;
finishWord=function(){
 const word=words[wordIndex];
 if(wordPerfect){
  if(!mobileRecords.words[word])mobileRecords.words[word]={met:1,perfect:0};
  mobileRecords.words[word].perfect++;
 }
 const healed=originalMobileFinishWord();
 mobileNextWordPending=true;saveMobileRecords();return healed;
};
const originalMobilePause=pause;
pause=function(){
 if(tutorialActive||(typeof dreamScreen!=='undefined'&&dreamScreen!=='classic')||!$('mobile-stats-panel').hidden)return;
 originalMobilePause();
};
function selectMobileTab(tab){
 if(tutorialActive)return;
 const stats=tab==='stats';
 if(stats&&state==='playing')pause();
 keys.clear();
 $('mobile-game-panel').hidden=stats;$('mobile-stats-panel').hidden=!stats;
 for(const id of ['pause','give-up','bgm-toggle','sfx-toggle'])$(id).hidden=stats;
 for(const name of ['game','stats']){
  const selected=(name==='stats')===stats;const button=$('mobile-'+name+'-tab');
  button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
 }
 $('reset-stats-confirm').hidden=true;
 if(stats)renderMobileRecords();else syncPlayUI();
}
$('mobile-game-tab').onclick=()=>selectMobileTab('game');
$('mobile-stats-tab').onclick=()=>selectMobileTab('stats');
$('mobile-tabs').addEventListener('keydown',event=>{
 if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
 event.preventDefault();const next=$('mobile-game-panel').hidden?'game':'stats';
 selectMobileTab(next);$('mobile-'+next+'-tab').focus();
});
// The original button received a function reference before this extension loaded.
$('start').onclick=start;
$('pause').onclick=pause;
renderMobileRecords();

$('reset-stats').onclick=()=>{
 $('reset-stats-status').textContent='';
 $('reset-stats-confirm').hidden=false;
 $('cancel-reset-stats').focus();
};
$('cancel-reset-stats').onclick=()=>{
 $('reset-stats-confirm').hidden=true;$('reset-stats').focus();
};
$('confirm-reset-stats').onclick=()=>{
 if($('reset-stats-confirm').hidden||$('mobile-stats-panel').hidden)return;
 mobileRecords.words=Object.create(null);
 saveMobileRecords();renderMobileRecords();
 $('reset-stats-confirm').hidden=true;
 $('reset-stats-status').textContent='Word stats reset. Your personal best is kept.';
 $('reset-stats').focus();
};

// First-launch Android walkthrough. It never starts a scoring run.
const tutorialKey='word-rain-tutorial-v1';
const tutorialPages=[
 {title:'Move your basket',copy:'Drag your finger left or right across the play area. Your basket follows your finger. Catch falling blocks with the basket.',example:'<span class="tutorial-basket">↔ ▰ ↔</span>'},
 {title:'Catch letters in order',copy:'Spell the target word one highlighted letter at a time. For RAIN, catch R first, then A, I and N. A letter you need later still counts as wrong if you catch it too early.',example:'<span class="tutorial-word"><u>R</u> A I N</span>'},
 {title:'Protect your hearts',copy:'You start with three hearts. Catching × without a shield costs one heart. Dodge unwanted letters too: three wrong letters in a row pause scoring until your next correct catch. Missing a block is harmless.',example:'<span class="tutorial-tile danger">×</span><span>♥ ♥ ♥</span>'},
 {title:'Shields need care',copy:'A blue shield protects you from ×. Wrong letters use half a shield. Picking up another shield while you already have one costs hearts, so avoid duplicates.',example:'<span class="tutorial-tile shield">🛡</span>'},
 {title:'Wildcards fill a blank',copy:'A purple wildcard fills the next missing letter. Completing a perfect word unlocks random wildcard drops. Six perfect words in a row unlock double base points and restore a heart.',example:'<span class="tutorial-tile wild">✦</span>'},
 {title:'Choose your forecast',copy:'Start with Normal. Overcast hides the middle of the board. The pickup switch selects 1% magnets when on or 1% shields when off. Magnets pull nearby blocks, including hazards; blocks past the basket bottom cannot be pulled back. Choose settings before each run—they stay hidden during play and pause, then return at game over.',example:'<span class="tutorial-word">☂ READY?</span>'}
];
let tutorialPage=0;
function renderTutorial(){
 const page=tutorialPages[tutorialPage];
 $('tutorial-step').textContent=(tutorialPage+1)+' / '+tutorialPages.length;
 $('tutorial-title').textContent=page.title;$('tutorial-copy').textContent=page.copy;
 $('tutorial-example').innerHTML=page.example;
 $('tutorial-back').disabled=tutorialPage===0;
 $('tutorial-next').textContent=tutorialPage===tutorialPages.length-1?'Choose settings →':'Next →';
}
function openTutorial(){
 if(state!=='ready'&&state!=='over')return;
 tutorialActive=true;tutorialPage=0;renderTutorial();$('tutorial').hidden=false;
 for(const id of ['mobile-game-panel','mobile-stats-panel','mobile-tabs'])$(id).inert=true;
 document.querySelector('header').inert=true;$('tutorial-next').focus();
}
function closeTutorial(){
 if(!tutorialActive)return;
 try{localStorage.setItem(tutorialKey,'done');}catch(_){}
 tutorialActive=false;$('tutorial').hidden=true;
 for(const id of ['mobile-game-panel','mobile-stats-panel','mobile-tabs'])$(id).inert=false;
 document.querySelector('header').inert=false;syncPlayUI();$('difficulty').focus();
}
$('tutorial-back').onclick=()=>{if(tutorialPage>0){tutorialPage--;renderTutorial();}};
$('tutorial-next').onclick=()=>{if(tutorialPage<tutorialPages.length-1){tutorialPage++;renderTutorial();}else closeTutorial();};
$('tutorial-skip').onclick=closeTutorial;
$('replay-tutorial').onclick=openTutorial;
$('tutorial').addEventListener('keydown',event=>{
 if(event.key==='Escape'){event.preventDefault();closeTutorial();}
 if(event.key==='Tab'){
  const first=tutorialPage===0?'tutorial-next':'tutorial-back',last='tutorial-skip';
  if(event.shiftKey&&event.target.id===first){event.preventDefault();$(last).focus();}
  else if(!event.shiftKey&&event.target.id===last){event.preventDefault();$(first).focus();}
 }
});
let tutorialSeen=false;try{tutorialSeen=localStorage.getItem(tutorialKey)==='done';}catch(_){}
if(!tutorialSeen)openTutorial();
