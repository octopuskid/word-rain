package io.github.octopuskid.wordrain;

/** One source for the upper target and the background word, including Rick symbols. */
public final class PlayPresentation {
    public static String word(GameEngine game){
        if(game.rickNext>=0)return GameEngine.RICK;
        if(game.story())return GameData.STORY_TOKENS[game.storyChapter][Math.min(game.wordIndex,game.words.size()-1)];
        return game.word();
    }
    public static int progress(GameEngine game){return game.rickNext>=0?game.rickNext:game.progress;}
    public static boolean shieldVisible(GameEngine game){return !game.story()&&!game.settings.magnet;}
    public static boolean purpleHearts(GameEngine game){return !game.story()&&game.wildcard;}
    public static boolean yellowScore(GameEngine game){return !game.story()&&game.doubleScore;}
    private PlayPresentation(){}
}
