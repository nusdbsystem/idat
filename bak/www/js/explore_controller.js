(function($){ 
	
	'use strict';
	IDAT.ExploreController = function(options){
		this.op=$.extend({},IDAT.ExploreController.defaultOptions,options)  
		this.container=$(this.op.container);
		this.id=IDAT.Controller.nextId();
		this.init(); 
		
	}
	IDAT.ExploreController.defaultOptions={
		width: 300,
		height:1000,
		container:"#explore"
	}

	IDAT.ExploreController.prototype={
		init:function(){ 
			console.log("explore controller init...");
			
			var me = this;
			IDAT.ExploreController.singleton= me;
			
			me.app= IDAT.AppController.singleton;
			
			me.currentDataSet=IDAT.store.find("dataSet",0);
			 
			$.jmpress("template", "tab", {
				children: function(index) { 
					if(index==0){					 
						return {r:0,phi:0,scale:1,z:2000};  //up anchor 
					}
					if(index==1){
						return {r:0,phi:0,scale:1,z:-1000};  //down anchor
					}
					if(index==2){
						return {r:0,phi:0,scale:1};  //in the center
					}
					
					var idx=index-3;
					
					var config = {
						scale: 0.2,
						r: 400,
						phi: idx*40,  
						rotateX:360,
						secondary: {
							"": "self",
							rotateX:  0,
							r: 0,
							phi: 0,
							scale: 1
						}
					}; 
					return config;
				}
			});
			
			me.render();
			
			IDAT.subscribe("rollUp",this,function(){ //trigger by explore
				
				if(me.viewType=="chart"){
					$('article').jmpress("select","#currentDataSet");
					return;
				}
				if(me.currentDataSet.parent){
					rollUp(me.currentDataSet.parent,true);
				} 
			});
			IDAT.subscribe("drillDown",this,function(dataSet){ //trigger by explore
				if(me.currentDataSet.children&&me.currentDataSet.children.length>0){ 
					if(!dataSet){
						dataSet=me.currentDataSet.children[0];
					}
					drillDown(dataSet,true);  
				} 
			});
			 
			IDAT.subscribe("gotoDataSet",this,function(dataSet){  //trigger by navigation
			 	
			 	
			 	if(dataSet!=me.currentDataSet){
			 		if(dataSet==me.currentDataSet.parent){
			 			rollUp(dataSet,false);
			 			return;
			 		}
			 		if(me.currentDataSet.children&&me.currentDataSet.children.indexOf(dataSet)>-1){
			 			drillDown(dataSet,false);
			 			return;
			 		}
			 		if(me.allDataSets.indexOf(dataSet)>-1){
			 			$('article').jmpress("select","#dataSet_"+dataSet.id);
			 			return;
			 		}
			 		if(dataSet){
			 			gotoDataSet(dataSet,false);
			 		}
			 	}
			});
			
			function rollUp(dataSet,ifSendMsg){
				$("article").jmpress("select","#upAnchor");
				setTimeout(function(){ 
				 	gotoDataSet(dataSet,ifSendMsg);
				},1000);
			
			}
			function drillDown(dataSet,ifSendMsg){
				$("article").jmpress("select","#downAnchor");
				setTimeout(function(){  
				 	gotoDataSet(dataSet,ifSendMsg);
				},1000);
			
			}
			function gotoDataSet(dataSet,ifSendMsg){
				me.changeDataSet(dataSet);
				if(ifSendMsg){
					IDAT.send("changeDataSet",dataSet); 
				}
			}
			 			
		},
		changeDataSet:function(dataSet){
			this.currentDataSet=dataSet;
			this.render(); 
		},
		render:function(){
			var me = this;
			 
			me.container.html();
			
			var source = $("#explore_template").html();
			var template = Handlebars.compile(source); 
			var html    = template({});
			
			me.container.html(html);

			$('article').css({height:(IDAT.WindowHeight)+"px",width:(IDAT.WindowWidth)+"px",top:"0px",left:"0px"})
			
			me.bind(); 
			me.initChildren();
			
		},
		initChildren:function(){
			
			var me=this;
			
			me.dataSetContainer=$('article');
			
			me.currentDataSetController=renderDataSet(me.currentDataSet);
			
			var siblingDataSets= me.app.navigation.getSiblings(me.currentDataSet.id); 
			
			me.allDataSets=[me.currentDataSet];
			
			$.each(siblingDataSets,function(index,dataSetId){ 
				var dataSet=IDAT.store.find("dataSet",dataSetId);
				var controller = renderDataSet(dataSet);
				me.allDataSets.push(dataSet);  
			}); 
			
			function renderDataSet(dataSet){
				var container=$('<section></section>').addClass("normal").attr("id","dataSet_"+dataSet.id).appendTo(me.dataSetContainer);
				var controller = new IDAT.DataSetController({dataSet:dataSet,container:container});
				container.data("controller",controller);
				return controller;
			}
			
			$('article').jmpress({
				stepSelector: "section",
				hash:{use:false},
				fullscreen:false,
				applyTarget:function(element,eventData){  
					$("article section").css("opacity","0.8");
					$("article .mask").show();
					$(element).css("opacity","1");
					$("#currentDataSet").css("opacity","1");
					
					var controller = $(element).data("controller");
					if(controller){
						if(controller.type=="dataSetController"){ // to dataSet view
							$(".normal").show();
							$("#currentDataSet").find(".circle").show();
							me.viewType="dataSet";
							
							var currentController=$("#currentDataSet").data("controller");
							
							if(currentController!=controller){ //if back from chart view do nothing
							
								if(currentController){
									currentController.toNormal();
								}
								controller.toCurrent(); 
								IDAT.send("changeDataSet",controller.model);
							}  
							me.currentDataSet=controller.model;
						}else{ // to chart view
							me.viewType="chart";
							$("#currentDataSet").find(".circle").hide();
							$(".normal").hide(); 
							$(element).find(".mask").hide();
						}
					}
				}
			});
			$('article').unbind("touchend"); //not use swipe
			
			$('article').jmpress("select","#dataSet_"+me.currentDataSet.id);
		},
		bind:function(){ 
		  
		 

			$("#rollUp").bind("tap click",function(e){
				IDAT.send("rollUp");
				return false;
			});
			$("#drillDown").bind("tap click",function(){
				IDAT.send("drillDown");
				return false;
			});
			
		},
		destroy:function(){
			IDAT.unSubscribe("rollUp",this);
			IDAT.unSubscribe("drillDown",this);
			IDAT.unSubscribe("gotoDataSet",this);
			
		}    
	}
})(jQuery);


