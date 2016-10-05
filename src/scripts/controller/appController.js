(function($){ 
	
	'use strict';
	IDAT.AppController = function(options){
		this.op=$.extend({},IDAT.AppController.defaultOptions,options) 
		
		this.id=IDAT.Controller.nextId();
		this.mode="exploreMode"; //storyMode
		
		this.init(); 
	}
	IDAT.AppController.defaultOptions={
		width: 300,
		height:1000
	}

	IDAT.AppController.prototype={
		init:function(){ 
			console.log("app controller init...");

			IDAT.WindowHeight=$(window).height();
			IDAT.WindowWidth=$(window).width();
			var me = this;   
			me.bind(); 
			 
		},
		bind:function(){
			var me =this;
			
			me.job = new IDAT.JobController();

			var myElement =document.getElementsByTagName("body")[0]; 
			var mc = new Hammer.Manager(myElement);  
			var pinch = new Hammer.Pinch(); 
			mc.add(pinch);
 
			mc.on("pinchin", function(ev) {   //you can only send a message every 2s.
				 
				   IDAT.send("rollUp");
			 
			}); 
			mc.on("pinchout", function(ev) {
				 
					   IDAT.send("drillDown");
					   
			});
			
			IDAT.subscribe("showStory",this,function(){ //to Story mode
				 
				me.mode="storyMode";
				me.explore.container.slideUp(1000,function(){
					me.story.container.slideDown();
				});
				
			});
			
			IDAT.subscribe("showExplore",this,function(){ //to explore mode
				 
				me.mode="exploreMode";
				me.story.container.slideUp(1000,function(){

					me.explore.container.slideDown();
				});
			});
					
		},
		start:function(){
		
			var me=this;
			me.attrs=IDAT.store.find("attr"); 
			IDAT.AppController.singleton= me;
			  
			if(me.navigation){
				me.navigation.destroy();
			}
			me.navigation=new IDAT.NavigationController();
			
			if(me.explore){
				me.explore.destroy();
			}
			me.explore=new IDAT.ExploreController();
			
			if(me.story){
				me.story.destroy();
			}
			me.story=new IDAT.StoryController();
			me.story.container.hide(); 
			
			if(me.favourite){
				me.favourite.destroy();
			}
			me.favourite=new IDAT.FavouriteController(); 
		
		}
	}
	
	
})(jQuery);


