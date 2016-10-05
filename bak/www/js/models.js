(function(){

	IDAT.store={
		data:{},
		importData:function(data){
			var me = this;
			var types=["attr","dataSet","chart"];
			var finishFlag={};
			$.each(types,function(index,type){
				me.data[type]={};
				var typeUpCase= type.substring(0,1).toUpperCase()+type.substring(1);
				var maxId=0; 
				$.each(data[type],function(index,item){  
					me.data[type][item.id]= new IDAT[typeUpCase](item);
					if(item.id>maxId){
						maxId=item.id
					}
				});  
				IDAT[typeUpCase].idSequence=maxId+1;  
				
			}); 
			 
			IDAT.DataSource=data.dataSource;
			
			bindLinks();
		
			function bindLinks(){
				$.each(me.data,function(type,datas){
					$.each(datas,function(id,item){
						item.bindLinks();
					});
					
				});
			}
		},
		outportData:function(){
			var me = this;
			var types=["attr","dataSet","chart"];
			var result={};
			$.each(types,function(index,type){
				var temp=[];
				var typeUpCase= type.substring(0,1).toUpperCase()+type.substring(1);
				var maxId=0; 
				$.each(me.data[type],function(index,item){  
					temp.push(item.unBindLinks()); 
				});  
				result[type]=temp;
			});  
			result.dataSource=$.extend({},IDAT.DataSource);
			
			delete result.dataSource.password;
			
			download(JSON.stringify(result));
		
			function download(text) {
				  var pom = document.createElement('a');
				  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
				  pom.setAttribute('download', "data.json"); 
				  pom.style.display = 'none';
				  document.body.appendChild(pom); 
				  pom.click(); 
				  document.body.removeChild(pom);
			} 
		},
		load:function(callback){ //load all data
			var me = this;
			var types=["attr","dataSet","chart"];
			var finishFlag={};
			$.each(types,function(index,type){
				finishFlag[type]=false;
				me.data[type]={};
				$.ajax({
					url:IDAT.Interface.data+IDAT.DataSource.tableName+"/"+type+".json",
					contentType:"text/json",
					success:function(data){
						var typeUpCase= type.substring(0,1).toUpperCase()+type.substring(1);
						var maxId=0;
						$.each(data,function(index,item){  
							me.data[type][item.id]= new IDAT[typeUpCase](item);
							if(item.id>maxId){
								maxId=item.id
							}
						}); 
						IDAT[typeUpCase].idSequence=maxId+1;
						checkFinish(type);
					},
					error:function(e){
						console.log(e);
						checkFinish(type);
					}
				});
			}); 
			
			function checkFinish(type){
				
				finishFlag[type]=true;
				
				for(var i=0;i<types.length;i++){
					var flag=finishFlag[types[i]]; 
					if(!flag){
						return ;
					}
					
				}
				
				bindLinks();
				
				callback(); 
			}
			
			function bindLinks(){
				$.each(me.data,function(type,datas){
					$.each(datas,function(id,item){
						item.bindLinks();
					});
					
				});
			}
			
		},
		refresh:function(callback){
			this.data={};
			this.load(callback); 
		},
		find:function(type,id){ //get a object or a set
			var datas=this.data[type];
			
			if(!datas){
				return;
			}
			if(id!=undefined){
				return datas[id];
			}else{
				var results=[];
				$.each(datas,function(name,value){
					results.push(value);
				})
				return results;
			}
			 
		},
		add:function(type,object){
			var datas=this.data[type];
			
			if(!datas){
				return;
			}
			
			datas[object.id]=object;
			return;
		}
	};
		
	IDAT.Attr= function(obj){  //attr is meta data ,don't need to clone
//		"colName":		
//		"name":			
//		"isTop":		
//		"hasChild":		
//		"child":		
//		"canSlice":		
//		"canMeasure":	
//		"canGroup":
//		"isNum":		
//		"chartTypes":  
		
		$.extend(this,obj);
	};
	IDAT.Attr.prototype={
		getCondition:function(value){
			if(this.get("isNum")){
				return " "+this.get("colName")+"="+value+" ";
			}else{
				return " "+this.get("colName")+"='"+value+"' ";
			}
			
		},
		bindLinks:function(){
			if(this.child!=undefined){
				this.child=IDAT.store.find("attr",this.child);
			} 
		},
		unBindLinks:function(){
			var obj= $.extend({},this);
			if(obj.child!=undefined){
				obj.child=obj.child.id;
			} 
			return obj;
		},
		get:function(name){
			return this[name];
		},
		set:function(name,value){
			this[name]=value;
		}
			
			
	}
	
	 
	IDAT.DataSet = function(obj){
//		"name":			
//		"parent":		
//		"mergedFrom":	 

		$.extend(this,obj);
	};
		
	IDAT.DataSet.prototype={
 	 
		clone:function(){
			var dataSet=new  IDAT.DataSet({
				"id":IDAT.DataSet.nextId(),
				"name":this.get("name"),
				"shortName":this.get("shortName"),
				"parent":this.get("parent"), 
				"condition":this.get("condition"),
				"mergedFrom":this.get("mergedFrom"),
				"charts":this.get("charts")
			});
			IDAT.store.add("dataSet",dataSet);
			
			return dataSet;
		},
		deepClone:function(){
			var dataSet= this.clone();
			if(this.get("parent")){
				dataSet.parent=this.parent.deepClone() ;
			} 
			var mergedFrom = this.get("mergedFrom");
			var newMergedFrom=[]; 
			if(mergedFrom){
				$.each(mergedFrom,function(index,item){
					newMergedFrom.push(item.deepClone());
				});
				dataSet.mergedFrom=newMergedFrom ;
			}
			return dataSet;
		},
		getFullCondition:function(){
			var mergedFrom=this.get("mergedFrom");
			if(mergedFrom&&mergedFrom.length>0){
				return mergeCondition(mergedFrom);
			}else{
				var parent=this.get("parent");
				if(parent){
					return parent.getFullCondition()+" and "+this.get("condition");
				}else{
					return this.get("condition");
				}
				
			}
			
			function mergeCondition(dataSets){
				var conditionsTree={};
				$.each(dataSets,function(index,dataSet){
					var conditions=dataSet.getFullCondition().split(' and ');
					var node=conditionsTree;
					for(var index=0;index<conditions.length;index++){
						if(!node[conditions[index]]){
							node[conditions[index]]={};
						}
						node=node[conditions[index]];
					}
				});
				
				return getConditionFromNode(conditionsTree);
				
				function getConditionFromNode(node){
					var condition=[];
					
					$.each(node,function(name,item){
						var nextCondition=getConditionFromNode(item);
						if(nextCondition==""){
							condition.push(name);
						}else{
							condition.push(name +" and "+nextCondition);
						}
						
					})
					
					if(condition.length==0){
						return "";
					}else if(condition.length==1){
						return condition[0];
					}
					var result="(";
					$.each(condition,function(index,item){
						if(item.indexOf("and")!=-1){
							result+=" ("+item+") or ";
						}else{
							result+=" "+item+" or "
						}
					})
					result=result.substr(0,result.lastIndexOf("or"))+")";
					return result;
					
				}
				
			}
			
		},
		bindLinks:function(){
			if(this.parent!=undefined){
				this.set("parent",IDAT.store.find("dataSet",this.parent));
			} 
			if(this.children&&this.children.length>0){
				var temp=[];
				$.each(this.children,function(index,item){
					temp.push(IDAT.store.find("dataSet",item));
				})
				
				this.set("children",temp);
			}
			if(this.charts&&this.charts.length>0){
				var temp=[];
				$.each(this.charts,function(index,item){
					temp.push(IDAT.store.find("chart",item));
				})
				
				this.set("charts",temp);
			}
			
		},
		unBindLinks:function(){
			var obj= $.extend({},this);
			if(obj.parent!=undefined){
				obj.parent=obj.parent.id;
			} 
			if(obj.children&&obj.children.length>0){
				var temp=[];
				$.each(obj.children,function(index,item){
					temp.push(item.id);
				}) 
				obj.children=temp;
			}
			if(obj.charts&&obj.charts.length>0){
				var temp=[];
				$.each(obj.charts,function(index,item){
					temp.push(item.id);
				})
				obj.charts=temp;
			}
			return obj;
		},
		get:function(name){
			return this[name];
		},
		set:function(name,value){
			this[name]=value;
		}
	
	};
	
	
	
	IDAT.DataSet.idSequence=1;
	IDAT.DataSet.nextId=function(){
		return IDAT.DataSet.idSequence++;
	}
	  
	IDAT.Chart= function(obj){
//		"name":				
//		"description":		 
//		"sliceDimension":		
//		"currentDataSets":				
//		"nextDataSets":					
//		"aggregateMethod":		
//		"aggregateDimension":	
//		"chartDefine":			
//	  
		$.extend(this,obj);
	} 
	IDAT.Chart.prototype={
		clone:function(){
			var chart = new IDAT.Chart({
				"id":IDAT.Chart.nextId(),
				"name":this.get("name"),
				"description":this.get("description"),
				"sliceDimension":this.get("sliceDimension"),
				"currentDataSets":this.get("currentDataSets"), 
				"nextDataSets":this.get("nextDataSets"),
				"aggregateMethod":this.get("aggregateMethod"),
				"aggregateDimension":this.get("aggregateDimension"),
				"groupDimension":this.get("groupDimension"),
				"chartType":this.get("chartType")
			});
			IDAT.store.add("chart",chart);
			
			return chart;
		},
		deepClone:function(){
			var chart = this.clone();
			
			var currentDataSets =this.get("currentDataSets");
			var newCurrentDataSets=[];
			if(currentDataSets){
				$.each(currentDataSets,function(index,dataSet){
					newCurrentDataSets.push(dataSet.deepClone());
				});
				chart.set("currentDataSets",newCurrentDataSets);
				
			}
			
			var nextDataSets =this.get("nextDataSets");
			var newNextDataSets=[];
			if(nextDataSets){
				$.each(nextDataSets,function(index,dataSet){
					newNextDataSets.push(dataSet.deepClone());
				}); 
				chart.set("nextDataSets",newNextDataSets);
			}
				
			return chart;
			
		},
		bindLinks:function(){
			if(this.sliceDimension!=undefined){
				this.set("sliceDimension",IDAT.store.find("attr",this.sliceDimension));
			} 
			if(this.groupDimension!=undefined){
				this.set("groupDimension",IDAT.store.find("attr",this.groupDimension));
			} 
			if(this.aggregateDimension!=undefined){
				this.set("aggregateDimension",IDAT.store.find("attr",this.aggregateDimension));
			} 
			if(this.currentDataSets&&this.currentDataSets.length>0){
				var temp=[];
				$.each(this.currentDataSets,function(index,item){
					temp.push(IDAT.store.find("dataSet",item));
				})
				
				this.set("currentDataSets",temp);
			}
			if(this.nextDataSets&&this.nextDataSets.length>0){
				var temp=[];
				$.each(this.nextDataSets,function(index,item){
					temp.push(IDAT.store.find("dataSet",item));
				})
				
				this.set("nextDataSets",temp);
			}
			 
		},
		unBindLinks:function(){
			var obj= $.extend({},this);
			if(obj.sliceDimension!=undefined){
				obj.sliceDimension=obj.sliceDimension.id;
			} 
			if(obj.groupDimension!=undefined){
				obj.groupDimension=obj.groupDimension.id;
			} 
			if(obj.aggregateDimension!=undefined){
				obj.aggregateDimension=obj.aggregateDimension.id;
			} 
			if(obj.currentDataSets&&obj.currentDataSets.length>0){
				var temp=[];
				$.each(obj.currentDataSets,function(index,item){
					temp.push(item.id);
				})
				
				obj.currentDataSets=temp;
			}
			if(obj.nextDataSets&&obj.nextDataSets.length>0){
				var temp=[];
				$.each(obj.nextDataSets,function(index,item){
					temp.push(item.id);
				})
				
				obj.nextDataSets=temp;
			}
			return obj;
		},
		getQueries:function(){
			var currentDataSets= this.get("currentDataSets");
			var sliceDimension = this.get("sliceDimension");
			var groupDimension = this.get("groupDimension");
			var aggregateDimension = this.get("aggregateDimension");
			var aggregateMethod = this.get("aggregateMethod");
			
			var queries ={};
			currentDataSets.forEach(function(dataSet,index){
				var sql= "select "+ getSelectPart()+"from "+IDAT.DataSource.tableName+" "+dataSet.getFullCondition()+" "+getGroupPart();
				queries[dataSet.get("id")]=sql; 
			});
			return JSON.stringify(queries);
			 
			function getSelectPart(){
				var pre=" ";
				if(sliceDimension&&sliceDimension.get("colName")&&sliceDimension.get("colName")!="*"){
					pre+=sliceDimension.get("colName")+",";
				}
				if(groupDimension&&groupDimension.get("colName")&&groupDimension.get("colName")!="*"){
					pre+=groupDimension.get("colName")+",";
				}
				if(aggregateMethod==="count"){
					if(aggregateDimension&&aggregateDimension.get("colName")&&aggregateDimension.get("colName")!="*"){
						return pre+" count(distinct "+aggregateDimension.get("colName")+") ";
					}else{
						return pre+" count(*) ";
					}
				}else{
					if(aggregateDimension&&aggregateDimension.get("colName")&&aggregateDimension.get("colName")!="*"){
						return pre+" "+aggregateMethod+"("+aggregateDimension.get("colName")+") ";
					}else{
						return pre+" count(*) ";
					}
				}
				 
				
			} 
			function getGroupPart(){
				if(!sliceDimension||!sliceDimension.get("colName")||sliceDimension.get("colName")=="*"){
					return " ";
				}
				if(groupDimension&&groupDimension.get("colName")&&groupDimension.get("colName")!="*"){
					return " group by "+sliceDimension.get("colName")+","+groupDimension.get("colName")+" ";
					
				} 
				return " group by "+sliceDimension.get("colName")+" ";
				 
			}
		},
		get:function(name){
			return this[name];
		},
		set:function(name,value){
			this[name]=value;
		}
		
	};
	
	IDAT.Chart.idSequence=0;
	IDAT.Chart.nextId=function(){
		return IDAT.Chart.idSequence++;
	}
	
	IDAT.ChartDefines={
			"column":{
				
						"chart" : {"backgroundColor": "transparent","type" : "column"},
						"title" : {"text" : "" },
						"subtitle" : {"text" : "" },
						"legend": {
				             "itemStyle":{"color":"#ffffff"}
				        },		
						"xAxis" :   {
							"labels":{
								"style":{"color":"#ffffff"}
							}
						},
						"yAxis" :   {
										"min" : 0,
										"title" : {
											"text" : ""
										},
										"labels":{
											"style":{"color":"#ffffff"}
										}
									},
						  
						"plotOptions": {
							"column": {
				                "stacking": 'normal'
				            },
							"series": { 
								 "point":{
									 "events":{
										 "click":function(e){
											 
											 var chart = e.currentTarget.series.chart;
											 var controller = chart.controller;
											 var value = chart.xAxis[0].categories[e.point.index];
											 var name = e.currentTarget.series.name;
											 var dataSet= controller.getDataSet(name,value);
											 
											 if(this.selected){ 
												 if(dataSet){
													 controller.gotoDataSet(dataSet);
												 }else{ 
													 controller.addDataSet(name,value);
												 }
												 return false;
											 }else{
												 for (var i = 0; i < this.series.data.length; i++) {
						                                this.series.data[i].update({ color: this.series.color }, true, false);
					                             }
												 var color="#f00";
												 if(dataSet){
													 color=IDAT.Color(dataSet.id);
												 }
					                             this.update({ color:color  }, true, false);
					                             this.selected=true;
					                             return false;
											 }  
										 }
										 
									 }
									 
								 }
							}
						},
						"series": [],
						"parseData":function(data,controller){ 
							this.xAxis.categories=data.dimension.keys;
							var valueDict=[];
							$.each(data.dimension.keys,function(index,key){
								valueDict[key]=data.dimension.values[index];
							});
							this.valueDict=valueDict;
							
							this.series=data.series; 
							 
						  
						}
					},
			"column_simple":	{
						
						"chart" : {"backgroundColor": "transparent","type" : "column"},
						"title" : {"text" : null },
						"subtitle" : {"text" : null },
						"xAxis" :   {"labels":{"enabled":false},"style":{"color":"#ffffff"}},
						"yAxis" :   {
										"min" : 0,
										"title" : {
											"text" : null
										},
										"labels":{
											"enabled":false,
											"style":{"color":"#ffffff"}
										}
									},
						"legend": {
							
							              "enabled": false
							        },		
						"plotOptions": {
							"column": {
				                "stacking": 'normal'
				            }
						},
						"series": [],
						"parseData":function(data,controller){ 
							this.series=data.series;
						}
					},
				"line":	{
						
						"chart" : {"backgroundColor": "transparent","type" : "line"},
						"title" : {"text" : "" },
						"subtitle" : {"text" : "" },
						"legend": {
				             "itemStyle":{"color":"#ffffff"}
				        },	
						"xAxis" :   {
							"labels":{
								"style":{"color":"#ffffff"}
							}
						},
						"yAxis" :   {
										"min" : 0,
										"title" : {
											"text" : ""
										},
										"labels":{
											"style":{"color":"#ffffff"}
										}
									},
						"plotOptions": {
							"series": {
								 "point":{
									 "events":{
										 "click":function(e){
											 var chart = e.currentTarget.series.chart;
											 var controller = chart.controller;
											 var value = chart.xAxis[0].categories[e.point.index];
											 var name = e.currentTarget.series.name;
											 var dataSet= controller.getDataSet(name,value);
											 
											 if(this.selected){ 
												 if(dataSet){
													 controller.gotoDataSet(dataSet);
												 }else{ 
													 controller.addDataSet(name,value);
												 }
												 return false;
											 }else{
												 for (var i = 0; i < this.series.data.length; i++) {
						                                this.series.data[i].update({ color: this.series.color }, true, false);
					                             }
												 var color="#f00";
												 if(dataSet){
													 color=IDAT.Color(dataSet.id);
												 }
					                             this.update({ color:color  }, true, false);
					                             this.selected=true;
					                             return false;
											 }  
										 }
										 
									 }
									 
								 }
							}
						},
						"series": [],
						"parseData":function(data,controller){
							var valueDict=[];
							$.each(data.dimension.keys,function(index,key){
								valueDict[key]=data.dimension.values[index];
							});
							this.valueDict=valueDict;
							 
							this.xAxis.categories=data.dimension.keys;
							this.series=data.series;
						}
					},
				"line_simple":	{
						
						"chart" : {"backgroundColor": "transparent","type" : "line"},
						"title" : {"text" : null },
						"subtitle" : {"text" : null },
						"xAxis" :   {"labels":{"enabled":false,"style":{"color":"#ffffff"}}},
						"yAxis" :   {
										"min" : 0,
										"title" : {
											"text" : null
										},
										"labels":{
											"enabled":false,
											"style":{"color":"#ffffff"}
										}
									},
						"legend": {
							              "enabled": false
							        },		 
						"series": [],
						"parseData":function(data,controller){
							this.series=data.series;
						}
					},
			"pie":	{
						
						"chart" : {"backgroundColor": "transparent","type" : "pie"},
						"title" : {"text" : "" },
						"subtitle" : {"text" : "" },
						"xAxis" :   { },
						"yAxis" :   {
							"min" : 0,
							"title" : {
								"text" : null
							} 
							 
						},
						"legend": {
				             "itemStyle":{"color":"#ffffff"}
				        },	
						"plotOptions": {
							"pie":{
								"dataLabels":{
									"color":"#ffffff",
									"formatter":function(){
										
										return "total:"+this.y;
									}
								}
							},
							"series": {
								 "point":{
									 "events":{
										 "click":function(e){ 
											 if(this.isSelected){
												 var chart = e.currentTarget.series.chart;
												 var controller = chart.controller;
												 var value = chart.xAxis[0].categories[e.point.index];
												 var name = e.currentTarget.series.name;
												 controller.chooseDataSet(name,value);
												 return false;
											 }else{
												 for (var i = 0; i < this.series.data.length; i++) {
						                                this.series.data[i].isSelected=false;
					                             }
					                             this.isSelected=true;
					                             return false;
											 }  
											 
										 }
										 
									 }
									 
								 }
							}
						},
						"series": [],
						"parseData":function(data,controller){
							//this need to be done later 
							this.xAxis.categories=data.dimension.keys;
							
							var valueDict=[];
							$.each(data.dimension.keys,function(index,key){
								valueDict[key]=data.dimension.values[index];
							});
							this.valueDict=valueDict;
							
							
							this.series=data.series;
							this.series[0].type="pie";
							var newData =[];
							$.each(data.series[0].data,function(index,temp){
								newData.push([data.dimension.keys[index],temp]);
							});
							this.series[0].data=newData;
							
						}
					},
				"pie_simple":	{
						
						"chart" : {"backgroundColor": "transparent","type" : "pie"},
						"title" : {"text" : null },
						"subtitle" : {"text" : null },
						"xAxis" :   {"labels":{"style":{"color":"#ffffff"}}},
						"yAxis" :   {
										"min" : 0,
										"title" : {
											"text" : null
										},
										"labels":{
											"enabled":false,
											"style":{"color":"#ffffff"}
										}
									},
						"legend": {
							              "enabled": false
							        },		
						 "plotOptions":{
							 "pie":{
									"dataLabels":{
										"color":"#ffffff"
									}
								}
						 },
						"series": [],
						"parseData":function(data,controller){
							 
							 
							this.series=data.series;
							this.series[0].type="pie";
							var newData =[];
							$.each(data.series[0].data,function(index,temp){
								newData.push([data.dimension.keys[index],temp]);
							});
							this.series[0].data=newData;
						}
					},		
			"map":	{
				
						"chart" : {"backgroundColor": "transparent","type" : "map"},
						"title" : {"text" : "Disease occurence " },
						"subtitle" : {"text" : "Source: IDAT" },
						"legend": {
				             "itemStyle":{"color":"#ffffff"}
				        },	
						"mapNavigation": {
							"enabled": true,
							"buttonOptions": {
								"verticalAlign": "bottom"
							}
						},
						"colorAxis": {
							"min": 0,
							"style":{"color":"#ffffff"}
						}, 
						"plotOptions": {
							"series": {
								 "point":{
									 "events":{
										 "click":function(e){
											 var chart = e.currentTarget.series.chart;
											 var controller = chart.controller;
											 var value = chart.xAxis[0].categories[e.point.index];
											 var name = e.currentTarget.series.name;
											 controller.chooseDataSet(name,value);
											 return false;
										 }
										 
									 }
									 
								 }
							}
						},
						"legend": {
							"layout": "vertical",
							"borderWidth": 0,
							"backgroundColor": "rgba(255,255,255,0.85)",
							"floating": false,
							"verticalAlign": "middle",
							"align": "left",
							"y": 25,
							"style":{"color":"#ffffff"}
						},
						"series": [],
						"parseData":function(data,controller){ 
							var mapOptions={
									"mapData": Highcharts.maps['countries/sg/sg-all'],
									"joinBy": "hc-key",
									"name": "",
									"showInLegend": false,
									"states": {
										"hover": {
											"color": "#BADA55"
										}
									},
									"dataLabels": {
										"enabled": true,
										"format": "{point.name}"
									}
								}
							var sgMap = {"Central Singapore":"sg-3595","South West":"sg-6400","North West":"sg-6401","North East":"sg-6402","South East":"sg-6403"};
							var finalData=[]; 
							$.each(data.dimension.keys,function(index,value){
								var temp = {"hc-key":sgMap[value],"value":data.series[0].data[index]};
								finalData.push(temp); 		
							});  
							mapOptions.name=data.series[0].name;
							mapOptions.data=finalData; 
							if(!this.series){
								this.series=[];
							}
							this.series.push(mapOptions);
							
						}
						 
					}
			}  
})();