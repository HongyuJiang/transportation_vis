d3.csv("./data/links.csv").then(function(links_data){
	d3.csv("./data/result.csv").then(function(UCB_data){
		
		var colorScale1 = d3.scaleSequential(d3.interpolatePiYG);
		
		var colorScale2 = d3.scaleSequential(d3.interpolatePiYG);
		
		var UCB_dict = {}
		
		var PR_dict = {}
		
		
		UCB_data.forEach(function(d){
			
			UCB_dict[d.id] = parseFloat(d.UCB)
			PR_dict[d.id] = parseFloat(d.productionRate)
		})
		
		let UCB_min = d3.min(d3.values(UCB_dict))
		let UCB_max = d3.max(d3.values(UCB_dict))
		
		console.log(UCB_min, UCB_max)
		
		let PR_min = d3.min(d3.values(PR_dict))
		let PR_max = d3.max(d3.values(PR_dict))
		
		let width = 500, height = 1000
		
		var projection = d3.geoMercator()
		.scale(240000)
		.translate([0, 0])
		.center([-74.021807,40.884127])
		
		var svg1 = d3.select('#container1').append('svg')
		.attr('width', width)
		.attr('height', height + 100)
		
		var svg2 = d3.select('#container2').append('svg')
		.attr('width', width)
		.attr('height', height + 100)
		
		let roads_data = []
		
		links_data.forEach(function(d){
			
			d.startX = parseFloat(d.startX)
			d.startY = parseFloat(d.startY)
			d.endX = parseFloat(d.endX)
			d.endY = parseFloat(d.endY)
			
			if(d.startY < 40.876760 && d.startY > 40.702641 && d.startX < -73.905251 && d.startX > -74.022418){

				var start_location = projection([d.startX, d.startY])
				
				var end_location = projection([d.endX, d.endY])
				
				roads_data.push({'id':d.link_id, 'path':[start_location, end_location]})
			}
		})
		
		svg1.append("clipPath")       // define a clip path
		.attr("id", "rect-clip") // give the clipPath an ID
	  .append("rect")            // shape it as an ellipse
		.attr("width", 500)            // position the x-centre
		.attr("height", 1000)            // position the y-centre
		.attr("x", 0)            // set the x radius
		.attr("y", 0); 
		
		svg1.append('g')
		.attr("clip-path","url(#rect-clip)")
		.selectAll('roads')
		.data(roads_data)
		.enter()
		.append('line')
		.attr('x1', d => d.path[0][0])
		.attr('y1', d => d.path[0][1])
		.attr('x2', d => d.path[1][0])
		.attr('y2', d => d.path[1][1])
		.attr('stroke', function(d){
			
			let regularied_value = (UCB_dict[d.id] - UCB_min) / (UCB_max - UCB_min)
			
			return colorScale1(UCB_dict[d.id])
		})
		
		svg1.append("g")
		  .attr("class", "legendLinear")
		  .attr("transform", "translate(20,1020)");

		var legendLinear = d3.legendColor()
		  .shapeWidth(30)
		  .cells(10)
		  .orient('horizontal')
		  .scale(colorScale1);

		svg1.select(".legendLinear")
		  .call(legendLinear);
		  
		svg2.append("clipPath")       // define a clip path
		.attr("id", "rect-clip") // give the clipPath an ID
		.append("rect")            // shape it as an ellipse
		.attr("width", 500)            // position the x-centre
		.attr("height", 1000)            // position the y-centre
		.attr("x", 0)            // set the x radius
		.attr("y", 0); 
		
		svg2.append('g')
		.attr("clip-path","url(#rect-clip)")
		.selectAll('roads')
		.data(roads_data)
		.enter()
		.append('line')
		.attr('x1', d => d.path[0][0])
		.attr('y1', d => d.path[0][1])
		.attr('x2', d => d.path[1][0])
		.attr('y2', d => d.path[1][1])
		.attr('stroke', function(d){
			
			let regularied_value = (PR_dict[d.id] - PR_min) / (PR_max - PR_min)
			
			return colorScale2(regularied_value)
		})
		
		svg2.append("g")
		  .attr("class", "legendLinear")
		  .attr("transform", "translate(20,1020)");
		
		var legendLinear = d3.legendColor()
		  .shapeWidth(30)
		  .cells(10)
		  .orient('horizontal')
		  .scale(colorScale2);
		
		svg2.select(".legendLinear")
		  .call(legendLinear);
	})
})	