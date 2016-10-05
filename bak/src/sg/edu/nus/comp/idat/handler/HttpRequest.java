package sg.edu.nus.comp.idat.handler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;

import sg.edu.nus.comp.idat.tool.HttpTool;
 
public class HttpRequest {
	
	private String path;
	private Map<String,String> queryMap;
	private OutputStream outputStream; 
	private HttpExchange httpExchange;
	
	public HttpRequest(HttpExchange httpExchange) throws IOException{
		
		this.httpExchange=httpExchange; 
		URI uri=httpExchange.getRequestURI(); 
		path=uri.getPath();
		System.out.println("path:"+path);
		queryMap = new HashMap<String,String>();
		String query = uri.getQuery();
		HttpTool.parseQuery(query,queryMap);
		HttpTool.parsePostQuery(httpExchange,queryMap); 
		outputStream = httpExchange.getResponseBody(); 
		
	}
	
	public void response(String responseString) throws Exception {  
		
		try {
			Headers h = httpExchange.getResponseHeaders();
			h.set("Content-Type","text/plain");
			httpExchange.sendResponseHeaders(200, responseString.length());     
			outputStream.write(responseString.getBytes());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			throw new Exception("response failed!");
		}finally{
			
			if(outputStream!=null){
				outputStream.flush();
				outputStream.close();
			}
			
		}
	}
	
	public void response(InputStream is) throws Exception{  
		
		
		 
		try {
			Headers h = httpExchange.getResponseHeaders();
			h.set("Content-Type",getReturnType());
			httpExchange.sendResponseHeaders(200, is.available()); 
			
			byte[] buffer = new byte[1024] ; 
	    	int bytes = 0 ;  
	    	while ((bytes = is.read(buffer)) != -1 ) 
	        { 
	    		outputStream.write(buffer, 0, bytes); 
	        } 
		} catch (Exception e) { 
			e.printStackTrace();
			throw new Exception("response failed!");
		} finally {
			if(outputStream!=null){
				outputStream.flush();
				outputStream.close();  
			}
			if(is!=null)
				is.close();
		}
	}
	
public  String getReturnType(){
		
		int index = path.lastIndexOf('.');
		if(index==-1)
			return "text/plain";
		String fix= path.substring(index+1);
		String responseType="text/html";
		switch(Fix.getFix(fix.toUpperCase())){
		case JS:
			responseType="application/x-javascript";
			break;
		case JSON:
			responseType="application/json";
			break;
		case CSS:
			responseType="text/css";
			break;
		case HTML:
		case HTM:
			responseType="text/html";
			break; 
		case JPEG:
		case JPG:
			responseType="image/jpeg";
			break;
		case GIF:
			responseType="image/gif";
			break; 
		case PNG:
			responseType="image/png";
			break; 
		default:
			break;
		}
		
		return responseType;
	}
	
	public enum Fix {
		JS, JSON, CSS, HTML,HTM,JPEG,JPG,GIF,PNG,OTHER;
	    public static Fix getFix( String value){
	    	 
	    	try{
	    		return Fix.valueOf(value.toUpperCase());
	    	}catch(Exception e){
	    		return OTHER;
	    	}
	    }
	}
	
	
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	public Map<String,String> getQueryMap() {
		return queryMap;
	}
	public void setQueryMap(Map<String,String> queryMap) {
		this.queryMap = queryMap;
	}
	public OutputStream getOutputStream() {
		return outputStream;
	}
	public void setOutputStream(OutputStream outputStream) {
		this.outputStream = outputStream;
	}
	public HttpExchange getHttpExchange() {
		return httpExchange;
	}
	public void setHttpExchange(HttpExchange httpExchange) {
		this.httpExchange = httpExchange;
	}
	 
	
}
