package sg.edu.nus.comp.nuhsviz;

import java.io.File;
import java.io.FileInputStream;

/**
 * @author Aaron
 *
 */
public class Config {
	public static Integer PORT = 8010;
	public static Integer BACK_LOG = 50;
	public static Integer Thread_Count = 100;
	public static String WEB_ROOT_PATH = "www/"; 
	public static final String CONFIG_FILE_PATH = "conf/config.properties";
	
	public static String DATABASE_HOST = "";  
	public static String DATABASE_USER_NAME = ""; 
	public static String DATABASE_PASSWORD = ""; 
	public static String DATABASE_NAME = ""; 
	
	 
	public static void init() {
		File configFile = new File(CONFIG_FILE_PATH);
		System.out.println("reading config flie:"
				+ configFile.getAbsolutePath());
		try {
			System.getProperties().load(new FileInputStream(configFile));
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
   
		PORT = Integer
				.valueOf(System.getProperty("port", String.valueOf(PORT)));
		BACK_LOG = Integer.valueOf(System.getProperty("backLog",
				String.valueOf(BACK_LOG)));
		Thread_Count = Integer.valueOf(System.getProperty("threadCount",
				String.valueOf(Thread_Count)));
		WEB_ROOT_PATH = System.getProperty("webrootPath", WEB_ROOT_PATH);
		
		   
	}

}
