import axios from 'axios';

export default class DataProvider {
 
    static getLinks(){

        return axios.get('https://raw.githubusercontent.com/HongyuJiang/roads_network_vis/master/links.csv')
    }

    static getNodes(){

        return axios.get('https://raw.githubusercontent.com/HongyuJiang/roads_network_vis/master/nodes.csv')
    }

    static getBusPath(){

        return axios.get('https://raw.githubusercontent.com/HongyuJiang/transportation_vis/master/data/226-1114.csv')
    }
    static getPassengeres(){

        return axios.get('https://raw.githubusercontent.com/HongyuJiang/transportation_vis/master/data/passengeres.csv')
    }

    static getStationDetail(){
        
        return axios.get('https://raw.githubusercontent.com/HongyuJiang/transportation_vis/master/data/stations.csv')
    }

}