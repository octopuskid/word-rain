import io.github.octopuskid.wordrain.*;
import java.util.Random;
public class NativeTestMode202Test {
 public static void main(String[] args){
  GameEngine g=new GameEngine(new Random(7),new GameEngine.Events());g.startClassic(new GameEngine.Settings());g.manualSpawns=true;
  for(int i=0;i<500;i++)g.update(.02);
  if(!g.drops.isEmpty()||g.score!=0||g.hearts!=3)throw new AssertionError("manual mode suppresses scheduled waves");
  GameEngine.Drop d=new GameEngine.Drop(g.x,460,0,GameEngine.LETTER,g.needed());g.drops.add(d);g.update(0);
  if(g.progress!=1||g.score!=10||!g.drops.isEmpty())throw new AssertionError("manual mode uses real catches");
  g.pause();g.drops.add(new GameEngine.Drop(100,100,100,GameEngine.BOMB,' '));g.update(.02);if(g.drops.get(0).y!=100)throw new AssertionError("pause freezes test drops");
  g.resume();g.manualSpawns=false;boolean emitted=false;for(int i=0;i<500;i++){g.update(.02);if(g.drops.size()>1)emitted=true;}if(!emitted)throw new AssertionError("automatic waves restored");
  System.out.println("PASS 2.0.2 native test mode: no automatic emissions, normal manual catch scoring, pause and automatic-wave re-enable.");
 }
}
