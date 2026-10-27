// Compose the web Home/Story shell without Android's records or tutorial code.
const fs=require('fs'),path=require('path');
module.exports=function addStory(source){
 const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const font='data:font/woff;base64,'+fs.readFileSync(path.join(root,'android/assets/story-ui.woff')).toString('base64');
 const logo='data:image/png;base64,'+fs.readFileSync(path.join(root,'android/assets/word-rain-2-logo.png')).toString('base64');
 source=source.replace('<main>','<main id="web-classic" hidden><button id="classic-home" type="button">← Home</button>');
 source=source.replace('</head>','<style id="web-story-style">'+read('src/story.css').replace('__STORY_FONT__',font)+'</style></head>');
 return source.replace('</body>','<div id="web-story-root">'+read('src/story.html').replace('__DREAM_LOGO__',logo)+'</div><div id="web-story-end"></div><script id="web-story-script">'+read('src/story.js')+'</script></body>');
};
