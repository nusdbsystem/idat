(function($){ 
	
	'use strict';
	IDAT.ChartController = function(options){
		this.op=$.extend({},IDAT.ChartController.defaultOptions,options)  
		this.container=$(this.op.container);
		this.model=this.op.chart;
		this.parent=this.op.parent;
		
		this.id=IDAT.Controller.nextId();
		
		this.init(); 
	}
	IDAT.ChartController.defaultOptions={
			chart:{},
			parent:{}, //dataSetController or storyController
			index:-1, 
			container:"" 
	}

	IDAT.ChartController.prototype={
		init:function(){ 
			
			console.log("chart controller init...");
			var me = this;
			
			me.app= IDAT.AppController.singleton;
			
			me.render();
			
		},
		render:function(){
			var me = this;
			
			me.container.empty();
			
			var source = $("#chart_template").html();
			var template = Handlebars.compile(source); 
			var html= template(me.model);
			
			var newSection=me.container.html(html);
			
			
			newSection.data("controller",me);
			
			if(me.app.mode=="exploreMode"){
				layout(newSection,me.op.index);
				$("article").jmpress("init",newSection);  
				
			}else{
				me.container.find(".mask").hide();
			}
			
			me.initChildren();
			me.bind(); 
			
			function layout(section,index){
				section.attr("data-r", 250)
					.attr("data-phi", index*40)
					.attr("data-rotate-x", 90)
					.attr("data-rotate-y", index*40)
					.attr("data-scale", 0.2)
					.attr("data-z",-index*20); 
			} 
			
		},
		initChildren:function(){ 
			this.initXPanel();
			this.initYPanel();
			this.initGroupPanel();
			this.initChartTypePanel();
			this.initHighChart();
		},
		initXPanel:function(){
			
			var me= this;
			
			/*
			 * prepare model
			 */
			var attrs= me.app.attrs;
			
			if(!attrs){
				return ;
			}
			var dimensions=attrs.filterBy("isSelected",true).filterBy("canSlice",true);
			
			dimensions.splice(dimensions.indexOf(me.model.sliceDimension),1);
			
			
			/*
			 * render
			 */
			var context={current:me.model.sliceDimension,dimensions:dimensions};
			var container=me.container.find(".xPanel");
			var source = $("#xPanel_template").html();
			var template = Handlebars.compile(source); 
			var html= template(context);			
			container.html(html);
			
			me.container.find(".board").css("border-top-color",IDAT.Color(me.model.currentDataSets[0].id));
			
			
			/*
			 * bind action
			 */ 
			container.find(".action").bind("tap click",function(e){
				var target=e.target;
				var id = $(target).attr("_id");
				var attr=attrs.findBy("id",id);
				
				me.changeSliceDimension(attr);
				me.initXPanel();
			});
			 
		},
		initYPanel:function(){
			
			var me= this;
			
			/*
			 * prepare model
			 */
			var attrs= me.app.attrs;
			
			if(!attrs){
				return ;
			}
			var dimensions=attrs.filterBy("isSelected",true).filterBy("canMeasure",true);
			
			dimensions.splice(dimensions.indexOf(me.model.sliceDimension),1);
			 
			var methods=["count","max","min","avg"];
			
			/*
			 * render
			 */
			var context={currentMethod:me.model.aggregateMethod,methods:methods,currentMeasure:me.model.aggregateDimension,measures:dimensions};
			var container=me.container.find(".yPanel");
			var source = $("#yPanel_template").html();
			var template = Handlebars.compile(source); 
			var html= template(context);			
			container.html(html);
			
			
			/*
			 * bind action
			 */ 
			container.find(".changeMethod").bind("tap click",function(e){
				var target=e.target;
				var method = $(target).text(); 
				me.changeAggregationMethod(method);
				me.initYPanel();
			});
			
			container.find(".changeMeasure").bind("tap click",function(e){
				var target=e.target;
				var id = $(target).attr("_id");
				var attr=attrs.findBy("id",id);
				
				me.changeAggregationDimension(attr);
				me.initYPanel();
			});
			 
		},
		initGroupPanel:function(){
			
			var me= this;
			
			/*
			 * prepare model
			 */
			var attrs= me.app.attrs;
			
			if(!attrs){
				return ;
			}
			var dimensions=attrs.filterBy("isSelected",true).filterBy("canSlice",true);
			
			dimensions.splice(dimensions.indexOf(me.model.groupDimension),1);
			
			/*
			 * render
			 */
			var context={current:me.model.groupDimension,groups:dimensions};
			var container=me.container.find(".groupPanel");
			var source = $("#groupPanel_template").html();
			var template = Handlebars.compile(source); 
			var html= template(context);			
			container.html(html);
			
			/*
			 * bind action
			 */ 
			container.find(".action").bind("tap click",function(e){
				var target=e.target;
				var id = $(target).attr("_id");
				var attr=attrs.findBy("id",id);
				
				me.changeGroupDimension(attr);
				me.initGroupPanel();
			});
			 
		},
		initChartTypePanel:function(){
			
			var me= this;
			
			/*
			 * prepare model
			 */
			var types=this.model.sliceDimension.chartTypes;
			
			/*
			 * render
			 */
			var context={current:me.model.chartType,types:types};
			var container=me.container.find(".chartTypePanel");
			var source = $("#chartTypePanel_template").html();
			var template = Handlebars.compile(source); 
			var html= template(context);			
			container.html(html);
			
			
			/*
			 * bind action
			 */ 
			container.find(".action").bind("tap click",function(e){
				var target=e.target;
				var type= $(target).text(); 
				me.changeChartType(type);
				me.initChartTypePanel();
			});
			
		 
			 
		},
		changeSliceDimension:function(dimension){

			this.model.sliceDimension=dimension;
			
			this.model.chartType=dimension.chartTypes[0];
			
	   		this.initChartTypePanel();
			this.initHighChart();  
		},
		changeAggregationDimension:function(dimension){

			this.model.aggregateDimension=dimension;
			  
			this.initHighChart();  
		},
		changeAggregationMethod:function(method){

			this.model.aggregateMethod=method;
			  
			this.initHighChart();  
		},
		changeGroupDimension:function(dimension){
			this.model.groupDimension=dimension;
			
			this.isGrouping=false;
			
			if(dimension&&dimension.get("colName")!="*"){
				this.isGrouping=true;
			} 
			this.initHighChart();  
		},
		changeChartType:function(type){
			this.model.chartType=type;
			this.initHighChart();  
		},
		getDataSet:function(serieName,value){
			var sliceDimension=this.model.get("sliceDimension"); 
			var name =sliceDimension.get("name")+"_"+value;
			var dataSet=this.parent.model.children.findBy("name",name);
			return dataSet;
		},
		addDataSet:function(serieName,value){
			
			
			var chart = this.model;
			var dataSet = this.model.currentDataSets[0];
			var newDataSet=dataSet.clone(); //clone from parent
			
			var newChart = chart.clone();
			newChart.currentDataSets=[newDataSet];
			newChart.sliceDimension=IDAT.store.find("attr",0);
			newChart.groupDimension=IDAT.store.find("attr",0);
			newChart.chartType="pie";
			
			newDataSet.set("charts",[newChart]); // a default chart
			 
			var sliceDimension=chart.get("sliceDimension"); 
			var groupDimension=chart.get("groupDimension"); 
			if(sliceDimension&&sliceDimension.get("colName")!="*"){
				
				var valueDict= this.chartOptions.valueDict;
				
				var newName=sliceDimension.get("name")+"_"+value;
				
				
				var shortName=sliceDimension.get("shortName")+"_"+value;
				var note="";
				if(valueDict[value]!=value){
					note = sliceDimension.noteTemplate.replace("{key}",value);
					note = note.replace("{value}",valueDict[value]);
				}else{
					note = sliceDimension.noteTemplate.replace("{value}",value);
				} 
				if(this.isGrouping){ 
					newName += "&"+groupDimension.get("name")+"_"+serieName;
					shortName+= "&"+groupDimension.get("shortName")+"_"+serieName;
					note += "and "+groupDimension.noteTemplate.replace("{value}",serieName);
				}
				
				newDataSet.set("name",newName); 
				newDataSet.set("shortName",shortName);
				newDataSet.set("note",note);
				var newCondition = sliceDimension.getCondition(value); 
				if(this.isGrouping){ 
					newCondition += " and "+groupDimension.getCondition(serieName);
				}
				newDataSet.set("condition",newCondition);
				newDataSet.set("parent",dataSet);
				newDataSet.set("children",[]);
				 
				this.parent.addChild(newDataSet);
			  
			}else{
				//the first original dataset ,do nothing;
			} 
			
			return ;
		},
		gotoDataSet:function(dataSet){
			IDAT.send("drillDown",dataSet);			
		},
		bind:function(){
			var me = this;
			this.container.find(".removeChart").bind("tap click",function(){
				me.destroy();
			}); 
			this.container.find(".saveChart").bind("tap click",function(){
				me.parent.addChart(me.model);
			}); 
			this.container.find(".likeChart").bind("tap click",function(){
				IDAT.send("likeChart",me.model.clone());
				IDAT.triggerAnimation(me.container,$("#favourite"))
			}); 
		},
		destroy:function(){
			$('article').jmpress("next");
			$('article').jmpress("deinit",this.container);
			this.container.remove();
			this.parent.removeChart(this.model);
		},
		timeBegin:function(){
			this.beginTime=new Date();
		},
		timeEnd:function(){
			var time= new Date().getTime()-this.beginTime.getTime();
			this.model.time=time;
		},
		initHighChart:function(){  
			
			this.timeBegin();
			var me = this;
			
			
			$.ajax({
				url:IDAT.Interface.api+"/",
				method:"post",
				data:{
					action:"chart",
					query:me.model.getQueries()
				},
				success:function(data){
					data =JSON.parse(data)[0]; //only one dataSet support
					
					var chartOptions = IDAT.ChartDefines[me.model.chartType];
					 
					var dataSet=me.model.currentDataSets[0];
				  
					var tempOptions = $.extend({},chartOptions); 
					tempOptions.parseData(data,me);    
					me.chartOptions=tempOptions; 
					
					render(tempOptions);
					 
				},
				error:function(e){
					console.log(e);
				}
			
			});
			
			function generateQuery(){
				
				var query={};
				$.each(me.dataSets,function(index,dataSet){
					var sql= "select "+ getSelectPart()+"from "+IDAT.DataSource.tableName+" "+getConditionPart(dataSet)+" "+getGroupPart();
					query[dataSet.name]=sql;
					
				});
				return JSON.stringify(query);
				
				function getSelectPart(){
					var pre=" ";
					if(me.sliceDimension){
						pre=" "+me.sliceDimension.colName+",";
					}
					if(me.aggregateMethod==="count"){
						if(me.aggregateDimension&&me.aggregateDimension.name!="*"){
							return pre+" count(distinct "+me.aggregateDimension.colName+") ";
						}else{
							return pre+" count(*) ";
						}
					}
					if(me.aggregateMethod==="max"){
						if(me.aggregateDimension){
							return pre+" max("+me.aggregateDimension.colName+") ";
						}else{
							return pre+" count(*) ";
						}
					}
					if(me.aggregateMethod==="min"){
						if(me.aggregateDimension){
							return pre+" min("+me.aggregateDimension.colName+") ";
						}else{
							return pre+" count(*) ";
						}
					}
					if(me.aggregateMethod==="average"){
						if(me.aggregateDimension){
							return pre+" avg("+me.aggregateDimension.colName+") ";
						}else{
							return pre+" count(*) ";
						}
					}
					
					
				}
				function getConditionPart(dataSet){
					if(!dataSet){
						return " ";
					}
					var condition = dataSet.getCondtion();
					if(condition&&condition!=""){
						return " where "+condition;
					}
					
					return "";
					
				}
				function getGroupPart(){
					if(!me.sliceDimension){
						return " ";
					}
					if(me.sliceMethod=="group by"){
						return " group by "+me.sliceDimension.colName+" ";
					}
				}
				
				
			};
			function render(chartOptions){ 
				
				   
				var chartDom = me.container.find(".chart").empty();
				
				if(chartOptions.chart.type=="map"){
					chartDom.highcharts("Map",chartOptions);
				}else{
					chartDom.highcharts(chartOptions);
				}
				chartDom.highcharts().controller=me; //from highchart point to idat chart
				  
				me.timeEnd(); 
			}
		}
	}
})(jQuery);


