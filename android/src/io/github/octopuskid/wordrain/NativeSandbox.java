package io.github.octopuskid.wordrain;

import java.util.Random;

/** Session-only Classic controls. Never shares settings or an engine with a saved run. */
final class NativeSandbox {
 final GameEngine engine;
 NativeSandbox(GameEngine.Settings saved,Random random,GameEngine.Events effects){
  GameEngine.Settings own=new GameEngine.Settings();
  own.hard=saved.hard;own.overcast=saved.overcast;own.handwriting=saved.handwriting;
  own.wordSet=saved.wordSet;own.palette=saved.palette;own.magnet=saved.magnet;
  engine=new GameEngine(random,effects);engine.startClassic(own);engine.manualSpawns=true;
 }
 void setOvercast(boolean on){engine.settings.overcast=on;}
 void setDifficulty(boolean hard){
  boolean paused=engine.state==GameEngine.PAUSED,manual=engine.manualSpawns;
  engine.settings.hard=hard;engine.startClassic(engine.settings);engine.manualSpawns=manual;
  if(paused)engine.pause();
 }
}
