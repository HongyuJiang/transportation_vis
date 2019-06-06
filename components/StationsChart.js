import React, {Component} from 'react';
import * as d3 from 'd3';
import FreeScrollBar from 'react-free-scrollbar';

const accent = d3.scaleOrdinal(d3.schemeDark2);

class StationsChart extends Component {

    componentDidMount() {
      
    }

    componentWillUpdate(nextProps){


      if(nextProps.path != undefined && nextProps.path.length > 0){

        if(nextProps.station != undefined && nextProps.station.length > 0 && nextProps.station != this.props.station){

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

        return focusedStationRecords
    }
      
    drawChart(data) {

        let busColors = d3.scaleOrdinal(d3.schemeSet3);

        d3.select('#' + this.props.id)
        .style('z-index', '999')
        .style('position', 'absolute')
        .style('top','30px')
        .style('left','10px')
        .style('height','300px')

        let dayTime = data[0][0].ACTDATETIME.split(' ')[0].replace("'",'')

        let dataGroup = dayTime.split('-')

        let t_date = dataGroup[1] + '-' +  dataGroup[0] + '-' + dataGroup[2]

        let startTime = new Date(t_date + ' 06:00:00')

        let endTime = new Date(t_date + ' 12:59:59')


        let width = 750
        let height = data.length * 105

        let xScale = d3.scaleTime().domain([startTime, endTime]).range([0, width])

        d3.select('#' + this.props.id).selectAll('svg').remove()

        const svg = d3.select('#' + this.props.id)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append('g')
        .attr('transform','translate(0, 10)')

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

        let incremental = 0

        let gap = 30

        let stopTimeContainer = svg.selectAll('stopTime')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', function(d,i){

            let line = d[0].ROUTEID

            let height = d3.keys(productCount[line]).length * 4 + 10

            let ret = 'translate(' + 0 + ',' + (incremental) + ')'

            incremental += height

            incremental += gap

            return ret
        })

        svg.attr("height", incremental + 10)

        stopTimeContainer
        .append('rect')
        .datum(function(d){

            if(d[0] == undefined) return 'motherfucker'

            return d[0].ROUTEID
        })
        .attr('x', 0)
        .attr('y', -10)
        .attr('width', width)
        .attr('height', d => d3.keys(productCount[d]).length * 4 + 10)
        .attr('opacity', 1)
        .attr('fill','#464646')
    
        stopTimeContainer
        .append('rect')
        .datum(function(d){

            if(d[0] == undefined) return 'motherfucker'

            return d[0].ROUTEID
        })
        .attr('x', 0)
        .attr('y', -10)
        .attr('width', 5)
        .attr('height', d => d3.keys(productCount[d]).length * 4 + 10)
        .attr('opacity', 1)
        .attr('fill', d => accent(d))
        .text(d => d)


        let axis = stopTimeContainer.append("g")
            .datum(function(d){

                if(d[0] == undefined) return 'motherfucker'

                return d[0].ROUTEID
            })
            .attr("transform", function(d){

                let height = d3.keys(productCount[d]).length * 4

                return "translate(0," + height + ")"
            })
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
        .attr('x', 10)
        .attr('y', d => d3.keys(productCount[d]).length * 2)
        .attr('font-size', 18)
        .attr('font-weight', 100)
        .attr('font-family', 'Bahnschrift')
        .attr('fill','white')
        .text(d => d)

        let metaEle = stopTimeContainer.selectAll('timeTick')
        .data(data => data.filter(d =>{

            let date = d.ACTDATETIME.slice(1, d.ACTDATETIME.length - 1)

            let dataGroup = date.split('-')

            let t_date = new Date (dataGroup[1] + '-' +  dataGroup[0] + '-' + dataGroup[2])

            if(t_date < endTime) return 1
            else return 0
        }))
        .enter()
        .append('g')
        .attr('transform', function(d){

            let date = d.ACTDATETIME.slice(1, d.ACTDATETIME.length - 1)

            let dataGroup = date.split('-')

            let t_date = dataGroup[1] + '-' +  dataGroup[0] + '-' + dataGroup[2]

            let x = xScale(new Date(t_date))
            return 'translate(' + x + ',' + '0)'
        })

        metaEle.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', d => productCount[d.ROUTEID][d.PRODUCTID] * 4)
        .attr('y2', d => d3.keys(productCount[d.ROUTEID]).length * 4)
        .attr('stroke','grey')
        .attr('opacity', 1)

        metaEle.append('circle')
        .attr('cx', 0)
        .attr('cy', d => productCount[d.ROUTEID][d.PRODUCTID] * 4)
        .attr('fill', d => busColors(d.PRODUCTID))
        .attr('stroke', 'none')
        .attr('stroke-width', 2)
        .attr('r', 3)

        //.attr('height', 3)

    }
          
    render(){

        return <div style={{width: '800px', height: '360px', zIndex:999}}>
        <FreeScrollBar>
            <div id={this.props.id}></div>
        </FreeScrollBar>
    </div>
    }
  }
      
  export default StationsChart;