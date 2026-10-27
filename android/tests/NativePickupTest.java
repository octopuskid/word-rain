import io.github.octopuskid.wordrain.*;
import java.util.Random;
public class NativePickupTest {
 static void check(boolean good,String message){if(!good)throw new AssertionError(message);}
 static class Rolls extends Random {private static final long serialVersionUID=1L;int at;boolean pickup,bomb,wild;void reset(boolean p,boolean b,boolean w){at=0;pickup=p;bomb=b;wild=w;}@Override public double nextDouble(){int n=at++;return n==0?(bomb?.1:.5):n==1?0:n==2?(pickup?.009:.5):n==3&&wild?0:.5;}}
 public static void main(String[] args){
  for(boolean hard:new boolean[]{false,true})for(boolean magnet:new boolean[]{false,true}){
   Rolls r=new Rolls();GameEngine g=new GameEngine(r,new GameEngine.Events());GameEngine.Settings s=new GameEngine.Settings();s.hard=hard;s.magnet=magnet;g.startClassic(s);int magnets=0,shields=0;
   for(int i=0;i<1000;i++){r.reset(i%100==0,false,false);g.drops.clear();g.spawnDrop();check(g.drops.size()==1,"accepted emission");int kind=g.drops.get(0).kind;if(kind==GameEngine.MAGNET)magnets++;if(kind==GameEngine.SHIELD)shields++;}
   check(magnets==(magnet?10:0)&&shields==(magnet?0:10),"mutually exclusive 1% of emissions, both difficulties");
   check(PlayPresentation.shieldVisible(g)==!magnet,"shield bar follows pickup mode");
   r.reset(false,true,false);g.drops.clear();g.spawnDrop();check(g.drops.get(0).kind==GameEngine.BOMB,"hazards still generate");
   r.reset(false,false,true);g.wildcard=true;g.drops.clear();g.spawnDrop();check(g.drops.get(0).kind==GameEngine.WILD,"wildcards remain in both modes");
   r.reset(true,true,false);g.drops.clear();g.spawnDrop();check(g.drops.get(0).kind==(magnet?GameEngine.MAGNET:GameEngine.SHIELD),"pickup probability includes emitted hazard candidates");
  }
  GameEngine g=new GameEngine(new Random(2),new GameEngine.Events());g.startClassic(new GameEngine.Settings());GameEngine.Drop past=new GameEngine.Drop(400,486,100,0,'Z');past.pull=true;g.drops.add(past);g.spawn=99;g.update(.01);check(past.missed&&!past.pull&&past.x==400&&past.y>486,"past-bottom block releases pull and keeps falling");past.y=480;g.catchDrop(new GameEngine.Drop(350,480,100,4,' '));check(!past.pull,"missed block cannot be selected again even if repositioned");g.drops.add(new GameEngine.Drop(400,480,100,0,'Q'));g.resolveOverlaps();check(g.drops.size()==1&&g.drops.get(0).missed&&!g.drops.get(0).pull,"overlap merge inherits missed status");g.catchDrop(new GameEngine.Drop(350,480,100,4,' '));check(!g.drops.get(0).pull,"merged missed block cannot be recovered");
  GameEngine.Drop edge=new GameEngine.Drop(400,485,100,0,'Z'),below=new GameEngine.Drop(400,485.01,100,0,'Z');g.drops.clear();g.drops.add(edge);g.drops.add(below);g.catchDrop(new GameEngine.Drop(350,480,100,4,' '));check(edge.pull&&!below.pull,"center at basket bottom eligible, below excluded");
  g.words.clear();g.words.add("BERRY");g.words.add("CLOUD");g.progress=2;check(PlayPresentation.word(g).equals("BERRY")&&PlayPresentation.progress(g)==2,"upper and background target share word/progress");g.catchDrop(new GameEngine.Drop(240,470,100,0,'R'));check(PlayPresentation.progress(g)==3,"correct catch updates both targets");g.catchDrop(new GameEngine.Drop(240,470,100,1,' '));check(PlayPresentation.progress(g)==0,"bomb reset updates both targets");g.rickNext=4;check(PlayPresentation.word(g).equals(GameEngine.RICK)&&PlayPresentation.progress(g)==4,"Rick target synchronized");g.rickNext=-1;
  g.wildcard=true;g.doubleScore=true;check(PlayPresentation.purpleHearts(g)&&PlayPresentation.yellowScore(g),"purple hearts and yellow score are independent flags");g.wildcard=false;check(!PlayPresentation.purpleHearts(g)&&PlayPresentation.yellowScore(g),"score bonus does not color hearts");g.doubleScore=false;check(!PlayPresentation.yellowScore(g),"normal score restores color");g.startStory(1,0);g.wildcard=g.doubleScore=true;check(!PlayPresentation.purpleHearts(g)&&!PlayPresentation.yellowScore(g)&&!PlayPresentation.shieldVisible(g),"Classic HUD flags do not leak into Story");
  System.out.println("PASS dev11 native: exclusive 1% pickups in both difficulties, hazards/wildcards, shield meter mode, irreversible basket-bottom exclusion and synchronized presentation flags.");
 }
}
