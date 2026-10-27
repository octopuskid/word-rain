import io.github.octopuskid.wordrain.*;
import java.util.Random;
public class NativeTrace {
 public static void main(String[] args){GameEngine g=new GameEngine(new Random(7),new GameEngine.Events());GameEngine.Settings s=new GameEngine.Settings();s.hard=args[0].equals("hard");s.overcast=args[1].equals("true");g.startClassic(s);g.words.clear();g.words.add("AAAA");g.words.add("BBBB");
  for(String op:args[2].split(",")){
   if(op.equals("P"))g.pause();else if(op.equals("R"))g.resume();else if(op.equals("H"))g.hearts=2;
   else if(op.equals("F")){int n=g.word().length()-g.progress;for(int i=0;i<n;i++)g.catchDrop(new GameEngine.Drop(240,470,100,0,g.needed()));}
   else if(op.equals("O")||op.equals("L")){g.drops.clear();g.drops.add(new GameEngine.Drop(240,200,100,3,' '));g.drops.add(new GameEngine.Drop(240,200,100,op.equals("O")?3:1,' '));g.resolveOverlaps();}
   else{int kind=op.equals("B")?1:op.equals("S")?2:op.equals("V")?3:0;g.catchDrop(new GameEngine.Drop(240,470,100,kind,op.equals("W")?'Z':g.needed()));}
   System.out.println("["+g.score+","+g.hearts+","+g.shield+","+g.progress+","+g.wrongStreak+","+g.scoringPaused+","+Math.round(g.speed*100)+","+g.perfectWords+","+g.perfectRun+","+g.wordPerfect+","+g.wildcard+","+g.doubleScore+",\""+(g.state==1?"playing":g.state==2?"paused":"over")+"\"]");
  }
 }
}
