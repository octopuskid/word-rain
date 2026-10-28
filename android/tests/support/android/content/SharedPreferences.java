package android.content;
public interface SharedPreferences {boolean getBoolean(String k,boolean d);String getString(String k,String d);boolean contains(String k);Editor edit();interface Editor{Editor putString(String k,String v);Editor putBoolean(String k,boolean v);Editor remove(String k);void apply();boolean commit();}}
