package sg.edu.nus.comp.nuhsviz.handler;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import org.json.JSONArray;
import org.json.JSONObject;

import sg.edu.nus.comp.nuhsviz.Config;
import sg.edu.nus.comp.nuhsviz.backend.DatabaseHelper;
import sg.edu.nus.comp.nuhsviz.backend.MySQLBackend;

public class SQLQueryHandler extends BaseHandler {
	
	
	private static Map<String,String> cache = new HashMap<String,String>();
	
	public void handle(HttpRequest request) { 
		try {
			String action = request.getQueryMap().get("action");
			if (action == null) {
				throw new Exception ("Empty Input on action");
			}
			String queryStr = request.getQueryMap().get("query");
		
			if (queryStr == null || queryStr.trim().isEmpty()) throw new Exception ("Empty Input on query");
			MySQLBackend sql = DatabaseHelper.connectToDB();
			JSONArray jdt = new JSONArray ();
			switch (action) {
				case "chart":
					processChartQuery (queryStr, jdt, sql);
					break;
				case "sample":
					//jdt = this.doExecuteSQLStat(queryStr, sql);
					break;
				default:
					throw new Exception ("Invalid action type");
			}
			sql.disconnectMySQL();
			request.response(jdt.toString());
		} catch (Exception e) {
			e.printStackTrace();
			try {
				request.response("Exception: " + e.getMessage() );
			} catch (Exception ee) {ee.printStackTrace();}
		}
    }  
	
	public void processChartQuery(String queryStr, JSONArray jdt, 
			MySQLBackend sql) throws Exception {
		System.out.println(queryStr);
		JSONObject query = new JSONObject (queryStr.trim());
		@SuppressWarnings("unchecked")
		Iterator<String> it = query.keys();
		Map<String, JSONObject> resultmap = new HashMap<String, JSONObject> ();
		while (it.hasNext()) {
			String key = it.next();
			String stat = query.getString(key);
			JSONObject jrst = doExecuteSQLStat (stat, sql);
			resultmap.put(key, jrst);
		}
		doMergeResults (jdt, resultmap, sql);
	}

	private JSONObject doExecuteSQLStat(String stat, MySQLBackend sql) throws Exception {
		//Has being cached
		if (cache.containsKey(stat)){
			return new JSONObject(cache.get(stat));
		}
		ResultSet rs = sql.executeQuery(stat);
		ResultSetMetaData meta = rs.getMetaData();
		List<String> headers = new ArrayList<String> ();
		JSONArray jheaders = new JSONArray ();
		for (int i = 0; i < meta.getColumnCount(); i ++) {
			String header = meta.getColumnLabel(i + 1);
			headers.add(header);
			jheaders.put(header);
		}
		JSONArray jrows = new JSONArray ();
		while (rs.next()) {
			JSONArray jrow = new JSONArray ();
			for (String header : headers) {
				String value = rs.getString(header);
				jrow.put(value);
			}
			jrows.put(jrow);
		}
		rs.close();
		JSONObject jrst = new JSONObject ();
		jrst.put("headers", jheaders);
		jrst.put("data", jrows);
		String rstStr = jrst.toString();
		//cache the result
		cache.put(stat, rstStr);
		return jrst;
	}
	
	private void doMergeResults(JSONArray jdt, Map<String, JSONObject> resultmap, MySQLBackend sql) throws Exception {
		for (String sname : resultmap.keySet()) {
			JSONObject jdsdata = new JSONObject ();
			jdsdata.put("dsid", sname);
			JSONObject jrst = resultmap.get(sname); // the result
			JSONArray jheaders = jrst.getJSONArray("headers"); // the headers
			Map<String, String> dimKey2Val = new HashMap<String, String> ();
			TreeMap<String, Map<String, String>> dimKey2Data = 
					new TreeMap<String, Map<String, String>> ();
			
			JSONArray jrows = jrst.getJSONArray("data");
			Set<String> seriesset = new HashSet<String> ();
			for (int i = 0; i < jrows.length(); i ++) {
				JSONArray jrow = jrows.getJSONArray(i);
				String num = jrow.getString(jrow.length() - 1);
				String dimKey = "ALL";
				String dimVal = "ALL";
				String series = "ALL";
				if (jrow.length() > 1) {
					dimKey = jrow.getString(0);
					dimVal = dimKey;
					String header = jheaders.getString(0);
					if (header.contains("icd9")) {
						ResultSet rs = sql.executeQuery ("SELECT * FROM code_label_map WHERE code = '" + dimKey + "'");
						if (rs.next()) {
							dimVal = rs.getString("name");
						}
						rs.close();
					}
				}
				if (jrow.length() > 2) {
					series = jrow.getString(1);
				}
				seriesset.add(series);
				dimKey2Val.put(dimKey, dimVal);
				Map<String, String> data = dimKey2Data.get(dimKey);
				if (data == null) data = new HashMap<String, String> ();
				data.put(series, num);
				dimKey2Data.put(dimKey, data);
			}
			
			JSONArray jdimKeys = new JSONArray ();
			JSONArray jdimVals = new JSONArray ();
			
			List<Comparable> sortedDimKeys = new ArrayList<Comparable> ();
			boolean allInt = true;
			for (String dimKey : dimKey2Data.keySet()) {
				if (!dimKey.matches("\\d+")) {
					allInt = false;
				}
				if(dimKey.matches("^0.+")){ //begin with 0 ,treat as string
					allInt = false;
				}
			}
			for (String dimKey : dimKey2Data.keySet()) {
				if (allInt) {
					Integer dimKeyInt = Integer.parseInt(dimKey);
					sortedDimKeys.add(dimKeyInt);
				} else {
					sortedDimKeys.add(dimKey);
				}
			}
			if (allInt)
				Collections.sort(sortedDimKeys);
			
			for (Object key : sortedDimKeys) {
				String dimKey = key + "";
				String dimVal = dimKey2Val.get(dimKey);
				jdimKeys.put(dimKey);
				jdimVals.put(dimVal);
			}
			JSONObject jdim = new JSONObject ();
			jdim.put("keys", jdimKeys);
			jdim.put("values", jdimVals);
			jdsdata.put("dimension", jdim);
			
			JSONArray jsrs = new JSONArray ();
			for (String series : seriesset) {
				JSONObject js = new JSONObject ();
				js.put("name", series);
				JSONArray jdata = new JSONArray ();
				for (Object key : sortedDimKeys) {
					String dimKey = key + "";
					Map<String, String> data = dimKey2Data.get(dimKey);
					String num = data.get(series);
					if (num == null) num = "0";
					jdata.put(Double.valueOf(num));
				}
				js.put("data", jdata);
				jsrs.put(js);
			}
			jdsdata.put("series", jsrs);
			jdt.put(jdsdata);
		}
	}
}
