const fs=require('fs'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=String.raw`
function home(store={}){return session({'word-rain-tutorial-v1':'done',...store},false,scripts,null,true);}
const t=home();assert.equal(t.run('storyStages[0].words.length'),10);assert.equal(t.run('new Set(storyStages[0].words).size'),10);assert.equal(t.run('storyStages[0].text'),'','chapter one has no connecting story');
for(const [i,count] of [[1,50],[2,100]]){
 assert.equal(t.run('storyStages['+i+'].text.trim().split(/\\s+/).length'),count);
 assert.equal(t.run('storyStages['+i+'].tokens.length'),count);assert.equal(t.run('storyStages['+i+'].words.length'),count);
 assert(t.run('storyStages['+i+'].words.every(w=>/^[A-Z]+$/.test(w))'),'punctuation is not playable');
 assert.equal(t.run('storyStages['+i+'].tokens.join(" ")'),t.run('storyStages['+i+'].text'),'story order and punctuation retained');
}
function finishWord(t){const before=t.run('storyRun.word');assert.equal(t.el('dream-current-word').textContent,t.run('storyStages[storyRun.stage].text?storyStages[storyRun.stage].tokens[storyRun.word]:storyStages[storyRun.stage].words[storyRun.word]'),'every word is shown in full before completion');let guard=0;while(t.run('storyRun.status')==='playing'&&t.run('storyRun.word')===before&&guard++<30)t.run('catchStoryDrop({letter:storyStages[storyRun.stage].words[storyRun.word][storyRun.letter],hazard:false})');assert(guard<30);}
t.run('chooseStoryStage(0);beginStory()');finishWord(t);assert.equal(t.run('storyRun.word'),1);assert.equal(JSON.parse(t.store['word-rain-story-v2']).checkpoints[0],1);assert.equal(t.el('dream-current-word').textContent,'BICYCLE');
const restored=home(t.store);restored.run('chooseStoryStage(0);beginStory()');assert.equal(restored.run('storyRun.word'),1,'relaunch resumes at next uncompleted word');assert.equal(restored.run('storyRun.letter'),0);assert.equal(restored.run('storyRun.hearts'),3);
restored.run('catchStoryDrop({hazard:true});catchStoryDrop({hazard:true});catchStoryDrop({hazard:true})');assert.equal(restored.run('storyRun.status'),'lost');restored.el('dream-result-next').onclick();restored.el('dream-begin').onclick();assert.equal(restored.run('storyRun.word'),1,'retry retains completed words');
while(restored.run('storyRun.status')==='playing')finishWord(restored);assert.equal(restored.run('storySave.completed'),1);assert.equal(restored.run('storyRun.word'),10,'chapter one requires exactly ten words');
restored.el('dream-result-next').onclick();restored.el('dream-begin').onclick();assert.equal(restored.run('storyRun.stage'),1);assert.equal(restored.el('dream-current-word').textContent,'At');
const initial=restored.el('dream-current-word').textContent;restored.run('catchStoryDrop({letter:"Z",hazard:false})');assert.equal(restored.el('dream-current-word').textContent,initial,'wrong letter does not advance word');restored.run('catchStoryDrop({letter:"A",hazard:false})');assert.equal(restored.el('dream-current-word').textContent,initial,'partial word keeps full current prompt visible');finishWord(restored);assert.equal(restored.el('dream-current-word').textContent,'dusk,');finishWord(restored);assert.equal(restored.el('dream-current-word').textContent,'Mira','next prewritten word displayed immediately');
for(const total of [50,100]){
 while(restored.run('storyRun.status')==='playing')finishWord(restored);
 assert.equal(restored.run('storyRun.word'),total);assert.equal(restored.run('storyRun.status'),'won');assert.equal(restored.el('dream-result-copy').textContent,restored.run('storyStages[storyRun.stage].text'),'completed chapter reveals whole story');
 if(total===50){restored.el('dream-result-next').onclick();restored.el('dream-begin').onclick();}
}
assert.equal(restored.run('Object.keys(mobileRecords.words).length'),0,'all 160 words leave Classic records alone');
const legacy=home({'word-rain-story-v1':'{"completed":3}'});assert.equal(legacy.run('storySave.completed'),0,'new curriculum does not count old prototype stages as completed');assert.equal(legacy.store['word-rain-story-v1'],'{"completed":3}','old save retained');
const corrupt=home({'word-rain-story-v2':'{"completed":1,"checkpoints":[-1,999,5]}'});assert.equal(corrupt.run('storySave.checkpoints.join()'),'0,0,0','invalid and locked checkpoints rejected');
console.log('PASS dev6: exact 10/50/100 words, non-narrative chapter one, prewritten word prompts before completion and sequential advancement, full completion, durable word checkpoints/retries, legacy save retention and Classic isolation.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,process);
