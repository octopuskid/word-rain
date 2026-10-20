import io.github.octopuskid.wordrain.UpdatePolicy;
public class UpdatePolicyTest {
 public static void main(String[] args) {
  String[] yes={"v1.6.3","1.7.0","2.0.0","v1.10.0"};
  String[] no={"v1.6.2","1.6.1","0.99.99","1.6.2.1","1.6.3-beta","bad",null,"999999999.1.1"};
  for(String s:yes)if(!UpdatePolicy.newer(s,"1.6.2"))throw new AssertionError(s);
  for(String s:no)if(UpdatePolicy.newer(s,"1.6.2"))throw new AssertionError(s);
  System.out.println("PASS stable version ordering and dev/invalid rejection");
 }
}
