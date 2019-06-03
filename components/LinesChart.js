import React, {Component} from 'react';
import * as d3 from 'd3';

class LinesChart extends Component {

    componentDidMount() {
      
      this.isLoaded = false
    }

    componentWillUpdate(nextProps, prevProps){

      if(nextProps.station && nextProps.station != this.props.station){

        let result = this.dataHandle(nextProps.station)

        this.drawChart(result);
      }
   
    }

    dataHandle(origin){

        let dataBucket = {}

        origin.forEach(function(d){

            let hour = parseInt(d.stamp / 3600)

            if(dataBucket[d.line] != undefined){

                dataBucket[d.line]['total'] += 1

                if(dataBucket[d.line][hour] != undefined){

                    dataBucket[d.line][hour] += 1
                }
                else{

                    dataBucket[d.line][hour] = 1
                }
            }
            else{

                dataBucket[d.line] = {'total': 1}
                dataBucket[d.line][hour] = 1
            }
           
        })


        return dataBucket
    }
      
    drawChart(data) {

        d3.select('#' + this.props.id)
        .style('z-index', '999')
        .style('position', 'absolute')
        .style('top','0px')
        .style('right','50px')

        let newData = []

        for(let key in data){

            newData.push({ 'line':key, 'count': data[key]['total'] })
        }

        newData = newData.sort(function(a,b){

            return b.count - a.count
        })

        let that = this

        let width = 350
        let height = 1000

        let xScale = d3.scaleLinear()
        .range([0, width - 100])
        .domain(d3.extent(newData, d => d.count))

        d3.select('#' + this.props.id).selectAll('*').remove()

        const svg = d3.select('#' + this.props.id)
        .append("svg")
        .attr("width", width)
        .attr("height", height)

        let hourHeatContainer = svg.selectAll('.hourHeatContainer')
        .data(function(){

            let array = []
            for(let line in data){

                array.push({'line':line, 'hours':data[line], 'total':data[line]['total']})
            }

            array = array.sort(function(a,b){

                return b.total - a.total
            })

            return array
        })
        .enter()
        .append('g')
        .attr('transform', function(d,i){

            return 'translate(' + 0 + ',' + (i * 50) + ')'
        })

        hourHeatContainer.selectAll('.hourHeatBars')
        .data(function(data){

            let dataArray = []

            for(let hour in data.hours){

                //console.log(hour)

                if(hour != 'total')
                    dataArray.push({'hour': hour, 'heat': data.hours[hour]})
            }

            return dataArray
        })
        .enter()
        .append('rect')
        .attr('width', 5)
        .attr('height', d => d.heat/3)
        .attr('fill','yellow')
        .attr('opacity',0.5)
        .attr('y', d => 80 - d.heat/3)
        .attr('x', d => 200 + parseInt(d.hour) * 6)

        svg.selectAll('lineBlocks')
        .data(newData)
        .enter()
        .append('rect')
        .attr('width', d => xScale(d.count))
        .attr('height',10)
        .attr('fill','white')
        .attr('opacity',0.5)
        .attr('y', function(d,i){

            return i * 50 + 50
        })
        .attr('x', 60)

        svg.selectAll('lineBlocks')
        .data(newData)
        .enter()
        .append('rect')
        .attr('width', 3)
        .attr('height',10)
        .attr('fill','red')
        .attr('opacity', 1)
        .attr('y', function(d,i){

            return i * 50 + 50
        })
        .attr('x', d => xScale(d.count) + 60)

        svg.selectAll('lineBlocks')
        .data(newData)
        .enter()
        .append('text')
        .attr('x', 50)
        .attr('y', function(d,i){

            return i * 50 + 60
        })
        .attr('fill','white')
        .attr('text-anchor', 'end')
        .attr('font-size', 11)
        .text(d => parseInt(d.line / 1000))

        svg.selectAll('lineBlocks')
        .data(newData)
        .enter()
        .append('text')
        .attr('x', d => xScale(d.count) + 70)
        .attr('y', function(d,i){

            return i * 50 + 60
        })
        .attr('fill','white')
        .attr('font-size', 11)
        .text(d => parseInt(d.count))

    }
          
    render(){
      const {passenger} = this.props;
      return <div id={this.props.id}></div>
    }
  }
      
  export default LinesChart;