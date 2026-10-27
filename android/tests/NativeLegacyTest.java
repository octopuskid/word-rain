import io.github.octopuskid.wordrain.LegacyStore;
import java.io.*;import java.nio.file.*;import java.nio.charset.*;import java.util.*;
public class NativeLegacyTest {
 static void check(boolean b){if(!b)throw new AssertionError();}
 static void var(ByteArrayOutputStream out,int v){while(v>127){out.write((v&127)|128);v>>>=7;}out.write(v);}
 static void little(ByteArrayOutputStream out,long n,int size){for(int i=0;i<size;i++)out.write((int)(n>>>(i*8))&255);}
 static byte[] value(String name){byte[] data=name.getBytes(StandardCharsets.ISO_8859_1),out=new byte[data.length+1];out[0]=1;System.arraycopy(data,0,out,1,data.length);return out;}
 static byte[] key(String origin,String name)throws Exception{ByteArrayOutputStream b=new ByteArrayOutputStream();b.write(('_'+origin).getBytes("UTF-8"));b.write(0);b.write(value(name));return b.toByteArray();}
 static byte[] batch(long seq,int kind,byte[] key,byte[] value)throws Exception{ByteArrayOutputStream b=new ByteArrayOutputStream();little(b,seq,8);little(b,1,4);b.write(kind);var(b,key.length);b.write(key);if(kind==1){var(b,value.length);b.write(value);}return b.toByteArray();}
 static byte[] log(byte[] batch)throws Exception{ByteArrayOutputStream b=new ByteArrayOutputStream();little(b,0,4);little(b,batch.length,2);b.write(1);b.write(batch);return b.toByteArray();}
 static byte[] block(byte[] k,byte[] v)throws Exception{ByteArrayOutputStream b=new ByteArrayOutputStream();var(b,0);var(b,k.length);var(b,v.length);b.write(k);b.write(v);little(b,0,4);little(b,1,4);return b.toByteArray();}
 static byte[] handle(int at,int size){ByteArrayOutputStream b=new ByteArrayOutputStream();var(b,at);var(b,size);return b.toByteArray();}
 static byte[] table(byte[] key,byte[] value,long seq)throws Exception{ByteArrayOutputStream internal=new ByteArrayOutputStream();internal.write(key);little(internal,(seq<<8)|1,8);byte[] data=block(internal.toByteArray(),value);ByteArrayOutputStream out=new ByteArrayOutputStream();out.write(data);little(out,0,5);int indexAt=out.size();byte[] index=block(new byte[]{'z'},handle(0,data.length));out.write(index);little(out,0,5);ByteArrayOutputStream footer=new ByteArrayOutputStream();footer.write(handle(0,0));footer.write(handle(indexAt,index.length));while(footer.size()<40)footer.write(0);little(footer,0xdb4775248b80fb57L,8);out.write(footer.toByteArray());return out.toByteArray();}
 public static void main(String[] args)throws Exception{
  Path dir=Files.createTempDirectory("wr-legacy-");try{byte[] k=key("https://appassets.androidplatform.net","word-rain-story-v2");byte[] first=log(batch(1,1,k,value("{\"completed\":1}")));Files.write(dir.resolve("000001.log"),first);Files.write(dir.resolve("000002.log"),log(batch(3,1,k,value("{\"completed\":2}"))));Files.write(dir.resolve("000003.log"),log(batch(9,1,key("https://other.example","word-rain-theme"),value("light"))));Map<String,String> result=LegacyStore.read(dir.toFile());check(result.size()==1&&result.get("word-rain-story-v2").equals("{\"completed\":2}"));check(Arrays.equals(first,Files.readAllBytes(dir.resolve("000001.log"))));Files.write(dir.resolve("000004.log"),log(batch(4,0,k,null)));check(LegacyStore.read(dir.toFile()).isEmpty());
   byte[] compact=table(k,value("compacted"),50);Files.write(dir.resolve("000005.ldb"),compact);check(LegacyStore.read(dir.toFile()).get("word-rain-story-v2").equals("compacted"));check(Arrays.equals(compact,Files.readAllBytes(dir.resolve("000005.ldb"))));Files.write(dir.resolve("000006.log"),log(batch(51,0,k,null)));check(LegacyStore.read(dir.toFile()).isEmpty());
   check(new String(LegacyStore.snappy(new byte[]{5,16,104,101,108,108,111}),"UTF-8").equals("hello"));
   check(new String(LegacyStore.snappy(new byte[]{8,4,97,98,22,2,0}),"UTF-8").equals("abababab"));
   boolean invalid=false;try{LegacyStore.snappy(new byte[]{5,1,1});}catch(Exception good){invalid=true;}check(invalid);
   System.out.println("PASS native migration: original files unchanged, origin restriction, newest sequences, compacted SST tables, deletions, literal and compressed Snappy copies, malformed data.");
  }finally{for(File file:dir.toFile().listFiles())file.delete();Files.delete(dir);}
 }
}
