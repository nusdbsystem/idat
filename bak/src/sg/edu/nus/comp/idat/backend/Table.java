package sg.edu.nus.comp.idat.backend;

import java.util.ArrayList;
import java.util.List;

public class Table {

	private String tableName;
	
	private String dbTableName;
	
	private String pkJavaType;

	public String getPkJavaType() {
		return pkJavaType;
	}

	public void setPkJavaType(String pkJavaType) {
		this.pkJavaType = pkJavaType;
	}

 
	private List<Column> columns=new ArrayList<Column>();

	 

	public List<Column> getColumns() {
		return columns;
	}

	public void setColumns(List<Column> columns) {
		this.columns = columns;
	}

	public static String getFormatTablename(String name) {
		try {
			// 按照规定所有的tablename 均已t_开始，转换后所有的表名称全部去掉t_并且首字母小写，其它单词大写
			name = name.replaceFirst("t_", "");
			String[] subNames = name.split("_");
			String upperName="";
			for(String subName:subNames){
				upperName+=subName.substring(0,1).toUpperCase()+subName.substring(1);
			}
			return upperName.substring(0,1).toLowerCase()+upperName.substring(1);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return name;
	}
	
	public String getUpperCaseName(){ 
		return tableName.substring(0,1).toUpperCase()+tableName.substring(1);
	}
	
	public String getPackagingName(){
		if("int".equals(pkJavaType))
			return Integer.class.getSimpleName();
		else if ("long".equals(pkJavaType))
			return Long.class.getSimpleName();
		
		else if ("double".equals(pkJavaType))
			return Double.class.getSimpleName();
		
		else if ("short".equals(pkJavaType))
			return Short.class.getSimpleName();
		
		else if ("float".equals(pkJavaType))
			return Float.class.getSimpleName();
		
		else if ("byte".equals(pkJavaType))
			return Byte.class.getSimpleName();
		
		else if ("boolean".equals(pkJavaType))
			return Boolean.class.getSimpleName();
		else
			return "";
	}

	public String getTableName() {
		return tableName;
	}

	public void setTableName(String tableName) {
		this.tableName = tableName;
	}

	public String getDbTableName() {
		return dbTableName;
	}

	public void setDbTableName(String dbTableName) {
		this.dbTableName = dbTableName;
	}
}
