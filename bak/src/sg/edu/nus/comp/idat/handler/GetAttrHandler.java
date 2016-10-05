package sg.edu.nus.comp.idat.handler;

import org.json.JSONObject;

import sg.edu.nus.comp.idat.Config;
import sg.edu.nus.comp.idat.backend.DatabaseHelper;
import sg.edu.nus.comp.idat.backend.MySQLBackend;
import sg.edu.nus.comp.idat.backend.Table;

public class GetAttrHandler extends BaseHandler {
	 
	public void handle(HttpRequest request) { 
		try {
			String server = request.getQueryMap().get("server");
			if (server == null) {
				throw new Exception ("Empty Input on server");
			}
			String username = request.getQueryMap().get("userName");
			if (username == null) {
				throw new Exception ("Empty Input on userName");
			}
			String password = request.getQueryMap().get("password");
			if (password == null) {
				throw new Exception ("Empty Input on password");
			}
			String dbname = request.getQueryMap().get("dbName");
			if (dbname == null) {
				throw new Exception ("Empty Input on dbName");
			}
			String tablename = request.getQueryMap().get("tableName");
			if (tablename == null) {
				throw new Exception ("Empty Input on tableName");
			}
			
			Config.DATABASE_HOST = server;
			Config.DATABASE_USER_NAME = username;
			Config.DATABASE_PASSWORD = password;
			Config.DATABASE_NAME= dbname;
			
			
			MySQLBackend sql=DatabaseHelper.connectToDB();
			
			Table tb = sql.GetTableDefine(tablename);
			
			JSONObject result = new JSONObject (tb);
			
			request.response(result.toString());
			
		} catch (Exception e) {
			e.printStackTrace();
			try {
				request.response("Exception: " + e.getMessage() );
			} catch (Exception ee) {ee.printStackTrace();}
		}
    }  
	 
}
