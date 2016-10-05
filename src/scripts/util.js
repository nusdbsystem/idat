(function(){
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
})();


