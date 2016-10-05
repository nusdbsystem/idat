(function($){ 
	
	'use strict';
	IDAT.FavouriteController = function(options){
		this.op=$.extend({},IDAT.FavouriteController.defaultOptions,options) 
		
		this.id=IDAT.Controller.nextId();
		this.folders=[];
		this.init(); 
	}
	IDAT.FavouriteController.defaultOptions={
		width: 300,
		height:1000
	}

	IDAT.FavouriteController.prototype={
		init:function(){ 

			console.log("favourite controller init..."); 
			var me = this; 
			IDAT.subscribe("likeChart",this,function(chart){
				me.addChart(chart);
			});
			me.container=$("#favourite"); 
			me.addFolder(); 
			me.render();
		},
		render:function(){
			var me = this;
			me.container.html(); 
			var source = $("#favourite_template").html();
			var template = Handlebars.compile(source); 
			var html   = template(me.folders); 
			
			me.container.html(html);
			
			
			me.container.find(".folder[_id="+me.currentFolderId+"]").addClass("selected");
			
			me.bind();
			
		},
		addChart:function(chart){
			
			var currentFolder=this.folders.findBy("id",this.currentFolderId);
			currentFolder.charts.push(chart);
			currentFolder.size++;

			this.render();
		},
		chooseFolder:function(id){
			var folder = this.folders.findBy("id",id);
			if(id==this.currentFolderId){
				IDAT.send("showStory",folder.charts);		
				return;
			}
			this.currentFolderId=id;  
			
		},
		addFolder:function(){ 
			var newId=IDAT.FavouriteController.nextId();
			var folder={
					id:newId,
					size:0,
					color:IDAT.Color(newId),
					charts:[]
			}			
			this.folders.push(folder);
			
			this.currentFolderId=newId;
			
		},
		removeFolder:function(){
			if(this.folders.length==1){
				return;
			}
			
			this.folders.removeBy("id",this.currentFolderId);
			this.currentFolderId=this.folders[0].id;
			
			
		},
		bind:function(){
			var me=this;
			me.container.find(".folder").bind("tap click",function(e){
				var target=e.target;
				me.container.find(".folder").removeClass("selected");
				$(target).addClass("selected");
				
				var id = $(target).attr("_id"); 
				me.chooseFolder(id);
				 
			}); 
			
			me.container.find(".addFolder").bind("tap click",function(e){
				me.addFolder();
				me.render();
			});
			
			me.container.find(".removeFolder").bind("tap click",function(e){
				me.removeFolder();
				me.render();
			});
			 
		},
		destroy:function(){
			IDAT.unSubscribe("likeChart",this); 
			
		}    
	}
	
	IDAT.FavouriteController.idSequence=1;
	IDAT.FavouriteController.nextId=function(){
		return IDAT.FavouriteController.idSequence++;
	}
	
})(jQuery);


