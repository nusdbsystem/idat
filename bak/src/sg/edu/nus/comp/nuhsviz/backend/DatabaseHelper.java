package sg.edu.nus.comp.nuhsviz.backend;

import sg.edu.nus.comp.nuhsviz.Config;


public class DatabaseHelper {

	public static MySQLBackend connectToDB() throws Exception {
		
		String server = Config.DATABASE_HOST;
		String username = Config.DATABASE_USER_NAME;
		String password = Config.DATABASE_PASSWORD;
		String dbname = Config.DATABASE_NAME;
	
		
		MySQLBackend sql = new MySQLBackend ();
		sql.connectMySQL(server, username, 
				password, dbname);
		return sql;
	}
	
}
