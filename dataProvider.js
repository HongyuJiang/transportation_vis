import axios from 'axios';

export default class DataProvider {
 
    static getBusPath(){

        return axios.get('./data/226-1114.csv')
    }
    static getPassengeres(){

        return axios.get('./data/passengeres.csv')
    }

    static getStationDetail(){
        
        return axios.get('./data/stations.csv')
    }

    static getLinePathLocations(line){
        
        return axios.get('./data/lines/' + line +  '_route.csv')
    }

    static getLinesPathLocations(lines){

        const limited = [1,3,4,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23,25,26,27,28,29,30,31,32,33,34,35,36,37,39,40,59,60,61,62,70,71,72,73,74,75,76,77,79,80,84,85,90,91,92,93,94,95,97,98,100,102,104,235,328,401,408,436,514,532,546,601,801,805,806,807,2001]

        let restraint = {}
        
        limited.forEach(d => {

            restraint[d] = 1
        })

        let links = []

        lines.forEach(function(line){

            if(restraint[line] == 1)
                links.push(axios.get('./data/lines/' + line +  '_route.csv'))

        })

        console.log(links)
        
        return axios.all(links)
    }

    

}