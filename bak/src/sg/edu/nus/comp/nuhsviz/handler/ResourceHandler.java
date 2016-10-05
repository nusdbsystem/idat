package sg.edu.nus.comp.nuhsviz.handler;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
 


import sg.edu.nus.comp.nuhsviz.Config;
 
/**
 * @author Aaron
 *
 */
public class ResourceHandler extends BaseHandler{  
	 
    public void handle(HttpRequest request) { 
    	FileInputStream fis = null ;   
    	if("/".equals(request.getPath())){
    		request.setPath("/index.html");
    	}
    	try {
			File file = new File(Config.WEB_ROOT_PATH+request.getPath()); 
			//System.out.println("file absolute path:"+file.getAbsolutePath());
			boolean fileExists = true ; 
	    	try { 
	    		fis = new FileInputStream( file ) ; 
	    	}catch( FileNotFoundException e ) { 
	    		fileExists = false ; 
	    	} 
	    	if(fileExists) 
	    	{ 
	    		request.response(fis); 
	    	} else {  
	    		String responseString = "<HTML>" + 
	    	    "<HEAD><TITLE>404 Not Found</TITLE></HEAD>" + 
	    	    "<BODY><h1>404 Not Found</h1>" +
	    	    "</BODY></HTML>" ; 
	    		request.response(responseString);
	    	}  
		} catch (Exception e) {
			e.printStackTrace();
			String responseString = "<HTML>" + 
    	    "<HEAD><TITLE>500 Server Error</TITLE></HEAD>" + 
    	    "<BODY><h1>500 Server Error</h1>" +
    	    "</BODY></HTML>" ; 
    		try {
    			request.response(responseString);
			} catch (Exception e1) { 
				e1.printStackTrace();
			}
		}   
    }  
      
}  