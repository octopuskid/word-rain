package io.github.octopuskid.wordrain;

import android.graphics.Typeface;
import android.os.Build;
import android.view.Gravity;
import android.view.View;
import android.widget.*;
import org.json.JSONObject;
import java.text.NumberFormat;
import java.util.*;

/** Aligned native columns; record data is read without modifying the saved counts. */
final class StatsTable extends TableLayout {
    final MainActivity activity;
    long totalMet,totalPerfect;int differentWords;
    StatsTable(MainActivity activity,JSONObject words){
        super(activity);this.activity=activity;setStretchAllColumns(true);setShrinkAllColumns(true);
        setBackground(activity.rounded(activity.store.dark?0xff222d43:0xfff8f9ff,16));
        row(new String[]{"WORD","MET","PERFECT"},true,0);
        ArrayList<String> keys=new ArrayList<String>();if(words!=null){Iterator<String> it=words.keys();while(it.hasNext())keys.add(it.next());}Collections.sort(keys);
        for(String word:keys){JSONObject entry=words.optJSONObject(word);if(entry==null)continue;long met=Math.max(0,entry.optLong("met")),perfect=Math.max(0,entry.optLong("perfect"));if(met==0)continue;
            differentWords++;totalMet+=met;totalPerfect+=perfect;row(new String[]{word,NumberFormat.getIntegerInstance().format(met),NumberFormat.getIntegerInstance().format(perfect)},false,differentWords);
        }
        if(differentWords==0){TableRow empty=new TableRow(activity);TextView label=activity.label("Play Classic to meet your first word.",14,false);label.setGravity(Gravity.CENTER);label.setPadding(activity.dp(12),activity.dp(20),activity.dp(12),activity.dp(20));TableRow.LayoutParams p=new TableRow.LayoutParams(-1,-2);p.span=3;empty.addView(label,p);addView(empty);}
    }
    void row(String[] values,boolean header,int index){
        TableRow row=new TableRow(activity);row.setGravity(Gravity.CENTER_VERTICAL);
        row.setBackgroundColor(header?(activity.store.dark?0xff373b58:0xffdedff0):(index%2==0?(activity.store.dark?0xff2b354e:0xffedf0fa):(activity.store.dark?0xff222d43:0xfff8f9ff)));
        for(int col=0;col<3;col++){
            TextView cell=activity.label(values[col],header?12:15,header||col==0);cell.setTypeface(Typeface.create("sans-serif",header||col==0?Typeface.BOLD:Typeface.NORMAL));cell.setFontFeatureSettings("tnum");cell.setGravity((col==0?Gravity.START:Gravity.END)|Gravity.CENTER_VERTICAL);cell.setPadding(activity.dp(12),activity.dp(13),activity.dp(12),activity.dp(13));cell.setMinHeight(activity.dp(46));if(header&&Build.VERSION.SDK_INT>=28)cell.setAccessibilityHeading(true);
            row.addView(cell,new TableRow.LayoutParams(-2,-2));
        }
        addView(row,new TableLayout.LayoutParams(-1,-2));TableRow line=new TableRow(activity);View divider=new View(activity);divider.setBackgroundColor(activity.store.dark?0xff444d67:0xffd7dced);TableRow.LayoutParams p=new TableRow.LayoutParams(-1,activity.dp(1));p.span=3;line.addView(divider,p);addView(line);
    }
}
