const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert'),os=require('os');
const root=path.resolve(__dirname,'../..'),ecj=process.argv[2];if(!ecj)throw Error('Pass ECJ jar path');const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wr-parity-'));
try{
 const reference=path.join(temp,'reference.html');cp.execFileSync('python',['-c','import sys;sys.path.insert(0,"android");from mobile import mobile_html;from pathlib import Path;Path(sys.argv[1]).write_text(mobile_html(Path("index.html").read_text()))',reference],{cwd:root});
 const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
 const make=new Function('require','__dirname','process',helper+'\nreturn session;')(require,__dirname,{argv:['node','test',reference]});
 const classes=path.join(temp,'classes');cp.execFileSync('java',['-jar',path.resolve(ecj),'-17','-d',classes,path.join(root,'android/src/io/github/octopuskid/wordrain/GameData.java'),path.join(root,'android/src/io/github/octopuskid/wordrain/GameEngine.java'),path.join(__dirname,'NativeTrace.java')],{stdio:'inherit'});
 const runs=['C,W,W,W,C,F,F','S,W,C,W,B','S,B','S,S','S,W,S','H,F,F,F,F,F,F,C,W','C,P,C,R,C,F','W,O,F,L,C','F,B,C,W,F'];let count=0;
 for(const hard of [false,true])for(const over of [false,true])for(const commands of runs){const t=make();t.el('difficulty').value=hard?'hard':'normal';t.el('overcast-mode').checked=over;t.el('overcast-mode').onchange();t.run('start();words.splice(0,words.length,"AAAA","BBBB");wordIndex=progress=0;rickInput=""');const expected=[];
  for(const op of commands.split(',')){
   if(op==='P')t.run('pause()');else if(op==='R')t.run('start()');else if(op==='H')t.run('lives=2');
   else if(op==='O'||op==='L')t.run('items=[{x:240,y:200,speed:100,wild:true},{x:240,y:200,speed:100,'+(op==='O'?'wild':'bomb')+':true}];resolveBlockOverlaps();items=[];hud()');
   else{const n=op==='F'?t.run('words[wordIndex].length-progress'):1;for(let i=0;i<n;i++)if(t.run('state')==='playing')t.run('spawn=99;items=[{x:240,y:460,speed:0,bomb:'+(op==='B')+',shield:'+(op==='S')+',wild:'+(op==='V')+',letter:'+(op==='W'?'"Z"':'words[wordIndex][progress]')+'}];x=target=240;update(0)');}
   expected.push(JSON.parse(t.run('JSON.stringify([score,lives,shieldHealth,progress,wrongStreak,scoringPaused,Math.round(speedMultiplier*100),perfectWords,perfectRun,wordPerfect,wildcardUnlocked,doubleScore,state])')));
  }
  const actual=cp.execFileSync('java',['-cp',classes,'NativeTrace',hard?'hard':'normal',String(over),commands],{encoding:'utf8'}).trim().split('\n').map(JSON.parse);assert.deepStrictEqual(actual,expected,'native/HTML parity: '+[hard,over,commands]);count+=actual.length;
 }
 console.log('PASS native/HTML parity: '+count+' matching state transitions across difficulty/Overcast, scoring/recovery, shields, bonuses, speed, pause and overlap rewards.');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
