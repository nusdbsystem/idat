package sg.edu.nus.comp.idat;

import java.awt.Desktop;
import java.net.InetSocketAddress;
import java.net.URI;
import java.util.concurrent.Executors;

import com.sun.net.httpserver.HttpServer;

import sg.edu.nus.comp.idat.handler.ConfigHandler;
import sg.edu.nus.comp.idat.handler.GetAttrHandler;
import sg.edu.nus.comp.idat.handler.ResourceHandler;
import sg.edu.nus.comp.idat.handler.SQLQueryHandler;

/**
 * @author Aaron
 *
 */
public class Server {
	
	public static void main(String[] args) {  
        try {  
            //load configure file and initial context
        	Config.init();
            InetSocketAddress inetSock = new InetSocketAddress(Config.PORT);  
            
            HttpServer httpServer = HttpServer.create(inetSock, Config.BACK_LOG);  
            System.out.println("Base url"+Config.BASE_URL); 
              
            httpServer.createContext(Config.BASE_URL+"/api/",new SQLQueryHandler());
            
            httpServer.createContext(Config.BASE_URL+"/config/",new ConfigHandler()); 
            
            httpServer.createContext(Config.BASE_URL+"/getAttr/",new GetAttrHandler()); 
             
            httpServer.createContext(Config.BASE_URL+"/",new ResourceHandler());
           
            httpServer.setExecutor(Executors.newFixedThreadPool(Config.Thread_Count));  
            httpServer.start();  
            
            System.out.println("IDAT Start! listening on port "+Config.PORT); 

            Desktop desktop = Desktop.isDesktopSupported() ? Desktop.getDesktop() : null;
            if (desktop != null && desktop.isSupported(Desktop.Action.BROWSE)) {
                try {
                    desktop.browse(new URI("http://localhost:"+Config.PORT+Config.BASE_URL+"/"));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            
        } catch (Exception e) {  
            e.printStackTrace();  
        }  
    }  
	
	 
}
