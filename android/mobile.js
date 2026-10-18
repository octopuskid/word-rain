'use strict';
// Android-only local records. No server, account, or database is involved.
const mobileRecordKey='word-rain-mobile-records-v1';
let mobileStorageAvailable=true;
function validCount(value){return Number.isSafeInteger(value)&&value>=0?value:0;}
function loadMobileRecords(){
 let raw=null;try{raw=localStorage.getItem(mobileRecordKey);}catch(_){mobileStorageAvailable=false;}
 let data;try{data=JSON.parse(raw);}catch(_){}
 const records={highScore:0,words:Object.create(null)};
 if(!data||typeof data!=='object')return records;
 records.highScore=validCount(data.highScore);
 const saved=data.words;
 if(saved&&typeof saved==='object')for(const word of words){
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
 if(mobileNextWordPending){mobileNextWordPending=false;recordWordMet();}
 if(score>mobileRecords.highScore){mobileRecords.highScore=score;saveMobileRecords();}
 renderMobileRecords();
};
const originalMobileStart=start;
start=function(){
 if(!$('mobile-stats-panel').hidden)return;
 const resuming=state==='paused';originalMobileStart();
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
 if(!$('mobile-stats-panel').hidden)return;
 originalMobilePause();
};
function selectMobileTab(tab){
 const stats=tab==='stats';
 if(stats&&state==='playing')pause();
 keys.clear();
 $('mobile-game-panel').hidden=stats;$('mobile-stats-panel').hidden=!stats;
 $('pause').hidden=stats;
 for(const name of ['game','stats']){
  const selected=(name==='stats')===stats;const button=$('mobile-'+name+'-tab');
  button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
 }
 if(stats)renderMobileRecords();
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
