// Lab-only Story controls. The build namespaces the real Story checkpoint key.
const storyLab=document.createElement('aside');storyLab.className='sandbox';storyLab.innerHTML='<h2>Story test controls</h2><p>Sandbox checkpoints only. Production Story progress is isolated.</p><label>Chapter <select id="lab-story-chapter"><option value="0">1 · Ten words</option><option value="1">2 · Fifty words</option><option value="2">3 · Hundred words</option></select></label><button id="lab-story-open">Start chapter</button><button id="lab-story-letter">Catch correct letter</button><button id="lab-story-word">Complete word</button><button id="lab-story-wrong">Catch wrong letter</button>';
$('dream-play').appendChild(storyLab);
function labStoryStart(){pauseStory();storySave.completed=3;chooseStoryStage(Number($('lab-story-chapter').value));beginStory();}
$('lab-story-open').onclick=labStoryStart;
$('lab-story-letter').onclick=()=>{if(storyRun&&storyRun.status==='playing')catchStoryDrop({letter:storyStages[storyRun.stage].words[storyRun.word][storyRun.letter],hazard:false});};
$('lab-story-word').onclick=()=>{if(!storyRun)return;const word=storyRun.word;while(storyRun.status==='playing'&&storyRun.word===word)$('lab-story-letter').onclick();};
$('lab-story-wrong').onclick=()=>catchStoryDrop({hazard:true});
$('lab-story-home').onclick=()=>{storySave.completed=3;routeDream('chapters');};
openDreamClassic();
