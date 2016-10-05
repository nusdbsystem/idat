(function($){ 
	
	'use strict';
	IDAT.DataSetController = function(options){
		this.op=$.extend({},IDAT.DataSetController.defaultOptions,options); 
		this.container=$(this.op.container);
		this.model=this.op.dataSet;
		this.type="dataSetController";
		
		this.id=IDAT.Controller.nextId();
		this.init(); 
		
	}
	IDAT.DataSetController.defaultOptions={
		isCurrent:false,
		hasDetail:false,
		container:{},
		dataSet:{},
		index:-1
	}

	IDAT.DataSetController.prototype={
		init:function(){ 

			var me = this; 
			
			console.log("dataSet controller init...");
			
			me.app= IDAT.AppController.singleton;
			me.explore= IDAT.ExploreController.singleton;
			
			this.render();
			
		},
		render:function(){
			
			var me = this;
			
			var names = me.model.name.split("_");
			
			
			me.container.empty();
			var source = $("#dataSet_template").html();
			var template = Handlebars.compile(source); 
			var html= template({names:names});
			me.container.html(html);
			me.container.find(".circle").css("border-color",IDAT.Color(me.model.id));
			
			me.initCharts();
			 
			me.bind();
  
		},
		initCharts : function(){
			var me =this;
			if(me.op.hasDetail){ 
				if(!me.model.charts||me.model.charts.length==0){
					var chart = new IDAT.Chart(); 
					chart.currentDataSets=[me.model];
					me.model.charts=[chart];
				}  
				
				$.each(me.model.charts,function(index,chart){
					var container=$('<section></section>').attr("id","chart_"+chart.id).appendTo(me.container); 
					new IDAT.ChartController({parent:me,chart:chart,index:index,container:container});
				});
				me.lastIndex=me.model.charts.length;
			}
			
		},
		bind:function(){
	
		},
		removeChart:function(chart){
			this.model.charts.removeObj(chart);  
		},
		addChart:function(chart){
			var newChart = chart.clone();  
			this.model.charts.push(newChart);
			var container=$('<section></section>').attr("id","chart_"+newChart.id).appendTo(this.container);
			new IDAT.ChartController({parent:this,chart:newChart,index:this.lastIndex++,container:container});
			$('article').jmpress("init",container);
			$('article').jmpress("select",container);
			
		},
		addChild:function(dataSet){
			if(!this.model.children){
				this.model.children=[];
			}
			this.model.children.push(dataSet);
			IDAT.send("addDataSet",dataSet);
			IDAT.send("drillDown",dataSet);
			 	
		},
		destroy:function(){
			
		},
		toNormal:function(){
			var me=this; 
			me.op.isCurrent=false;
			$("#currentDataSet").hide();
			$("#currentDataSet").children().appendTo(me.originalContainer);
			me.originalContainer.show(); 
			me.container=me.originalContainer;
			me.container.find("h2").removeClass("small");
		},
		toCurrent:function(){
			var me=this;
			setTimeout(function(){
				me.op.isCurrent=true;
				
				if(!me.op.hasDetail){
					me.op.hasDetail=true; 
					me.render();  
				} 
				me.container.hide();
				me.container.children().appendTo($("#currentDataSet"));
				me.originalContainer=me.container;
				me.container=$("#currentDataSet");
				
				$("#currentDataSet").show();
				$("#currentDataSet").data("controller",me);
				me.container.find("h2").addClass("small");
			},500);
			
		}
	}
	
})(jQuery);
