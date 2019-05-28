import React, {Component} from 'react';
import * as d3 from 'd3';

class BarChart extends Component {

    componentDidMount() {
      
      this.isLoaded = false
    }

    componentWillUpdate(nextProps){

      if(nextProps.passenger != undefined && nextProps.passenger.length > 0  && !this.isLoaded){

        this.isLoaded = true

        this.drawChart(nextProps.passenger);
      }
   
    }
      
    drawChart(data) {

      let that = this

      d3.select('#' + this.props.id)
      .style('z-index', '999')
      .style('position', 'absolute')
      .style('bottom','0px')

      let width = 1800
      let height = 150

      // set the ranges
      var x = d3.scaleTime()
      .domain([new Date(2018, 0, 1), new Date(2018, 0, 2)])
      .rangeRound([50, width -50]);

      var y = d3.scaleLinear()
      .range([height, 0]);

      var histogram = d3.histogram()
      .value(function(d) { return d.date; })
      .domain(x.domain())
      .thresholds(x.ticks(24 * 10));

      data.forEach(d => {

        let hour = parseInt(d.stamp / 3600) 

        let minutes = parseInt((d.stamp - hour * 3600) / 60)

        let seconds = parseInt(d.stamp - hour * 3600 - minutes * 60) 

        d.date = new Date('2018-01-01 ' + hour + ':' + minutes + ':' + seconds)
      })
     
      const svg = d3.select('#' + this.props.id)
      .append("svg")
      .attr("width", width)
      .attr("height", height + 100)

     // group the data for the bars
      var bins = histogram(data);

      console.log(bins)

      // Scale the range of the data in the y domain
      y.domain([0, d3.max(bins, function(d) { return d.length; })]);

      // append the bar rectangles to the svg element
      svg.selectAll("heatBar")
          .data(bins)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", 1)
          .attr("transform", function(d) {
          return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
          .attr("height", function(d) { return height - y(d.length); })
          .attr('fill','white')
          .attr('opacity',0.3)

      svg.selectAll("heatBarTop")
          .data(bins)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", 1)
          .attr("transform", function(d) {
          return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
          .attr("height", 2)
          .attr('fill','#4799FC')
          .attr('opacity',0.7)

      // add the x Axis
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      // add the y Axis
      svg.append("g")
          .attr("transform", "translate(50,0)")
          .call(d3.axisLeft(y));

      svg.selectAll('path').attr('stroke','white')

      svg.selectAll('line').attr('stroke','white')

      svg.selectAll('text').attr('fill','white')

      var brush = d3.brushX()
        .extent([
            [0, 0],
            [width, height]
        ])
        .on("brush end", brushed);

      svg.append("g")
        .attr("class", "brush")
        .call(brush);

      function brushed(){
		
          let extent = d3.event.selection.map(x.invert)

          that.props.transferMsg(extent)
        
        }
    }
          
    render(){
      const {passenger} = this.props;
      return <div id={this.props.id}></div>
    }
  }
      
  export default BarChart;