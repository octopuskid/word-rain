const fs=require('fs'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=String.raw`
const path=require('path');
const web=fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8');
assert(!web.includes('storyStages'));assert(!web.includes('dream-shell'));assert(!web.includes('Dream Sans'),'story and new Android interface never leak into HTML');
assert(html.includes('dream-shell')&&html.includes('data:font/woff;base64,')&&html.includes('data:image/png;base64,'),'APK bundles offline interface assets');
function home(store={}){return session({'word-rain-tutorial-v1':'done',...store},false,scripts,null,true);}
const t=home();assert.equal(t.run('dreamScreen'),'home');assert.equal(t.el('android-classic').hidden,true);assert.equal(t.el('mobile-tabs').hidden,true);
t.run('start()');assert.equal(t.run('state'),'ready','Home never starts invisible classic run');
t.el('dream-story').onclick();assert.equal(t.run('dreamScreen'),'chapters');assert.equal(t.el('dream-stage-1').disabled,true);
t.run('chooseStoryStage(2)');assert.equal(t.run('dreamScreen'),'chapters','locked stage cannot be opened indirectly');
t.el('dream-stage-0').onclick();assert.equal(t.run('dreamScreen'),'intro');t.el('dream-begin').onclick();assert.equal(t.run('storyRun.status'),'playing');assert.equal(t.run('androidAudioPlaying()'),true);t.el('dream-sound').onclick();assert.equal(t.run('audioPrefs.sfx'),false);t.el('dream-sound').onclick();
const original=t.run('JSON.stringify(mobileRecords)');
t.run('storyRun.spawn=99;storyRun.items=[{x:180,y:370,speed:0,letter:"G",hazard:false}];updateStory(0)');assert.equal(t.run('storyRun.letter'),1,'actual update catches needed letter');
t.el('dream-pause').onclick();assert.equal(t.run('storyRun.status'),'paused');assert.equal(t.run('androidAudioPlaying()'),false);const before=t.run('JSON.stringify(storyRun)');t.run('updateStory(1)');assert.equal(t.run('JSON.stringify(storyRun)'),before);
t.el('dream-play-home').onclick();assert.equal(t.run('dreamScreen'),'home');t.el('dream-story').onclick();assert.equal(t.run('storyRun.status'),'playing');assert.equal(t.run('storyRun.letter'),1,'Home resumes same dream');
t.run('window.wordRainPauseAll()');assert.equal(t.run('storyRun.status'),'paused','native lifecycle pauses story even when classic is idle');t.el('dream-resume').onclick();
for(let stage=0;stage<3;stage++){
 let guard=0;while(t.run('storyRun.status')==='playing'&&guard++<30){t.run('catchStoryDrop({letter:storyStages[storyRun.stage].words[storyRun.word][storyRun.letter],hazard:false})');}
 assert(guard<30);assert.equal(t.run('storyRun.status'),'won');assert.equal(t.run('storySave.completed'),stage+1);assert.equal(t.run('dreamScreen'),'result');
 assert.equal(JSON.parse(t.store['word-rain-story-v1']).completed,stage+1);
 assert.equal(t.run('JSON.stringify(mobileRecords)'),original,'story never writes classic records');
 t.el('dream-result-next').onclick();if(stage<2){assert.equal(t.run('dreamScreen'),'intro');t.el('dream-begin').onclick();}else assert.equal(t.run('dreamScreen'),'home');
}
const reload=home(t.store);assert.equal(reload.run('storySave.completed'),3);reload.el('dream-story').onclick();assert.equal(reload.el('dream-stage-2').disabled,false);
reload.run('chooseStoryStage(2);beginStory();catchStoryDrop({hazard:true});catchStoryDrop({hazard:true});catchStoryDrop({hazard:true})');assert.equal(reload.run('storyRun.status'),'lost');assert.equal(reload.run('storySave.completed'),3,'failure preserves completed stages');
reload.el('dream-result-next').onclick();assert.equal(reload.run('dreamScreen'),'intro');reload.el('dream-begin').onclick();assert.equal(reload.run('storyRun.hearts'),3,'retry has fresh hearts');
reload.run('routeDream("home");openDreamClassic();start();score=29;progress=1;pause();routeDream("home");openDreamClassic()');assert.equal(reload.run('state'),'paused');assert.equal(reload.run('score'),29);assert.equal(reload.run('progress'),1,'Classic survives mode navigation');assert.equal(reload.el('game-options').hidden,true,'Classic settings still hidden on pause');
reload.run('routeDream("home")');reload.el('dream-stats').onclick();assert.equal(reload.run('dreamScreen'),'records');assert.equal(reload.el('dream-finished').textContent,'3 / 3');
const corrupt=home({'word-rain-story-v1':'{"completed":99}'});assert.equal(corrupt.run('storySave.completed'),0);const invalid=home({'word-rain-story-v1':'{bad'});assert.equal(invalid.run('storySave.completed'),0);
const fresh=session({},false,scripts,null,true);assert(fresh.run('tutorialActive'));assert.equal(fresh.el('dream-shell').inert,true);fresh.el('tutorial-skip').onclick();assert.equal(fresh.run('dreamScreen'),'home');assert.equal(fresh.el('dream-shell').inert,false);assert.equal(fresh.el('android-classic').hidden,true,'first launch ends at new Home');
const blocked=session({},true,scripts,null,true);blocked.el('tutorial-skip').onclick();blocked.run('chooseStoryStage(0);beginStory();storySave.completed=1;saveStory()');assert.equal(blocked.run('storySave.completed'),1,'blocked saves keep in-memory progress');
t.run('drawStory()');
console.log('PASS dev3: Android-only offline home/font/logo, locked chapters, finite three-stage story, actual catch/loss/retry, pause/home/native lifecycle, save/reload/corrupt storage, classic data isolation/resume and tutorial-to-home routing.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,process);
