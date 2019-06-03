import React, {Component} from 'react';
import {render} from 'react-dom';
import {PhongMaterial} from '@luma.gl/core';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {StaticMap} from 'react-map-gl';
import DeckGL, {HexagonLayer, TripsLayer} from 'deck.gl';
import GL from '@luma.gl/constants';
import DataProvider from './DataProvider';
import * as dsv from 'd3-dsv';
import * as d3 from 'd3';
import BarChart from './components/BarChart'
import LinesChart from './components/LinesChart'
import IconClusterLayer from './components/icon-cluster-layer';

// Set your mapbox token here
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaG9uZ3l1amlhbmciLCJhIjoiY2o1Y2VldHpuMDlyNTJxbzh5dmx2enVzNCJ9.y40wPiYB9y6qJE6H4PrzDw'; // eslint-disable-line

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});


const lightingEffect = new LightingEffect({ambientLight});

//初始化视点
export const INITIAL_VIEW_STATE = {
  latitude: 31.4673768,
  longitude: 104.5826264,
  zoom: 12.5,
  maxZoom: 25,
  pitch: 50,
  bearing: 0
};

const material = new PhongMaterial({
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51]
});

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

let stationDict = {}


var accent = d3.scaleOrdinal(d3.schemePaired);

// 解析数据
function path_handle(data){

  let trips_data = []

  let bus_segments_bukets = {}

  data = dsv.csvParse(data);

  data.forEach(function(d){

    d.LONGITUDE = parseFloat(d.LONGITUDE)
    d.LATITUDE = parseFloat(d.LATITUDE)

    d.ACTDATETIME = new Date('2018-02-26 ' + d.ACTDATETIME.split(' ')[1].replace("'",''))

    let timestamp = (d.ACTDATETIME.getHours()) * 3600 + d.ACTDATETIME.getMinutes() * 60 + d.ACTDATETIME.getSeconds()

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


  return trips_data
}

let passengeresData = []

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      time: 0,
      hoveredObject: null,
      linksData:{},
      tripsData:{},
      passengeres:[],
      focusExtent:[],
      passengersInClickStation:[],

    }
    this._onHover = this._onHover.bind(this);
    this._onClick = this._onClick.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);

    let that = this

    //读取管道数据
    //DataProvider.getBusPath().then(response => {
      
        ///let data = path_handle(response.data)

       ///that.setState({tripsData: data})

        //}, error => {

        //  console.log(error)
      
    //}); 

    DataProvider.getPassengeres().then(response => {
      
      let data = dsv.csvParse(response.data);

      that.setState({passengeres: data})

      passengeresData = data

      //that.props.passengeres = data

    }, error => {

        console.log(error)
    
    }); 

    DataProvider.getStationDetail().then(response => {


      let stations = dsv.csvParse(response.data);

      stations.forEach(function(d){

        let meta = {'name':d.name,'lat':d.lat,'lng':d.lng}

        if(stationDict[d.subline] != undefined){

            stationDict[d.subline][d.seq] = meta
        }
        else{

            stationDict[d.subline] = {}
            stationDict[d.subline][d.seq] = meta
        }
      })

      //console.log(stationDict)

    }, error => {

      console.log(error)
    })
  }

  transferMsg(ext) {

    this.setState({
      focusExtent:ext 
    });
  }

  componentWillUpdate(prevState, nextState){

    if(this.state.focusExtent != nextState.focusExtent){

      //console.log(nextState.focusExtent)

      let startStamp = nextState.focusExtent[0].getHours() * 3600 + nextState.focusExtent[0].getMinutes() * 60 + nextState.focusExtent[0].getSeconds()

      let endStamp = nextState.focusExtent[1].getHours() * 3600 + nextState.focusExtent[1].getMinutes() * 60 + nextState.focusExtent[1].getSeconds()

      let stampExtent = [startStamp, endStamp]

      let newData = []

      passengeresData.forEach(function(d){

        if(d.stamp <= stampExtent[1] && d.stamp >= stampExtent[0]){

          newData.push(d)
        }
      })

      this.setState({passengeres: newData})

      //this.state.passengeres = newData

      //console.log(this.state.passengeres.length)
    }
  
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
      animationSpeed = 10 // unit time per second
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
  _onHover({object, x, y}) {

    let lineCounter = {}

    let stationName = ''

    if (object){

      object.points.forEach(function(d){
        
        if(stationDict[d.line]){

          //console.log(d)

          if(stationDict[d.line][d.seq])
            stationName = stationDict[d.line][d.seq].name

          if(lineCounter[d.line] == undefined)
            lineCounter[d.line] = 1

          lineCounter[d.line] ++
        }
      })

    }

    //console.log(stationName)
    
   
    this.setState({x, y, hoveredObject: {'name':stationName, 'degree': d3.keys(lineCounter).length}});

  }

  _onClick({object, x, y}){

    let lineCounter = {}

    if (object){

      object.points.forEach(function(d){
        
        if(stationDict[d.line]){

          if(lineCounter[d.line] == undefined)
            lineCounter[d.line] = 1

          lineCounter[d.line] ++
        }
      })

    }

    console.log(lineCounter)

    this.setState({passengersInClickStation: object.points})

  }

  //绘制提示框
  _renderTooltip() {

    const {x, y, hoveredObject} = this.state;

    return (
      hoveredObject && (
        <div className="tooltip" style={{left: x, top: y}}>
          <div>{hoveredObject.name}</div>
          <div>{hoveredObject.degree}</div>
        </div>
      )
    );
  }


  _renderLayers() {
  
    const trips = this.state.tripsData
    const passengeres = this.state.passengeres
    const trailLength = 10

    const layerProps = {
      data: passengeres,
      pickable: true,
      wrapLongitude: true,
      getPosition: d => [Number(d.lng), Number(d.lat)],
      iconMapping: 'data/location-icon-mapping.json',
      iconAtlas: 'data/location-icon-atlas.png',
      sizeScale: 60
    };

    return [
      new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage: 1,
        data: passengeres,
        elevationRange: [0, 1],
        elevationScale: 3,
        extruded: true,
        getPosition: d => [Number(d.lng), Number(d.lat)],
        onHover: this._onHover,
        onClick: this._onClick,
        opacity: 1,
        pickable: true,
        radius:30,
        upperPercentile:100,
        material
      }),
      new IconClusterLayer({
        ...layerProps, 
        id: 'icon-cluster'
      })

      /*new TripsLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.segments,
        getColor: d => {

          let color = d3.rgb(accent(d.line))
          let r = color.r
          let g = color.g
          let b = color.b

          return [200,30,30]
        },
        opacity: 1,
        widthMinPixels: 3,
        rounded: true,
        trailLength,
        currentTime: this.state.time,
        //pickable: true,
       // onHover: this._onHover
      }),*/
    ];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;
    const passenger = this.state.passengeres;
    const passengersInClickStation = this.state.passengersInClickStation;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        effects={[lightingEffect]}
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

        <BarChart 
          id='barChart' 
          passenger={passenger}
          transferMsg = {msg => this.transferMsg(msg)}
        />

        <LinesChart 
          id='lineChart' 
          station={passengersInClickStation}
        />
  
        {this._renderTooltip}
      </DeckGL>
      
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
