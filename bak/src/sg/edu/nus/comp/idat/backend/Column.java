package sg.edu.nus.comp.idat.backend;

import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;

public class Column {

	private String pk = "0";

	private String javaName;

	private String dbName;
	
	private String chName;

	private String javaType;

	private String dbType;
	
	private String desc;
	
	public String getUpperCol(String col){
		
		String[] subNames = col.split("_");
		String upperName="";
		for(String subName:subNames){
			upperName+=subName.substring(0,1).toUpperCase()+subName.substring(1);
		}
		return upperName;
	}
	
	
	public String getDesc() {
		return desc;
	}

	public void setDesc(String desc) {
		this.desc = desc;
	}

	public String getJavaType() {
		return javaType;
	}
	public void setJavaType(String javaType) {
		this.javaType = javaType;
	}

	public String getDbType() {
		return dbType;
	}

	public void setDbType(String dbType) {
		this.dbType = dbType;
	}

	
	public String getPk() {
		return pk;
	}

	public void setPk(String pk) {
		this.pk = pk;
	}



	public String getChName() {
		return chName;
	}

	public void setChName(String chName) {
		this.chName = chName;
	}

	public String getDbName() {
		return dbName;
	}

	public void setDbName(String dbName) {
		this.dbName = dbName;
	}

	public String getJavaName() {
		return javaName;
	}

	public void setJavaName(String javaName) {
		this.javaName = javaName;
	}

}
