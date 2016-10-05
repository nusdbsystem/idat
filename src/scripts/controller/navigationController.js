(function($){ 
	
	'use strict';
	IDAT.NavigationController = function(options){ 
		this.op=$.extend({},IDAT.NavigationController.defaultOptions,options) 
		 
		this.currentNode;
		this.selectedNodes=[];
		
		this.id=IDAT.Controller.nextId();
		
		this.init(); 
		this.initializeBreadcrumbTrail();
	}

	
	 
	IDAT.NavigationController.defaultOptions={
		width: 300,
		height:1000,  
		radius:240,
		container:"#sunburst", 
		colors:IDAT.Color,
		btn:{ 
			w:50,h:20,s:3,r:3
		},
		bread:{
			w: 55, h: 30, s: 3, t: 10 
		}
		
	}

	IDAT.NavigationController.prototype={
		init:function(){ 
			console.log("navigation controller init...");
			
			var me = this; 
			
			me.initData();
			$(me.op.container).empty();
			me.svg = d3.select(me.op.container).append("svg")
		    	.attr("width", me.op.width)
		    	.attr("height", me.op.height)
		    	.append("g")
		    	.attr("transform", "translate(10,50)");
			
			me.partition = d3.layout.partition()
		    .sort(function(a, b) { return d3.ascending(a.name, b.name); })
		    .size([Math.PI/2, me.op.radius]);
		   
			addBtn("DEL",1,function(d){me.removeNode();}); 
			       
			function addBtn(text,index,callback){
				var btn=me.op.btn;
				var g = me.svg.append("svg:g")
			      .attr("transform", function(d, i) {
			              return "translate(0, -30)";
			           });
				
				  g.append("svg:rect")
				      .attr("rx", btn.r)
				      .attr("ry", btn.r)
				      .attr("width", btn.w)
				      .attr("height", btn.h)
				      .style("fill", function(d) {return me.op.colors(index);})
				      .on("click", callback) 
				
					  g.append("svg:text")
				      .attr("x", btn.w / 2)
				      .attr("y", btn.h / 2)
				      .attr("dy", "0.35em")
				      .attr("fill","#fff")
				      .attr("text-anchor", "middle")
				      .text(function(d) { return text; });
								
			}
			
			
			
			me.currentNode=me.root;
			
			me.parse();
			me.render(); 
			me.selectedNodes=[me.root];
			d3.select("#node_"+me.root.id).classed("selected", true);
			
			IDAT.subscribe("addDataSet",this,function(dataSet){
			
				var node = generateNode(dataSet);
				
				me.addNode(node);
				
			});
			IDAT.subscribe("changeDataSet",this,function(dataSet){
			
			 	var node=me.getNodeById(dataSet.id);
			 	me.gotoNode(node);
			 	
			});
			
		},
		initData:function(){
			
			var dataRoot =IDAT.store.find("dataSet",0);
			
			this.root= generateNode(dataRoot);
			 
		},
		
		parse:function(){
			var me = this;
			var luminance = d3.scale.sqrt()
			    .domain([0, 1e6])
			    .clamp(true)
			    .range([90, 20]);
			
			me.arc = d3.svg.arc()
		    .startAngle(function(d) { return  d.x +Math.PI/2; })
		    .endAngle(function(d) {  return  d.x + d.dx - .01 / (d.depth + .5)+Math.PI/2 ; })
		    .innerRadius(function(d) { return  getRadius(d.depth) })
		    .outerRadius(function(d) { return  getRadius(d.depth + 1) - 1 });
			
			// Compute the initial layout on the entire tree to sum sizes.
			  // Also compute the full name and fill color for each node,
			  // and stash the children so they can be restored as we descend. 
			  
			me.partition
		      .value(function(d) { return d.size; });
		      
			 
			function getRadius(depth){ 
				  
				var d= depth-me.currentNode.depth; 
				 
				if(depth==0){
					return 0;
				}
				var radius=0;
			  	for(var i=0;i<depth;i++){
			  		radius+=dr(i);
			  	} 
			  	return me.op.radius*radius;
			  	
			  	function dr(depth){
			  		
			  		var d= depth-me.currentNode.depth; 
			  		d=d<0?-d:d;
			  		
			  		return d<3?(d<2?(d<1?0.25:0.18):0.1):0.04;
			  		
			  	}
			  
			  }
			
		
		},
		render:function(){
			var me=this;
			me.nodes=me.partition.nodes(me.root);
				 
			me.path = me.svg.selectAll("path")
			      .data(me.nodes,function(d) { return d.id; });
			       
			me.path.enter().append("path")
			      .style("fill", function(d) { return me.op.colors(d.id); })
			      .style("opacity",0.7)
			      .attr("id",function(d){return "node_"+ d.id})  
			      .on("click", function(d){ 
			      		me.selectNode(d); 
			      });
			
			me.path.transition()
		      .duration(1000)
		      .attr("d", me.arc);
			me.path.exit().remove();
			 
			  
		},
		zoom:function(node){
			if(this.currentNode==node){
				return;
			} 
			this.currentNode=node;
			  
			this.render();
		}, 
		// Given a node in a partition layout, return an array of all of its ancestor
		// nodes, highest first, but excluding the root.
		getAncestors:function(node) {
		  var path = [];
		  var current = node;
		  while (current.parent) {
		    path.unshift(current);
		    current = current.parent;
		  }
		  path.unshift(current); 
		  return path;
		},

		initializeBreadcrumbTrail:function() {
		  	// Add the svg area.
		  	var me=this;
		  	this.trail =this.svg.append("svg:g") 
		      .attr("width", me.op.bread.w)
		      .attr("id", "trail")
		      .attr("transform", function(d, i) {
			              return "translate(0,"+me.op.radius+")";
			           }); 

		  	// Add the label at the end, for the chart num.
			this.updateBreadcrumbs(this.getAncestors(me.root));
		},

		// Generate a string that describes the points of a breadcrumb polygon.
		breadcrumbPoints:function(d, i) {
			  var me=this;
			  var points = [];
			  points.push("0,0");
			  points.push("0," + me.op.bread.h); 
			  points.push(me.op.bread.w/2 + "," + (me.op.bread.h+me.op.bread.t));
			  points.push(me.op.bread.w + ","+me.op.bread.h);
			  points.push(me.op.bread.w + ",0"); 
			  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
			    points.push(me.op.bread.w/2 + "," + me.op.bread.t);
			  }
			  return points.join(" ");
		},

		// Update the breadcrumb trail to show the current sequence and percentage.
		updateBreadcrumbs:function(nodeArray) {
			 var me=this;
			  // Data join; key function combines name and depth (= position in sequence).
			  var g = d3.select("#trail")
			      .selectAll("g")
			      .data(nodeArray, function(d) { return d.name + d.depth; });
			
			  // Add breadcrumb and label for entering nodes.
			  var entering = g.enter().append("svg:g");
			
			  entering.append("svg:polygon")
			      .attr("points", function(d,i){ return me.breadcrumbPoints(d,i)} )
			      .style("fill", function(d) { return me.op.colors(d.id); })
			      .append("svg:title")
			      .text(function(d){return d.note});
			    //  .on("click",onTrailClick);
			
			  entering.append("svg:text")
			      .attr("x", (me.op.bread.w) / 2)
			      .attr("y", (me.op.bread.h+me.op.bread.t)/2)
			      .attr("dy", "0.35em")
			      .attr("text-anchor", "middle")
			      .attr("fill","#fff")
			      .text(function(d) { return d.name.split("_")[0]; });
			 
			  entering.append("svg:text")
//				      .attr("x", me.op.bread.w+10)
//				      .attr("y", (me.op.bread.h+me.op.bread.t)/2)
			      .attr("dx", 0)
			      .attr("dy", "0.35em")
			      .attr("text-anchor", "left")
			      .attr("fill","#fff")
			      .each(function (d) {
					    var arr = d.note.split("\n");
					    if (arr != undefined) {
					        for (var i = 0; i < arr.length; i++) {
					            d3.select(this).append("tspan")
					                .text(arr[i])
					                .attr("dy", i ? "1.2em" : 0)
					                .attr("x", me.op.bread.w+10)
					                .attr("y",(me.op.bread.h)/2)
					                .attr("text-anchor", "left")
					                .attr("class", "tspan" + i);
					        }
					    }
					}); 
		       
			  // Set position for entering and updating nodes.
			  g.attr("transform", function(d, i) {
			    return "translate(0," + i * (me.op.bread.h + me.op.bread.s) + ")";
			  });
			
			  // Remove exiting nodes.
			  g.exit().remove();
			
			  // Make the breadcrumb trail visible, if it's hidden.
			  d3.select("#trail")
			      .style("visibility", "");
		//	  onTrailClick(nodeArray[nodeArray.length-1]);
			  
			  function onTrailClick(node){
				 
				  d3.selectAll("polygon")
                	.style("opacity", function(d) {
                			return d==node?1 : 0.7;
                	}); 
				  
			  	var g= d3.select("#trail").selectAll(".note").data([node],function(d){return d.id});
			  	
			  	g.enter().append("svg:text")
			  	  .classed("note",true)
			  	  .attr("x",60)
			      .attr("y", 10)
			      .attr("dy", "0.35em") 
			      .attr("fill","#fff")
			      .text(function(d) {  return d.note; });
			  	 
			  	g.exit().remove();
			   
			  	
				
			  	return;
			  }      
			      
		
		},
		isNodeSelected:function(node){
			if(this.selectedNodes.indexOf(node)==-1)
				return false;
			return true;
		
		},
		selectNode:function(node){
			var me = this;
			
			if(this.isNodeSelected(node)){  
				me.gotoNode(node);
				IDAT.send("gotoDataSet",IDAT.store.find("dataSet",node.id));
			}else{ 
				this.selectedNodes=[node];
				var ancestors = this.getAncestors(node);
				// Then highlight only those that are an ancestor of the current segment.
				d3.selectAll("path")
                	.style("opacity", function(d) {
                			return d==node ? 1 : 0.7;
                	}); 
				this.updateBreadcrumbs(ancestors); 
			
			} 
			
			return;
		},
	 
		addNode : function(node){ 
			if(this.currentNode=={}){
				return;
			}
			if(!this.currentNode.children){
				delete this.currentNode.size;
				this.currentNode.children=[]; 
			}else{
				var temp=this.currentNode.children.findBy("name",node.name);
				if(temp){
					return;
				}
			}
			this.currentNode.children.push(node); 
		 	this.parse();
		 	this.render();
		},
		removeNode:function(){
			var me = this;
			if(this.selectedNodes.length==0){
				return;
			}
			$.each(this.selectedNodes,function(index,node){ 
				var parent = node.parent;
				if(parent){
					parent.children.splice(parent.children.indexOf(node),1);
					me.op.onDeleteNode(node.id);
				}
			}); 
			this.selectedNodes=[];
			this.parse();
			this.render();
		},
		removeCurrentNode:function(){
			if(!this.currentNode.parent){
				return;
			}
			var parent = this.currentNode.parent;
			if(parent){
				parent.children.splice(parent.children.indexOf(this.currentNode),1);
				this.op.onDeleteNode(node.id);
			} 
			this.zoom(parent);
		},
		gotoNode:function(node){
			var me = this;
			
			if(!this.isNodeSelected(node)){  
				me.selectNode(node);
			}
			
			if(this.currentNode!=node){
				$.each(this.selectedNodes,function(index,node){
					d3.select("#node_"+node.id).classed("selected", false);
					return;
				});
				d3.select("#node_"+node.id).classed("selected", true);
				d3.select("#node_"+this.currentNode.id).classed("selected", false); 
				this.zoom(node);
				this.selectedNodes=[]; 
			}  
		},
		deSelected:function(){
			this.selectedNodes=[];
			this.currentNode={};
		}, 
		getNodeById:function(id){
			return this.nodes.findBy("id",id);
		},
		getSiblings:function(dataSetId){
			 
			var node = this.nodes.findBy("id",dataSetId);
			if(!node||!node.parent){
				return [];
			}  
			var siblings=[];
			$.each(node.parent.children,function(index,node){
				if(node.id!=dataSetId){
					siblings.push(node.id);
				}
			});
			return siblings;
			
		},
		destroy:function(){
			IDAT.unSubscribe("addDataSet",this);
			IDAT.unSubscribe("changeDataSet",this);
			
		}
		    
	}
	 
	 
	function generateNode(data){
				var node={};
				node.id=data.id;
				node.name=data.shortName;
				node.note=data.note?data.note:data.name;
				
				if(data.children&&data.children.length>0){
					node.children=[];
					$.each(data.children,function(index,item){
						node.children.push(generateNode(item));
					});
				}else{
					node.size=1;
				}
			
				return node;
		}
	
})(jQuery);


