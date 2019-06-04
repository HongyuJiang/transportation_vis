import React, {Component} from 'react';
import * as d3 from 'd3';
import FreeScrollBar from 'react-free-scrollbar';

class StationsChart extends Component {

    componentDidMount() {
      
      //this.isLoaded = false
    }

    componentWillUpdate(nextProps){

       // console.log(nextProps.path)

      if(nextProps.path != undefined && nextProps.path.length > 0){

        if(nextProps.station != undefined && nextProps.station.length > 0 && nextProps.station != this.props.station){

            //this.isLoaded = true

            //console.log(nextProps.station)

            let data = this.dataHandle(nextProps.path,nextProps.station);

            this.drawChart(data)
        }


      }
   
    }

    dataHandle(originPath, originStation){

        let routeStationDict = {}

        originPath.forEach(function(d){

            if(routeStationDict[d.ROUTEID] != undefined){

                if(routeStationDict[d.ROUTEID][d.STATIONSEQNUM] != undefined){

                    routeStationDict[d.ROUTEID][d.STATIONSEQNUM].push(d)
                }
                else{

                    routeStationDict[d.ROUTEID][d.STATIONSEQNUM] = []
                    routeStationDict[d.ROUTEID][d.STATIONSEQNUM].push(d)
                }
            }
            else{

                routeStationDict[d.ROUTEID] = {}
                routeStationDict[d.ROUTEID][d.STATIONSEQNUM] = []
                routeStationDict[d.ROUTEID][d.STATIONSEQNUM].push(d)
            }
        })

        let passedStations = {}

        originStation.forEach(function(d){

            let station = parseInt(d.line / 1000)

            let seq = d.seq

            let key = station + '-' + seq

            passedStations[key] = 1
        })

        let focusedStationRecords = []

        for(let station in passedStations){

            let line = station.split('-')[0]

            let seq = station.split('-')[1]

            if(routeStationDict[line] != undefined && routeStationDict[line][seq] != undefined){

                focusedStationRecords.push(routeStationDict[line][seq])
            }
        }

       // console.log(routeStationDict, originStation)

        return focusedStationRecords
    }
      
    drawChart(data) {

        //console.log(data)

        let accent = d3.scaleOrdinal(d3.schemeSet3);

        d3.select('#' + this.props.id)
        .style('z-index', '999')
        .style('position', 'absolute')
        .style('top','30px')
        .style('left','10px')
        .style('height','300px')
        //.style('overflow-y','auto')

        let dayTime = data[0][0].ACTDATETIME.split(' ')[0].replace("'",'')

        let dataGroup = dayTime.split('-')

        let t_date = dataGroup[1] + '-' +  dataGroup[0] + '-' + dataGroup[2]

        let startTime = new Date(t_date + ' 05:00:00')

        let endTime = new Date(t_date + ' 22:59:59')

        //console.log(dayTime, startTime, endTime)

        let width = 800
        let height = data.length * 85

        let xScale = d3.scaleTime().domain([startTime, endTime]).range([0, width])

        d3.select('#' + this.props.id).selectAll('svg').remove()

        const svg = d3.select('#' + this.props.id)
        .append("svg")
        .attr("width", width)
        .attr("height", height)

        let productCount = {}
        
        data.forEach(function(meta){

            meta.forEach(function(d){

                if(productCount[d.ROUTEID] != undefined){
                    if(productCount[d.ROUTEID][d.PRODUCTID] == undefined)
                        productCount[d.ROUTEID][d.PRODUCTID] = d3.keys(productCount[d.ROUTEID]).length
                
                }    
                else{
                    productCount[d.ROUTEID] = {}
                    productCount[d.ROUTEID][d.PRODUCTID] = d3.keys(productCount[d.ROUTEID]).length
    
                }
            })
        })

        //console.log(productCount)

        let stopTimeContainer = svg.selectAll('stopTime')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', function(d,i){

            return 'translate(' + 0 + ',' + (i * 100 + 20) + ')'
        })

        stopTimeContainer
        .append('rect')
        .attr('x', 0)
        .attr('y', -10)
        .attr('width', width)
        .attr('height', 75)
        .attr('opacity', 0.2)
        .attr('fill','white')
        .text(d => d)

        stopTimeContainer
        .append('rect')
        .attr('x', 0)
        .attr('y', -10)
        .attr('width', 3)
        .attr('height', 75)
        .attr('opacity', 0.7)
        .attr('fill','steelblue')
        .text(d => d)

        stopTimeContainer
        .append('rect')
        .attr('x', 3)
        .attr('y', -10)
        .attr('width', 20)
        .attr('height', 20)
        .attr('opacity', 1)
        .attr('fill','black')

        let axis = stopTimeContainer.append("g")
          .attr("transform", "translate(0," + 65 + ")")
          .call(d3.axisBottom(xScale));

        axis.selectAll('path').attr('stroke','white')

        axis.selectAll('line').attr('stroke','white')

        axis.selectAll('text').attr('fill','white')

        stopTimeContainer
        .append('text')
        .datum(function(d){

            if(d[0] == undefined) return 'motherfucker'

            return d[0].ROUTEID
        })
        .attr('x', 5)
        .attr('y', 5)
        .attr('font-size', 10)
        .attr('fill','white')
        .text(d => d)

        stopTimeContainer.selectAll('timeTick')
        .data(d => d)
        .enter()
        .append('circle')
        .attr('cx', function(d, i){

            let date = d.ACTDATETIME.slice(1, d.ACTDATETIME.length - 1)

            let dataGroup = date.split('-')

            let t_date = dataGroup[1] + '-' +  dataGroup[0] + '-' + dataGroup[2]

            return xScale(new Date(t_date))
        })
        .attr('cy', d => productCount[d.ROUTEID][d.PRODUCTID] * 2)
        .attr('stroke', d => accent(d.PRODUCTID))
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('r', 3)
        //.attr('height', 3)

    }
          
    render(){

        return <div style={{width: '850px', height: '350px'}}>
        <FreeScrollBar>
            <div id={this.props.id}></div>
        </FreeScrollBar>
    </div>
    }
  }
      
  export default StationsChart;