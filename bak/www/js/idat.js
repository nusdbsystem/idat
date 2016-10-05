/*global Ember, DS, IDAT:true */
(function(){
	
	window.IDAT = {};
	
	IDAT.Interface={
			"api":"api/",
			"data":"data/",
			"config":"config/",
			"getAttr":"getAttr/"
	}
	
	
	
	//use jquery's event framework to build message subscribe system
	$("<div id='eventElement'></div>").appendTo($("body")).hide();
	
	//all the events available, avoiding hard code
 
	var subscribes={}; 
	
	IDAT.subscribe=function(eventName,caller,func){
	 
	 	if(!subscribes[eventName]) {  //this event is not subscribe yet
			subscribes[eventName]={}; 
			$("#eventElement").on(eventName,function(e,data){
				
				for(var index in subscribes[eventName]){
					var subscribe=subscribes[eventName][index];
					try{
						subscribe.func.call(subscribe.caller,data);
					}catch(e){
						console.log(e);
					}
				}
				return;
			})
		} 
		
		subscribes[eventName][caller.id]={caller:caller,func:func};
		 
	} 
	IDAT.unSubscribe=function(eventName,caller){
		if(!subscribes[eventName]){
			return;
		} 
		delete subscribes[eventName][caller.id];
	}
	
	IDAT.send = function(eventName,data){ 
		$("#eventElement").trigger(eventName,[data]);
	
	} 

	IDAT.init=function(){ 
	//	IDAT.store.load(function(){ 
			new IDAT.AppController(); 
	//	}); 
	}  
	Array.prototype.findBy=function(name,value){
		for(var index in this){
			if(this[index][name]==value){
				return this[index];
			}
			
		} 
		return ; 
	}
	Array.prototype.filterBy=function(name,value){
		var result=[];
		for(var index in this){
			if(this[index][name]==value){
				result.push(this[index]);
			}
			
		} 
		return result; 
	}
	Array.prototype.removeObj=function(obj){
		var index = this.indexOf(obj);
		if(index>-1) this.splice(index,1);
		return;
	}
	Array.prototype.removeBy=function(name,value){
		for(var index in this){
			if(this[index][name]==value){
				this.splice(index,1);
				return;
			}
			
		} 
	}
	
	//serialize form to object
	$.fn.serializeObject = function()
	{
	    var o = {};
	    var a = this.serializeArray();
	    $.each(a, function() {
	        if (o[this.name] !== undefined) {
	            if (!o[this.name].push) {
	                o[this.name] = [o[this.name]];
	            }
	            o[this.name].push(this.value || '');
	        } else {
	            o[this.name] = this.value || '';
	        }
	    });
	    return o;
	};
	
	IDAT.Controller={};
	IDAT.Controller.idSequence=1;
	IDAT.Controller.nextId=function(){
		return IDAT.Controller.idSequence++;
	}
	
	IDAT.Colors=["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"];
	
	
	IDAT.Color=function(id){ 
		return IDAT.Colors[id%IDAT.Colors.length]; 
	} 
	
	IDAT.triggerAnimation=function(source,target){
		var sourceOffset=$(source).offset();
		var targetOffset=$(target).offset();
		 
		$("<div><div>")
			.appendTo($("body"))
			.css({
				position:"fixed",
				width:$(source).width()+"px",
				height:$(source).height()+"px",
				top:sourceOffset.top+"px",
				left:sourceOffset.left+"px",
				"background-color":"rgba(100,115,100,0.8)"})
			.animate({
						left:targetOffset.left+"px",
						top:targetOffset.top+"px",
						width:"10px",
						height:"10px",
					},800,function(){
						$(this).remove();
					});
		 
  
	}
	
	   Highcharts.setOptions({
	        colors: [ '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4','#058DC7', '#50B432', '#ED561B', '#DDDF00']
	    });
	
})();


