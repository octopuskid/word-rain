import io.github.octopuskid.wordrain.*;
import java.util.*;
public class NativeEngineTest {
 static int assertions;static void check(boolean ok,String why){assertions++;if(!ok)throw new AssertionError(why);}
 static class Events extends GameEngine.Events {int met,perfect,high,completed,checkpoints;boolean rick;public void met(String w){met++;}public void perfect(String w){perfect++;}public void score(int n){high=Math.max(high,n);}public void complete(int c){completed++;}public void checkpoint(int c,int n){checkpoints++;}public void unlockRick(){rick=true;}}
 static GameEngine engine(boolean hard,boolean overcast){GameEngine g=new GameEngine(new Random(123),new Events());GameEngine.Settings s=new GameEngine.Settings();s.hard=hard;s.overcast=overcast;g.startClassic(s);return g;}
 static void catchLetter(GameEngine g,char c){g.catchDrop(new GameEngine.Drop(240,470,100,GameEngine.LETTER,c));}
 static void correct(GameEngine g){catchLetter(g,g.needed());}
 static void finish(GameEngine g){int before=((Events)g.events).met;for(int n=0;n<20&&((Events)g.events).met==before;n++)correct(g);check(((Events)g.events).met==before+1,"word advances");}
 static GameEngine.Drop drop(int kind,double x,double y){return new GameEngine.Drop(x,y,100,kind,'Z');}
 public static void main(String[] args){
  for(boolean hard:new boolean[]{false,true})for(boolean over:new boolean[]{false,true}){
   GameEngine g=engine(hard,over);int factor=hard?2:1;factor*=over?2:1;int points=(int)Math.ceil(10*factor*g.speed);correct(g);check(g.score==points,"score factor");g.pause();int before=g.progress;correct(g);check(g.progress==before,"paused catches ignored");double y=g.x;g.update(1);check(g.x==y,"paused physics frozen");g.resume();
  }
  GameEngine g=engine(false,false);g.words.clear();g.words.add("ABCDE");g.words.add("FGHIJ");correct(g);catchLetter(g,'Z');check(g.progress==1&&g.score==11&&!g.wordPerfect,"normal wrong keeps progress and scores");catchLetter(g,'Z');catchLetter(g,'Z');check(g.progress==0&&g.scoringPaused&&g.score==12,"third wrong resets and no score");correct(g);check(g.progress==1&&!g.scoringPaused&&g.score==12,"recovery earns no letter points");
  g=engine(true,false);correct(g);catchLetter(g,'Z');check(g.progress==0,"hard wrong resets");
  for(boolean hard:new boolean[]{false,true})for(int shield=0;shield<=2;shield++){
   g=engine(hard,false);g.shield=shield;g.progress=1;g.catchDrop(drop(GameEngine.BOMB,240,470));check(g.hearts==(shield==2?3:2)&&g.shield==0,"bomb hearts/shield");check(g.wordPerfect==(shield==1),"bomb perfection");check(g.progress==(shield==0?0:1),"bomb progress");
   g=engine(hard,false);g.shield=shield;g.catchDrop(drop(GameEngine.SHIELD,240,470));check(g.hearts==3-shield,"shield overload");check(g.shield==(shield==0?2:hard&&shield==2?1:0),"overload remainder");check(g.wordPerfect,"shield preserves perfection");
   g=engine(hard,false);g.shield=shield;g.progress=1;char wrong=g.needed()=='Z'?'Y':'Z';catchLetter(g,wrong);check(g.shield==Math.max(0,shield-1),"wrong consumes half shield");check(g.wordPerfect==(shield>0),"protected wrong perfection");
  }
  g=engine(false,false);g.hearts=2;for(int n=0;n<6;n++)finish(g);check(g.doubleScore&&g.hearts==3&&g.wildcard&&Math.abs(g.speed-1.6)<.00001,"six perfect bonus regen speed");int score=g.score;correct(g);check(g.score-score==32,"double correct starts after sixth word");g.shield=1;catchLetter(g,g.needed()=='Z'?'Y':'Z');check(g.doubleScore,"shielded wrong retains double");catchLetter(g,g.needed()=='Z'?'Y':'Z');check(!g.doubleScore&&!g.wildcard,"unprotected wrong clears bonuses");
  for(int a=0;a<5;a++)for(int b=0;b<5;b++){g=engine(false,false);g.words.clear();g.words.add("AB");g.words.add("CD");g.drops.add(drop(a,200,200));g.drops.add(drop(b,200,200));g.resolveOverlaps();check(g.drops.size()<=1,"all overlap pairs terminate");if(a==4||b==4)check(g.drops.size()==((a==2||b==2||(a==4&&b==4))?0:1),"magnet contact rules");}
  g=engine(false,false);GameEngine.Drop exact=drop(0,366,485),below=drop(0,240,485.1),far=drop(0,367,485);g.drops.add(exact);g.drops.add(below);g.drops.add(far);g.catchDrop(drop(4,240,485));check(exact.pull&&!below.pull&&!far.pull,"magnet radius and below-basket exclusion");GameEngine.Drop later=drop(0,250,460);g.drops.add(later);check(!later.pull,"magnet has no persistent aura");
  g=engine(false,false);g.drops.add(drop(3,100,100));g.drops.add(drop(3,100,100));g.wordPerfect=false;g.resolveOverlaps();check(((Events)g.events).perfect==1,"two wildcards restore perfect whole word");
  for(int chapter=0;chapter<3;chapter++){g=engine(false,false);Events e=(Events)g.events;int met=e.met;g.startStory(chapter,0);check(g.words.size()==new int[]{10,50,100}[chapter],"chapter word count");while(g.state==GameEngine.PLAYING){int previous=g.wordIndex;String word=g.word();for(char c:word.toCharArray())catchLetter(g,c);check(g.wordIndex==previous+1,"story follows prewritten order");}check(g.state==GameEngine.WON&&e.completed==1&&e.met==met&&e.high==0,"story completion isolated from Classic");check(e.checkpoints==g.words.size()-1,"checkpoint each finished word");g.startStory(chapter,3);check(g.wordIndex==3&&g.progress==0&&g.hearts==3,"story checkpoint resumes with fresh hearts");for(int i=0;i<3;i++)g.catchDrop(drop(1,240,470));check(g.state==GameEngine.OVER,"story loss");}
  g=engine(false,false);g.rickNext=0;g.spawn=0;int oldScore=g.score;for(int i=0;i<2000&&g.rickNext>=0;i++){g.update(.04);if(!g.drops.isEmpty()){g.x=g.target=g.drops.get(0).x;}}check(((Events)g.events).rick&&g.score==oldScore,"Rick sequence native timing and no points");
  for(String[] set:GameData.WORDS)check(set.length==120,"all word sets retained");
  System.out.println("PASS native engine: "+assertions+" assertions for scoring, shield matrix, combos, recovery, pause, every overlap pair, magnet boundaries, all 160 story words, checkpoints and Rick.");
 }
}
