const axios = require('axios');

function apiGet(url){
    return axios.get(url)
        .catch(error =>{
            //lol idk fuck off
        })
    }

function apiKick(url){
    return axios.post(url)
        .catch(error =>{
            //lol idk fuck off
        })
    }
//apiKick('http://localhost:9997/v1/rtmpconns/kick/779479881')
module.exports = { 
    apiGet,
    apiKick,
};