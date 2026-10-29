package io.github.octopuskid.wordrain;
import java.util.Random;
public class NativeSandbox204Test {
 static void check(boolean value,String message){if(!value)throw new AssertionError(message);}
 public static void main(String[] args){
  GameEngine.Settings saved=new GameEngine.Settings();saved.wordSet=2;saved.handwriting=true;
  GameEngine real=new GameEngine(new Random(1),new GameEngine.Events());real.startClassic(saved);real.pause();real.progress=1;real.score=123;
  NativeSandbox lab=new NativeSandbox(saved,new Random(7),new GameEngine.Events());GameEngine g=lab.engine;
  check(g.settings!=saved&&g!=real,"sandbox owns settings and engine");
  g.score=99;g.progress=1;g.hearts=1;g.drops.add(new GameEngine.Drop(240,100,100,GameEngine.BOMB,' '));g.pause();
  lab.setOvercast(true);
  check(g.settings.overcast&&g.points(10)==20,"overcast changes scoring");
  check(g.score==99&&g.progress==1&&g.hearts==1&&g.drops.size()==1&&g.state==GameEngine.PAUSED,"overcast preserves current paused test run");
  lab.setDifficulty(true);
  check(g.settings.hard&&g.settings.overcast&&g.settings.handwriting&&g.settings.wordSet==2,"difficulty preserves sandbox appearance and set");
  check(g.state==GameEngine.PAUSED&&g.manualSpawns&&g.score==0&&g.progress==0&&g.hearts==3&&g.drops.isEmpty(),"difficulty starts fresh and retains pause/manual waves");
  check(g.speed==1.4&&g.words.stream().allMatch(w->w.length()>=6),"hard words and speed");g.setSpeed(3);check(g.speed==2.6,"hard cap");
  g.manualSpawns=false;g.resume();lab.setDifficulty(false);check(g.state==GameEngine.PLAYING&&!g.manualSpawns&&g.speed==1,"normal restart preserves automatic waves");g.setSpeed(3);check(g.speed==2.2,"normal cap");
  lab.setOvercast(false);check(!g.settings.overcast,"overcast disables");
  check(!saved.hard&&!saved.overcast&&real.score==123&&real.progress==1&&real.state==GameEngine.PAUSED,"saved settings and real run untouched");
  System.out.println("PASS native sandbox 2.0.4: isolated toggles, scoring, word filtering, speed limits, resets, pause and wave settings.");
 }
}
