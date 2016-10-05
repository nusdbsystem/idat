(function($){ 
	
	'use strict';
	IDAT.JobController = function(options){
		this.op=$.extend({},IDAT.JobController.defaultOptions,options) 
		
		this.id=IDAT.Controller.nextId();
		this.jobs=[];
		this.currentJob;
		this.init(); 
	}
	IDAT.JobController.defaultOptions={
		width: 300,
		height:1000
	}

	IDAT.JobController.prototype={
		init:function(){ 

			console.log("job controller init..."); 
			var me = this; 
			 
			me.container=$("#job"); 
			me.render();
			$("#jobModal").modal({backdrop:false,show:true})
		},
		render:function(){
			var me = this;
			me.container.html(); 
			var source = $("#job_template").html();
			var template = Handlebars.compile(source); 
			var html   = template(me.folders); 
			
			me.container.html(html);  
			me.renderJobList();
			me.bind();
			
		},
		showImportPanel:function(){
			var me = this;
			
			//render
			var jobContainer = $("#jobContainer");
			
			jobContainer.html(); 
			var source = $("#importJob_template").html();
			var template = Handlebars.compile(source); 
			var html   = template({});  
			jobContainer.html(html); 
			
			//bind
			$("#jobFile").on("change",function(){  
				var file= $(this).val();
				if(file){
					$("#importFileBtn").show();
				}else{
					$("#importFileBtn").hide(); 
				}
				
			});
		  
			$("#importFileBtn").bind("click",function(){
				loadFile();
				
			});
			
			function loadFile(){ 
				var password = $("#inputPassword").val();
				if(!password){
					alert("please input database Password !");
					return;
				}
			
				var file=$("#jobFile").prop("files")[0];
				
				readBlobAsText(file, function (err, result) {
			        if (err) {
			            alert(err.name + '\n' + err.message);
			            return;
			        }
			        var job=JSON.parse(result);
			        if(!job.name){
			        	job.name=file.name;
			        }
			        job.dataSource.password=password;
			        me.addJob(job);
			       
				 	
			    }); 
			}
			
			function readBlobAsText(blob, callback) {
			    var fr = new FileReader();
			    fr.onload = function (e) {
			        var fr = e.currentTarget;
			        if (typeof callback === 'function') {
			            callback.call(fr, null, fr.result);
			        }
			    };
			    fr.onerror = function (e) {
			        var fr = e.currentTarget;
			        if (typeof callback === 'function') {
			            callback.call(fr, fr.error, null);
			        }
			    };
			    fr.readAsText(blob);
			}
			
		},
		showCreatePanel:function(){
			var me = this;
			
			//render
			var jobContainer = $("#jobContainer");
			
			jobContainer.html(); 
			var source = $("#createJob_template").html();
			var template = Handlebars.compile(source); 
			var html   = template({});  
			jobContainer.html(html); 
			
			
			//bind
			
			$("#createJobBtn").bind("click",function(){
				 var dataSource = $("#createJobForm").serializeObject();
				 
				 var job={};
				 job.name=dataSource.name;
				 job.dataSource=dataSource;
				 
				 me.addJob(job);				 				 
				 
			});
			
			
			
			
		},
		bind:function(){
			var me=this;
			$("#showDataSource").bind("click",function(){
				
				$("#jobModal").modal("toggle");
			});
			
			
			
			$("#outportJobBtn").bind("click",function(){
				IDAT.store.outportData();
				return false;
			});
			
			$("#createJob").bind("click",function(){
				 me.showCreatePanel();
			});
			
			$("#importJob").bind("click",function(){
				  me.showImportPanel();
			}); 
			me.container.find(".btn-close").bind("click",function(){
				$("#jobModal").modal("hide");
			})
			
		},
		addJob:function(job){
			var me=this; 
			me.jobs.push(job);
			me.currentJob=job;
			me.renderJobList();
			
			if(job.attr){
				me.showJob();
			}else{
				generateAttr(job,function(){
					job.dataSet=[
					     {
					    	"id":					0,
					    	"name":					"all", 
					    	"shortName":			"all",
					    	"charts":				[0],
					 		"condition":				"where 1=1", 
							"children":				[]				
					     } 
					 ];
					 job.chart=[
					     {
					    	 "id":0,
					    	 "name":"all",
					    	 "description":"whole data",
					    	 "currentDataSets":		[0],		
					    	 "sliceDimension":		0,
					    	 "groupDimension":		0,
					 		"aggregateMethod":		"count",
					 		"aggregateDimension":	0,
					 		"chartType":			"pie"
					     } 
					 ]; 
					me.showJob();
				}); 
			}
			
			
			function generateAttr(job,callback){
				var dataSource=job.dataSource;
				
				$.ajax({
					url:IDAT.Interface.getAttr,
					data:dataSource,
					success:function(data){
						var tableDefine=JSON.parse(data);
						var attr=[{
							"id":0,
							"isSelected":true,
							"colName":"*",
							"name":"*",
							"shortName":"*",
							"isTop":true,
							"hasChild":false, 
							"isNum":false,
							"canGroup":true,
							"canSlice":true,
							"canMeasure":true,
							"noteTemplate":"Choose all",
							"chartTypes":["pie"]  
						}];
						$.each(tableDefine.columns,function(index,column){
							var temp={
								"id":index+1,
								"isSelected":true,
								"colName":column.dbName,
								"name":column.dbName,
								"shortName":column.dbName.substr(0,2).toUpperCase(),
								"isTop":true,
								"hasChild":false, 
								"isNum":column.javaType=="String"?false:true,
								"canSlice":true,
								"canGroup":true,
								"canMeasure":column.javaType=="String"?false:true,
								"noteTemplate":"{value}",
								"chartTypes":["column","line","pie"]
							}
							attr.push(temp);
							 
						});
						
						job.attr=attr; 
						
					 	callback();
					},
					error:function(e){
						console.log(e);
					}
				
				
				});
				
			
			}
		},
		removeJob:function(job){
			var me=this; 
			me.jobs.removeObj(job); 
			me.renderJobList();
			
			job.destroy();
			 
		},
		renderJobList:function(){
			var me = this; 
			//render
			var container = $("#jobList");
			
			container.html(); 
			var source = $("#jobList_template").html();
			var template = Handlebars.compile(source); 
			var html   = template(me.jobs);  
			container.html(html); 
			$("#jobNum").html(me.jobs.length);
			 
			//bind
			
			container.find(".showJob").bind("click",function(){
				var index=$(this).attr("index");
				
				var job = me.jobs[index];
				me.currentJob=job;
				me.showJob();
				
			});
			container.find(".changeJob").bind("click",function(){
				var index=$(this).attr("index");
				var job = me.jobs[index];
				me.currentJob=job;
				me.showJob();
				me.changeJob();
			});
			container.find(".removeJob").bind("click",function(){
				var index=$(this).attr("index");
				var job = me.jobs[index];
				if(job==me.currentJob){
					alert("Sorry, You can't remove current Job!");
					return;
				}
				me.removeJob(job);
				
			});
			
		},
		showJob:function(){
			var me = this; 
			
			if(!me.currentJob){
				return;
			}
			

			//render
	 
			var jobContainer = $("#jobContainer");
		
			jobContainer.html(); 
			var source = $("#jobDetail_template").html();
			var template = Handlebars.compile(source); 
			var html   = template(me.currentJob);  
			jobContainer.html(html); 
			 
			new AttrEditor({data:me.currentJob.attr,container:jobContainer.find(".attrContainer")})
			
			//bind
			  
		},
		changeJob:function(){
			 
			var me = this;
			
	        try{
	        	
		 		IDAT.store.importData(me.currentJob);
		 	}catch(e){
		 		alert("");
		 		return;
		 	} 
		 	$.ajax({
				url:IDAT.Interface.config,
				data:IDAT.DataSource,
				success:function(message){ 
					if(message!="success"){
						alert(message);
						return;
					} 
		    		IDAT.send("startJob");
				},
				error:function(e){
					alert(e); 
				}
			});
			
		},
		destroy:function(){
			
		}    
	}
	
	IDAT.JobController.idSequence=1;
	IDAT.JobController.nextId=function(){
		return IDAT.JobController.idSequence++;
	}
	
	
	var AttrEditor=function(option){
		
		this.data=option.data; // an Array of Attrs
		this.container=$(option.container);  // a table
		
		this.currentType=AttrEditor.types.findBy("name","name");
		
		this.init();
		 
	}
	 
	AttrEditor.prototype={
			init:function(){
				var me =this;
				me.render();
			},
			render:function(){
				var me=this;
				
				//types to choose
				var typeContainer=me.container.find(".typeContainer");
				typeContainer.empty();
				
				$.each(AttrEditor.types,function(index,type){
					if(type.name==="isSelected"){
						return;
					}
					var source ="<a class='btn'>{{name}}</a>"
					var template = Handlebars.compile(source); 
					var html   = template(type);  
					$(html).appendTo(typeContainer)
						.addClass(type==me.currentType?"btn-primary":"btn-default")
						.bind("click",function(){
							me.currentType=type;
							me.render();
						});
				});
				
				var editContainer=me.container.find(".editContainer");
				editContainer.empty();
				
				$.each(me.data,function(index,attr){
					if(attr.colName==="*"){
						return;
					}
					var source ="<tr {{#unless isSelected}}class='unSelected'{{/unless}}><td>"+AttrEditor.types[0].template+"</td><td>{{colName}}</td><td>"+me.currentType.template+"</td></tr>";
					var template = Handlebars.compile(source); 
					var html   = template(attr);  
					var dom=$(html).appendTo(editContainer);
					
					dom.find(".edit").on("change",function(){
							var value=$(this).val();
							if(me.currentType.type==="checkbox"){
								value=$(this).prop("checked");
							}
							attr[me.currentType.name]=value;
						});
					dom.find(".isSelected").on("change",function(){
						var value=$(this).prop("checked");
						attr["isSelected"]=value;
						if(value){
							$(this).parent().parent().removeClass("unSelected");
						}else{
							$(this).parent().parent().addClass("unSelected");
						}
						
					});
				});
				 
			} 
	}
	
	AttrEditor.types=[
						      
						{
							name:"isSelected",
							type:"checkbox",
							template:"<input type='checkbox' class='isSelected'  {{#if isSelected}} checked {{/if}}/>"
							
						},
						{
							name:"name",
							type:"text",
							template:"<input class='edit' type='text' value='{{name}}'></input>"
						},      
						{
							name:"shortName",
							note:"to display in short",
							type:"text",
							template:"<input class='edit' type='text' value='{{shortName}}'></input>"
						},      
						{
							name:"isNum",
							type:"checkbox",
							template:"<input type='checkbox' class='edit'  {{#if isNum}} checked {{/if}}/>"
						},      
						{
							name:"canSlice",
							type:"checkbox",
							template:"<input type='checkbox' class='edit'  {{#if canSlice}} checked {{/if}}/>"
						},     
						{
							name:"canGroup",
							type:"checkbox",
							template:"<input type='checkbox' class='edit'  {{#if canGroup}} checked {{/if}}/>"
						},      
						{
							name:"canMeasure",
							type:"checkbox",
							template:"<input type='checkbox' class='edit'  {{#if canMeasure}} checked {{/if}}/>"
						} 
	      
		            ]
	
	
	
})(jQuery);


