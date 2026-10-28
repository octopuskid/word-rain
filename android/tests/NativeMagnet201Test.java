import io.github.octopuskid.wordrain.*;
import java.util.Random;
public class NativeMagnet201Test {
 static void check(boolean b,String m){if(!b)throw new AssertionError(m);}
 static GameEngine game(){GameEngine g=new GameEngine(new Random(2),new GameEngine.Events());g.startClassic(new GameEngine.Settings());g.words.clear();g.words.add("RAIN");g.words.add("CLOUD");return g;}
 static GameEngine.Drop drop(int k,char c){return new GameEngine.Drop(240,400,100,k,c);}
 static void pulse(GameEngine g){g.catchDrop(new GameEngine.Drop(240,470,100,GameEngine.MAGNET,' '));}
 public static void main(String[] args){
  for(String pair:new String[]{"RR","RA","AR","AA"}){GameEngine g=game();for(char c:pair.toCharArray())g.drops.add(drop(0,c));pulse(g);check(g.progress==2&&g.score==20,"duplicate/order "+pair);g.resolveOverlaps();check(g.drops.size()==2,"resolved pulse cannot merge");for(GameEngine.Drop d:g.drops)g.catchDrop(d);check(g.progress==2&&g.score==20,"no double catches");}
  GameEngine g=game();g.settings.hard=g.settings.overcast=true;g.speed=2;g.shield=2;g.wrongStreak=3;g.scoringPaused=true;g.perfectRun=6;g.doubleScore=g.wildcard=true;g.drops.add(drop(0,'Z'));pulse(g);check(g.score==1&&g.shield==2&&g.progress==0&&g.perfectRun==6&&g.doubleScore&&g.wildcard&&g.scoringPaused&&g.wrongStreak==3&&g.speed==2,"wrong +1 changes nothing else");
  g=game();for(int i=0;i<6;i++)g.drops.add(drop(1,' '));pulse(g);check(g.hearts==2&&g.progress==0,"many hazards cost one HP");for(GameEngine.Drop d:g.drops)g.catchDrop(d);check(g.hearts==2,"hazards cannot charge twice");
  g=game();g.wordPerfect=false;g.progress=1;g.drops.add(drop(1,' '));g.drops.add(drop(3,' '));g.drops.add(drop(3,' '));pulse(g);check(g.wordIndex==1&&g.progress==0&&g.perfectRun==1&&g.wildcard&&g.hearts==2,"wildcard immediately perfects exactly one word despite hazards");
  g=game();g.progress=3;for(int i=0;i<4;i++)g.drops.add(drop(0,'N'));pulse(g);check(g.wordIndex==1&&g.progress==0,"pulse does not spill into next word");
  g=game();GameEngine.Drop below=new GameEngine.Drop(240,485.01,100,0,'R');g.drops.add(below);pulse(g);check(!below.pull&&g.progress==0,"below basket excluded");
  for(boolean hard:new boolean[]{false,true})for(boolean legacy:new boolean[]{false,true}){final int[] at={0};Random rolls=new Random(1){int n;public double nextDouble(){int k=n++%5;return k==0?.5:k==1?0:k==2?(at[0]++%10000)/10000.0:.5;}};g=new GameEngine(rolls,new GameEngine.Events());GameEngine.Settings s=new GameEngine.Settings();s.hard=hard;s.magnet=legacy;g.startClassic(s);int magnets=0,shields=0;for(int i=0;i<10000;i++){g.drops.clear();g.spawnDrop();int k=g.drops.get(0).kind;if(k==4)magnets++;if(k==2)shields++;}check(magnets==100&&shields==100,"each 1%, old settings ignored");check(PlayPresentation.shieldVisible(g),"shield always visible in Classic");}
  System.out.println("PASS 2.0.1 native magnet atomic catches, duplicate/order, exact +1, single HP, instant wildcard, no spill/double catch, floor and both 1% pickups.");
 }
}
