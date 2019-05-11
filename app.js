import React, {Component} from 'react';
import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';
import DeckGL, {LineLayer, TripsLayer} from 'deck.gl';
import GL from '@luma.gl/constants';
import DataProvider from './DataProvider';
import * as dsv from 'd3-dsv';
import * as d3 from 'd3';

// Set your mapbox token here
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaG9uZ3l1amlhbmciLCJhIjoiY2o1Y2VldHpuMDlyNTJxbzh5dmx2enVzNCJ9.y40wPiYB9y6qJE6H4PrzDw'; // eslint-disable-line

//初始化视点
export const INITIAL_VIEW_STATE = {
  latitude: 31.4673768,
  longitude: 104.5826264,
  zoom: 12.5,
  maxZoom: 25,
  pitch: 50,
  bearing: 0
};

var accent = d3.scaleOrdinal(d3.schemePaired);

// 解析数据
function path_handle(data){

  let trips_data = []

  let bus_segments_bukets = {}

  data = dsv.csvParse(data);

  data.forEach(function(d){

    d.LONGITUDE = parseFloat(d.LONGITUDE)
    d.LATITUDE = parseFloat(d.LATITUDE)
    //console.log('2018-02-26 ' + d.ACTDATETIME.split(' ')[2].replace("'",''))
    d.ACTDATETIME = new Date('2018-02-26 ' + d.ACTDATETIME.split(' ')[1].replace("'",''))

    let timestamp = (d.ACTDATETIME.getHours()) * 3600 + d.ACTDATETIME.getMinutes() * 60 + d.ACTDATETIME.getSeconds()

    //console.log(timestamp)

    if(bus_segments_bukets[d.PRODUCTID] != undefined){

      bus_segments_bukets[d.PRODUCTID]['path'].push([d.LONGITUDE,d.LATITUDE,timestamp])
    }
    else{
      bus_segments_bukets[d.PRODUCTID] = {}
      bus_segments_bukets[d.PRODUCTID]['path'] = []
      bus_segments_bukets[d.PRODUCTID]['line'] = d.ROUTEID
      bus_segments_bukets[d.PRODUCTID]['path'].push([d.LONGITUDE,d.LATITUDE,timestamp])
    }
  })

  for (let bus in bus_segments_bukets){

    let path = bus_segments_bukets[bus]['path']

    let meta = {'line':bus_segments_bukets[bus]['line'], 'segments':path}

    trips_data.push(meta)
  }

  console.log(trips_data)

  return trips_data
}

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      time: 0,
      hoveredObject: null,
      linksData:{},
      tripsData:{}
    };
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);

    let that = this

    //读取管道数据
    DataProvider.getBusPath().then(response => {
      
        let data = path_handle(response.data)

        that.setState({tripsData: data})

        }, error => {

          console.log(error)
      
    }); 
  }

  componentDidMount() {
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _animate() {

    //console.log(this.state.time)
    const {
      loopLength = 3600 * 15, // unit corresponds to the timestamp in source data
      animationSpeed = 50 // unit time per second
    } = this.props;

    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;

    //console.log(((timestamp % loopTime) / loopTime) * loopLength)

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }

  //鼠标悬停
  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  //绘制提示框
  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;
    return (
      hoveredObject && (
        <div className="tooltip" style={{left: x, top: y}}>
          <div>{hoveredObject.country || hoveredObject.abbrev}</div>
          <div>{hoveredObject.name.indexOf('0x') >= 0 ? '' : hoveredObject.name}</div>
        </div>
      )
    );
  }

  
  //绘制图层
  _renderLayers() {
    const {
      getWidth = 1
    } = this.props;

    const roads = this.state.linksData
    const trips = this.state.tripsData
    const trailLength = 50

    return [
      new TripsLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.segments,
        getColor: d => {

          let color = d3.rgb(accent(d.line))
          let r = color.r
          let g = color.g
          let b = color.b

          console.log([r,g,b])

          return [r,g,b]
        },
        opacity: 1,
        widthMinPixels: 3,
        rounded: true,
        trailLength,
        currentTime: this.state.time,
        //pickable: true,
       // onHover: this._onHover
      }),
    ];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
        pickingRadius={5}
        //设置渲染方式
        parameters={{
          blendFunc: [GL.SRC_ALPHA, GL.ONE, GL.ONE_MINUS_DST_ALPHA, GL.ONE],
          blendEquation: GL.FUNC_ADD
        }}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            //使用mapbox studio设置地图风格
            mapStyle="mapbox://styles/hongyujiang/cj6hkeqlb4cr62ro999s4o87o"
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}

        {this._renderTooltip}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
