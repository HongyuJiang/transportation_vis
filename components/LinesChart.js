import React, {Component} from 'react';
import * as d3 from 'd3';
import FreeScrollBar from 'react-free-scrollbar';


const accent = d3.scaleOrdinal(d3.schemeDark2);

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

        let newData = []

        for(let key in data){

            newData.push({ 'line':key, 'count': data[key]['total'] })
        }

        newData = newData.sort(function(a,b){

            return b.count - a.count
        })

        let that = this

        let width = 600
        let height = d3.keys(data).length * 55

        let xScale = d3.scaleLinear()
        .range([0, width /3])
        .domain(d3.extent(newData, d => d.count))

        let hoursScale = d3.scalePoint()
        .range([0,240])
        .domain([0,6,12,18,24])

        d3.select('#' + this.props.id).selectAll('*').remove()

        const svg = d3.select('#' + this.props.id)
        .append("svg")
        .attr("width", width)
        .attr("height", height + 30)

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

            return 'translate(' + (width/2) + ',' + (i * 50) + ')'
        })

        hourHeatContainer.append('rect')
        .attr('x', -(width/2) + 20)
        .attr('y', 30)
        .attr('height', 40)
        .attr('width', width - 50)
        .attr('fill','#464646')
        .attr('opacity', 1)

        hourHeatContainer.append('rect')
        .attr('x', -(width/2) + 20)
        .attr('y', 30)
        .attr('height', 40)
        .attr('width', 5)
        .attr('fill', d => accent(d.line))
        .attr('opacity', 1)


        hourHeatContainer.selectAll('.hourHeatBars')
        .data(function(data){

            let dataArray = []

            for(let hour in data.hours){

                if(hour != 'total')
                    dataArray.push({'hour': hour, 'heat': data.hours[hour]})
            }

            return dataArray
        })
        .enter()
        .append('rect')
        .attr('width', 8)
        .attr('height', d => d.heat/3)
        .attr('fill','#70FFA2')
        .attr('opacity',0.5)
        .attr('y', d => 50 - d.heat/3)
        .attr('x', d => parseInt(d.hour) * 10)

        let axis = hourHeatContainer.append("g")
        .attr("transform", "translate(0," + 50 + ")")
        .call(d3.axisBottom(hoursScale));

        axis.selectAll('path').attr('stroke','white')
        axis.selectAll('line').attr('stroke','white')
        axis.selectAll('text').attr('fill','white')

        svg.selectAll('lineBlocks')
        .data(newData)
        .enter()
        .append('rect')
        .attr('width', d => xScale(d.count))
        .attr('height',10)
        .attr('fill','white')
        .attr('opacity',0.3)
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
        .attr('fill','#FF7061')
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
    
      return <div style={{width: '600px', height: '300px', top:'400px',position:'absolute', zIndex:999}}><FreeScrollBar><div id={this.props.id}></div></FreeScrollBar></div>
    }
  }
      
  export default LinesChart;