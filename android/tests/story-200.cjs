const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'../..');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const source=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>!s.includes("location.hostname"));
const make=new Function('require','__dirname','process',helper+'\nreturn session;')(require,__dirname,{argv:['node','test',path.join(root,'index.html')]});
const test=store=>make(store||{},false,source);
function finish(t){const word=t.run('storyRun.word');for(let i=0;i<30&&t.run('storyRun.status')==='playing'&&t.run('storyRun.word')===word;i++)t.run('catchStoryDrop({letter:storyStages[storyRun.stage].words[storyRun.word][storyRun.letter],hazard:false})');assert(t.run('storyRun.word')>word);}
const t=test();t.run('chooseStoryStage(0);beginStory()');assert(t.el('dream-completed-panel').hidden);assert.equal(t.run('storyRun.spawn'),.4);
for(const [chapter,total]of [[0,10],[1,50],[2,100]]){
 if(chapter){t.run('chooseStoryStage('+chapter+');beginStory()');assert(!t.el('dream-completed-panel').hidden);assert.equal(t.el('dream-completed-words').textContent,'Your completed words will appear here.');}
 assert.equal(t.run('storyStages[storyRun.stage].words.length'),total);
 if(chapter){t.run('catchStoryDrop({hazard:true})');assert.equal(t.run('storyRun.hearts'),2);assert.equal(t.run('storyRun.word'),0);assert.equal(t.el('dream-completed-words').textContent,'Your completed words will appear here.');}
 finish(t);
 if(chapter){assert.equal(t.el('dream-completed-words').textContent,t.run('storyStages[storyRun.stage].tokens[0]'));const saved=test({...t.store});saved.run('chooseStoryStage('+chapter+');beginStory()');assert.equal(saved.run('storyRun.word'),1);assert.equal(saved.el('dream-completed-words').textContent,saved.run('storyStages[storyRun.stage].tokens[0]'));}
 t.run('pauseStory()');const previous=t.run('JSON.stringify(storyRun)');t.run('updateStory(.04)');assert.equal(t.run('JSON.stringify(storyRun)'),previous);t.run('resumeStory()');
 while(t.run('storyRun.status')==='playing')finish(t);
 assert.equal(t.run('storyRun.status'),'won');assert.equal(t.run('storySave.completed'),chapter+1);
 if(chapter)assert.equal(t.el('dream-completed-words').textContent,t.run('storyStages[storyRun.stage].text'));
 assert.equal(t.run('score'),0,'Story leaves Classic score untouched');
}
const blocked=make({},true,source);blocked.run('chooseStoryStage(0);beginStory()');finish(blocked);assert.equal(blocked.run('storyRun.word'),1);
const lab=fs.readFileSync(path.join(root,'test.html'),'utf8');assert(lab.includes('word-rain-lab-story-v2'));assert(!lab.includes("const storyKey=\"word-rain-story-v2\""));assert(lab.includes('lab-story-script'));
assert(!html.includes('dream-stats')&&!html.includes('dream-records')&&!html.includes('word-stats-body'),'web has no player Stats UI');
console.log('PASS 2.0 web Story: all 160 words, ordered completed prose, punctuation, checkpoint reloads, pause/resume, wrong catch, blocked storage, Classic isolation, no Stats UI and isolated Story lab saves.');
