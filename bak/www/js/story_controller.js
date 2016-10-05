(function($){ 
	
	'use strict';
	IDAT.StoryController = function(options){
		
		this.op=$.extend({},IDAT.StoryController.defaultOptions,options)  
		this.container=$(this.op.container);
		this.id=IDAT.Controller.nextId();
		this.init(); 
		
	}
	IDAT.StoryController.defaultOptions={ 
		container:"#story"
	}

	IDAT.StoryController.prototype={
		init:function(){ 
			
			console.log("story controller init...");
			var me = this;
			me.app= IDAT.AppController.singleton;
		
			me.render();
			
			IDAT.subscribe("showStory",this,function(charts){ //trigger by story
				me.charts=charts; 
				me.initCharts(); 
			});
			
			 			
		},
		changeDataSet:function(dataSet){
			this.currentDataSet=dataSet;
			this.render(); 
		},
		render:function(){
			var me = this;
			
			me.container.html();
			var source = $("#story_template").html();
			var template = Handlebars.compile(source); 
			var html    = template({});
			me.container.html(html); 
			me.bind();  
			
		},
		initCharts:function(){ 
			var me =this; 
			me.container.find(".storyChart").remove();
			
			$.each(me.charts,function(index,chart){
				var container=$('<div></div>')
						.addClass("left storyChart")
						.attr("id","story_chart_"+chart.id)
						.appendTo(me.container); 
				new IDAT.ChartController({parent:me,chart:chart,index:index,container:container});
			}); 
		},
		bind:function(){
			var me=this;
			$("#backToExplore").bind("tap click",function(){
				 me.container.find(".storyChart").remove();
				
				 IDAT.send("showExplore");
			}); 
		},
		destroy:function(){
			IDAT.unSubscribe("showStory",this); 
		}    
	}
})(jQuery);


