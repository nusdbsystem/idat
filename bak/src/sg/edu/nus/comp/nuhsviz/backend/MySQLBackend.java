package sg.edu.nus.comp.nuhsviz.backend;

import java.sql.*;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
 
public class MySQLBackend {
	Connection conn;
	
	String defaultServer;
	String defaultUserName;
	String defaultUserPass;
	String defaultDBName;
	
	public MySQLBackend() {
        conn = null;
	}
	
	public void connectMySQL (String server, String userName, String password, String dbName) 
		throws Exception{
		Class.forName("com.mysql.jdbc.Driver");
		conn = DriverManager.getConnection("jdbc:mysql://" + 
				server + 
				"/" + dbName + 
				"?useUnicode=true&characterEncoding=gbk&jdbcCompliantTruncation=false", 
				userName, password);
		defaultServer = server;
		defaultUserName = userName;
		defaultUserPass = password;
		defaultDBName = dbName;
		this.useDB(dbName);
	}
	
	public void disconnectMySQL () throws SQLException{
		//System.out.println("disconnect...");
		conn.close();
		conn = null;
        //System.out.println("Database connection terminated");
	}
	
	public void useDB (String dbName) throws Exception {
		String stat = "USE " + dbName;
		this.execute(stat);
	}
	
	public ResultSet getTables () throws Exception {
		return conn.getMetaData().getTables(null, null, null, null);
	}

	public void execute (String statement) throws Exception{
		//System.out.println("Now Execute: " + statement);
		try {
			Statement stat = this.conn.createStatement();
			stat.execute(statement);
		} catch (Exception e) {
//			this.connectMySQL(defaultServer, defaultUserName, defaultUserPass, defaultDBName);
//			Statement stat = this.conn.createStatement();
//			stat.execute(statement);
			e.printStackTrace();
		
		}
	}
	
	
	public ResultSet executeQuery (String statement) throws Exception {
		try {
			//System.out.println("Now Execute: " + statement);
			ResultSet rs = null;
			Statement stat = this.conn.createStatement();
			rs = stat.executeQuery(statement);
			return rs;
		} catch (Exception e) {
//			this.connectMySQL(defaultServer, defaultUserName, defaultUserPass, defaultDBName);
//			ResultSet rs = null;
//			Statement stat = this.conn.createStatement();
//			rs = stat.executeQuery(statement);
//			return rs;
			e.printStackTrace();
		 
			return null;
		}
	}
	public Table GetTableDefine(String tableName){
		PreparedStatement pstmt = null;
		ResultSetMetaData rsmd = null;
		ResultSet rs = null;
		ResultSet pkrs = null;
		Map<String, String> pkmap = null;
		Map<String, String> descmap = null;
		if (conn == null) {
			return null;
		}
		Table tb = null; 
		
		
		try {
			DatabaseMetaData databaseMetaData = conn.getMetaData();
			
			ResultSet tables = databaseMetaData.getTables(null, "%", "%",
					new String[] { "TABLE" });
			
			
			while (tables.next()) {
				System.out.println(tables.getString("TABLE_NAME"));
				if(!tables.getString("TABLE_NAME").equals(tableName)){
					continue;
				}
				tb= new Table();
				
				pkmap = new HashMap<String, String>();
				descmap=new HashMap<String, String>();
				
				// System.out.println(Table.getFormatTablename(tableName));
				tb.setTableName(Table.getFormatTablename(tableName));
				tb.setDbTableName(tableName);

				pkrs = databaseMetaData.getPrimaryKeys(null, null, tableName);
				while (pkrs.next()) {
					pkmap.put(pkrs.getString(4), null);
					// System.err.println("COLUMN_NAME: " + pkrs.getObject(4));
				}
				
				
				ResultSet columnSet = databaseMetaData.getColumns(null, "%",
						tableName, "%");
				while(columnSet.next()){
					String columnName = columnSet.getString("COLUMN_NAME");
					  //备注
					String columnComment = columnSet.getString("REMARKS");
					descmap.put(columnName, columnComment);
				}
				
				

				pstmt = conn.prepareStatement("SELECT * FROM " + tableName);
				rs = pstmt.executeQuery();
				rsmd = rs.getMetaData();
				for (int i = 1; i <= rsmd.getColumnCount(); i++) {
					Column cn = new Column();
					cn.setDbType(rsmd.getColumnTypeName(i));
					cn.setJavaName(rsmd.getColumnName(i).toLowerCase());
					cn.setDbName(rsmd.getColumnName(i));
					cn.setJavaType(mysqlType2JavaType(cn.getDbType()));
					cn.setDesc(descmap.get(cn.getDbName()));
					if (pkmap.containsKey(cn.getDbName())) {
						cn.setPk("1");
						tb.setPkJavaType(cn.getJavaType());
					}
					tb.getColumns().add(cn);
				}
				 
				pstmt = null;
				rsmd = null;
				rs = null;
				pkrs = null;
				pkmap = null;
				columnSet=null;
				descmap=null;
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return tb;
	}
	private static String mysqlType2JavaType(String mysqltype) {
		if (StringUtils.isBlank(mysqltype))
			return "";
		if ("VARCHAR".equalsIgnoreCase(mysqltype))
			return String.class.getSimpleName();
		else if ("CHAR".equalsIgnoreCase(mysqltype))
			return String.class.getSimpleName();
		else if ("BLOB".equalsIgnoreCase(mysqltype))
			return byte[].class.getSimpleName();
		else if ("TEXT".equalsIgnoreCase(mysqltype))
			return String.class.getSimpleName();
		else if ("INT".equalsIgnoreCase(mysqltype))
			return long.class.getSimpleName();
		else if ("INTEGER".equalsIgnoreCase(mysqltype))
			return long.class.getSimpleName();
		else if ("TINYINT".equalsIgnoreCase(mysqltype))
			return short.class.getSimpleName();
		else if ("SMALLINT".equalsIgnoreCase(mysqltype))
			return int.class.getSimpleName();
		else if ("MEDIUMINT".equalsIgnoreCase(mysqltype))
			return int.class.getSimpleName();
		else if ("BIT".equalsIgnoreCase(mysqltype))
			return boolean.class.getSimpleName();
		else if ("BIGINT".equalsIgnoreCase(mysqltype))
			return long.class.getSimpleName();
		else if ("FLOAT".equalsIgnoreCase(mysqltype))
			return float.class.getSimpleName();
		else if ("DOUBLE".equalsIgnoreCase(mysqltype))
			return double.class.getSimpleName();
		else if ("DECIMAL".equalsIgnoreCase(mysqltype))
			return double.class.getSimpleName();
		else if ("BOOLEAN".equalsIgnoreCase(mysqltype))
			return boolean.class.getSimpleName();
		else if ("ID".equalsIgnoreCase(mysqltype))
			return long.class.getSimpleName();
		else if ("DATE".equalsIgnoreCase(mysqltype))
			return Date.class.getSimpleName();
		else if ("TIME".equalsIgnoreCase(mysqltype))
			return Date.class.getSimpleName();
		else if ("DATETIME".equalsIgnoreCase(mysqltype))
			return Timestamp.class.getSimpleName();
		else if ("TIMESTAMP".equalsIgnoreCase(mysqltype))
			return Timestamp.class.getSimpleName();
		else if ("YEAR".equalsIgnoreCase(mysqltype))
			return Date.class.getSimpleName();
		else
			return "";

	}
}
