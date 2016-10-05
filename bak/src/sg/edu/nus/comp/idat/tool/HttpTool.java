package sg.edu.nus.comp.idat.tool;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

import com.sun.net.httpserver.HttpExchange;

public class HttpTool {
	
	public static void parseQuery(String query,Map<String,String>  paramMap){
		
		
		if(paramMap==null)
			paramMap = new HashMap<String,String>();
 
		if(query==null){
			return ;
		}
		String[] params = query.split("&");
		for(String param :params){
			String[] paramPair = param.split("=");
			if(paramPair.length>=2){
				paramMap.put(paramPair[0], paramPair[1]);
			}
		}
		
		return ;
	}
	public static void parsePostQuery(HttpExchange exchange,Map<String,String>  paramMap) throws IOException{
		
		if(paramMap==null)
			paramMap = new HashMap<String,String>();
 
		// read the query string from the request body
		String qry;
		InputStream in = exchange.getRequestBody();
		try {
		    ByteArrayOutputStream out = new ByteArrayOutputStream();
		    byte buf[] = new byte[4096];
		    for (int n = in.read(buf); n > 0; n = in.read(buf)) {
		        out.write(buf, 0, n);
		    }
		    qry = new String(out.toByteArray(), "UTF-8");
		} finally {
		    in.close();
		}
		// parse the query
		String defs[] = qry.split("[&]");
		for (String def: defs) {
		    int ix = def.indexOf('=');
		    String name;
		    String value;
		    if (ix < 0) {
		        name = def;
		        value = "";
		    } else {
		        name = def.substring(0, ix);
		        value = URLDecoder.decode(def.substring(ix+1), "UTF-8");
		         
		    }
		    paramMap.put(name, value);
		}
		return ;
	}
	 
}
