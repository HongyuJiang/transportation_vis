import React, {Component} from 'react';
import * as d3 from 'd3';
import FreeScrollBar from 'react-free-scrollbar';


class LinesExplorer extends Component {

    componentDidMount() {
      
    }

    componentWillUpdate(nextProps, prevProps){

      if(nextProps.stations && nextProps.stations != this.props.stations){

        this.drawChart(nextProps.stations);
      }
   
    }

    drawChart(data) {

        let linesName = d3.keys(data)

        let width = 230
        let height = linesName.length * 20

        //console.log(height)

        d3.select('#' + this.props.id).selectAll('*').remove()

        const svg = d3.select('#' + this.props.id)
        .append("svg")
        .attr("width", width)
        .attr("height", height)

        svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'black')
        .attr('opacity', 0.7)
        .attr('x',0)
        .attr('y',0)

        let linesNameContainer = svg.append('g')

        let stationsContainer = svg.append('g')
        .attr('transform', 'translate(0, 0)')

        let metaContainer = linesNameContainer.selectAll('.lineName')
        .data(linesName)
        .enter()
        .append('g')
        

        metaContainer
        .append('line')
        .attr('x1', width - 60)
        .attr('y1', function(d,i){

            return i * 20 + 25
        })
        .attr('x2', width - 60)
        .attr('y2', function(d,i){

            return i * 20 + 25
        })
        .attr('stroke', '#4858ff')
        .attr('stroke-width', '2')


        metaContainer
        .append('text')
        .attr('x', width - 30)
        .attr('y', function(d,i){

            return i * 20 + 20
        })
        .attr('text-anchor', 'end')
        .attr('fill','white')
        .attr('font-size', 11)
        .text(d => d)
        .on('click', function(d){

            svg.selectAll('.station').remove()
            svg.selectAll('.link').remove()

            let stationsArray = []

            for(let key in data[d]){

                let meta = data[d][key]

                meta.line = key

                stationsArray.push(meta)
            }

            let link = stationsContainer.append('line')
            .attr('x1', 10)
            .attr('x2', 10)
            .attr('y1', 15)
            .attr('y2', 15)
            .attr('class', 'link')
            .attr('stroke', '#4858ff')
            .attr('stroke-width', '3')
            .attr('fill','none')


            let stationMeta = stationsContainer.selectAll('.station')
            .data(stationsArray)
            .enter()
            .append('g')
            .attr('class','station')
            .attr('transform', function(d,i){

                return 'translate(' + 10 + ',' + (i * 30 + 20) + ')'
            })

            stationMeta.append('circle')
            .attr('r', 4)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', 'white')
            .attr('opacity', 0)

            stationMeta.append('text')
            .attr('x', 10)
            .attr('y', 5)
            .attr('fill', 'white')
            .attr('font-size', 11)
            .attr('opacity', 0)
            .text(d => d.name)
            
            stationsContainer.selectAll('circle')
            .transition()
            .ease(d3.easeLinear)
            .duration(100)
            .delay(function(d,i){

                return i * 300
            })
            .attr('opacity', 1)

            stationsContainer.selectAll('text')
            .transition()
            .ease(d3.easeLinear)
            .duration(100)
            .delay(function(d,i){

                return i * 300
            })
            .attr('opacity', 0.7)

            
            link.transition()
            .ease(d3.easeLinear)
            .duration(stationsArray.length * 300)
            .attr('y2', stationsArray.length * 30 - 5)
        })

        metaContainer
        .on('click', function(d){

            metaContainer.selectAll('line').attr('x2', width - 60)

            d3.select(this).selectAll('line')
            .transition()
            .attr('x2', width - 30)
        })
        
    }
          
    render(){
    
      return <div style={{zIndex:999, width: '230px', height: '970px', top:'0px', right:'0px',position:'absolute'}}><FreeScrollBar><div id={this.props.id}></div></FreeScrollBar></div>
    }
  }
      
  export default LinesExplorer;