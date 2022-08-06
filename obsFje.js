const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();
    
 
async function connection(port, pass){
    await obs.connect({address: 'localhost:'+port, password: pass})
    .catch((error) => {
        //lol idk fuck off
        return error.status;
    }); 
}

async function letItGo(){
    obs.disconnect();
}

async function setScore(id){  
    
    var scoreSettings = {
        "sourceName": "score",
        "sourceKind": "browser_source", 
        "sceneName": "Scene",
        "sourceSettings": { 
            "css": '',
            "fps": 30,
            "fps_custom": true,
            "height": 720,
            "reroute_audio": false,
            "restart_when_active": false,
            "shutdown": false,
            "url": 'https://katalmedia.hr/ls/single.html?'+id+'=1',
            "webpage_control_level": 2,
            "width": 1280 
        }
    }
    
    await obs.send('SetSourceSettings', scoreSettings).then(data => {
        console.log('CreateSource result', data);
    }).catch((error) => {
        //lol idk fuck off
    });

}

async function streamServer(url, skey){

    var streamSettings = {
        settings: { key: skey, server: url },
        type: 'rtmp_custom',
    }

    await obs.send('SetStreamSettings', streamSettings).then(data => {
        console.log('CreateSource result', data);
    }).catch((error) => {
        //lol idk fuck off
    })

}

async function vlcConnect(key){

    var vlcSettings = {
        "sourceName": 'VLC Video Source',
        "sourceType": 'vlc_source',
        "sceneName": 'Scene',
        "sourceSettings":
         { "loop": true,
           "network_caching": 5000,
           "playback_behavior": 'stop_restart',
           "playlist": [{ 
                "hidden": false,
                "selected": true,
                "value": 'rtsp://localhost:8554/' + key, 
            }],
           "shuffle": false,
           "subtitle": 1,
           'subtitle_enable': false,
           "track": 1 },
        "setVisible": true,
    }

    await obs.send('SetSourceSettings', vlcSettings).then(data => {
        console.log(data);
    }).catch((error) => {
        //lol idk fuck off
    })
    //console.log("in obsfje " +key);

}

async function leagueOverlay(league){

    var leagueOverlaySettings = {
        "sourceName": "league",
        "sourceKind": "Image", 
        "sceneName": "Scene",
        "sourceSettings": {
            "file": '/home/katal/Desktop/'+ league + '.png',
            "linear_alpha": false,
            "unload": false
        }
    } 
    if(league !== null){
            await obs.send('SetSourceSettings', leagueOverlaySettings).then(data => {
                console.log(data);
            }).catch((error) => {
                //lol idk fuck off
            })
    }

}

async function streamStatus(){
    var streamStatus = await obs.send('GetStreamingStatus').then(data => {
        var tmpArr = [data['recording'], data['streaming']];
        
        //console.log("\n///////////////////////obsFje.js "+tmpArr+"////////////////////////\n");
        return tmpArr;
    }).catch((error) => {
        //console.log("\n///////////////////////obsFje.js error////////////////////////\n");
    })
    return streamStatus;
}

async function startStream(){
    var streamStatus = await obs.send('StartStreaming').then(data => {
        console.log(data);
    }).catch((error) => {
        //lol idk fuck off
    })
}

async function stopStream(){
    var streamStatus = await obs.send('StopStreaming').then(data => {
        console.log(data);
    }).catch((error) => {
        //lol idk fuck off
    })
}

async function obsStats(){
    var obsStats = await obs.send('GetStats').then(data => {
        //console.log(data);
        return data;
    }).catch((error) => {
        //lol idk fuck off
        console.log(error);
    })
    if(obsStats !== undefined){
        //console.log(obsStats.stats);
        return obsStats.stats;
    }
}

async function streamStats(){
    var obsStats = await obs.send('GetStreamingStatus').then(data => {
        //console.log(data);
        return data;
    }).catch((error) => {
        //lol idk fuck off
        console.log(error);
    })
    if(obsStats !== undefined){
        //console.log(obsStats);
        return obsStats;
    }
}

async function gimmeResolutions(){
    var resInfo = await obs.send('GetVideoInfo').then(data => {
        //console.log(data);
        return data;
    }).catch((error) => {
        //lol idk fuck off
        console.log(error);
    })
    //console.log(obsStats);
    if(resInfo !== undefined){
        const res = [resInfo["baseWidth"] + 'x' + resInfo["baseHeight"], resInfo["outputWidth"] + 'x' + resInfo["outputHeight"]];
        //console.log(res);
        return res;
    }
}

async function screenshotSource(port){
    await connection(port, "test");
    var screeshot = await obs.send('TakeSourceScreenshot',{saveToFilePath: "/home/katal/Desktop/zavrsniRad/screenshots/" + port + ".png"}).then(data => {
        console.log(data);
    }).catch((error) => {
        console.log(error);
        //lol idk fuck off
    })
    letItGo();
}


async function stretchSources(sourceName, resolution){
    var resInfo = await obs.send('SetSceneItemProperties', {item: {name: sourceName,},bounds: {type: 'OBS_BOUNDS_STRETCH',x: parseInt(resolution.split('x')[0]),y: parseInt(resolution.split('x')[1]), alignment: 1,},position: {x: 0, y: 0,},}
    ).then(data => {
        if(resolution.split('x')[1] === '1080'){
            console.log(resolution.split('x')[1]);
        }
        
        console.log(data);
        return data;
    }).catch((error) => {
        //lol idk fuck off
        console.log(error);
    })
}


async function test(){
    await connection(4444, "test");

    await gimmeResolutions();

    letItGo();
 

}


//test();           //make sure this function wont run cause it breaks other documents

module.exports = { 
    setScore,
    streamServer,
    vlcConnect,
    leagueOverlay,
    connection,
    letItGo,
    streamStatus,
    startStream,
    stopStream,
    obsStats,
    gimmeResolutions,
    screenshotSource,
    stretchSources,
    streamStats
};



//leagueOverlay(4445, "test", "paket24");

//vlcConnect(4445, "test", "live/ivanic");

