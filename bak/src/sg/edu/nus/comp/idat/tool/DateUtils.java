package sg.edu.nus.comp.idat.tool;

import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;

//import com.bj58.wf.mvc.BeatContext;

/**
 * 
 * @author
 */

public class DateUtils {
	 
	 private static DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	
	 public static String format(Timestamp time){
		 
		 return df.format(time);
		  
	 }
	 public static Timestamp parse(String time){
		 Timestamp timestamp=null;
		 try {
			 timestamp= new Timestamp(df.parse(time).getTime());
		} catch (ParseException e) {
			e.printStackTrace();
		}
			
		 return timestamp;
	 }
	
}
