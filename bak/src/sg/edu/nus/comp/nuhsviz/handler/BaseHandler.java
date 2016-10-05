package sg.edu.nus.comp.nuhsviz.handler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import sg.edu.nus.comp.nuhsviz.tool.HttpTool;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
 
/**
 * @author Aaron
 *
 */
public abstract class BaseHandler  implements HttpHandler{  

	 
	
	public void handle(HttpExchange httpExchange) throws IOException { 
		HttpRequest request = new HttpRequest(httpExchange);
		//handle request 
		try{
			this.handle(request);
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	/**
	 * handle request
	 * 
	 */
	public abstract void handle(HttpRequest request);
	
	
}
