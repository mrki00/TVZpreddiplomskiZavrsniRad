const gimme = require("./apiGet.js");
const obsFje = require("./obsFje.js");
const spawn = require("child_process").spawn;
const execSync = require("child_process").execSync;
const http = require('http').createServer();
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});
const express = require("express");
const app = express();
app.get('/', function(req, res){
    res.sendFile("/home/katal/Desktop/zavrsniRad/control.html")
});
app.use('/screenshots', express.static(__dirname +'/screenshots'));
app.listen(8080, function(){
    console.log("listening on port 8080");
})
//const makeProfile = require("./profileGenerator");
const max720pEncodes = 30;




const pathUrl = "http://localhost:9997/v1/paths/list";


var obsTermLine = "obs -m --profile \"blank:"  // add xxxx\" e.g.(4444\")    ~ obs -m --profile \"blank:xxxx\" 

var tmp = [];

var obsProcessList = {};
obsProcessList[4444] = ["inactive"]; 
//console.log(obsProcessList);

const ports = Object.keys(obsProcessList);
//console.log(ports);

var intervalImg;

async function wsOnStart(port){
    console.log('\n\ninside function\n\n');
    await obsFje.connection(port, "test");
        //console.log(port.substr(4, 4));
        obsProcessList[port][4] = await obsFje.gimmeResolutions();

        await obsFje.vlcConnect(obsProcessList[port][2]);
        
        var tmpArr = await obsFje.streamStatus();
        console.log("//////////////////////////////////////////////");
        console.log(tmpArr);// [0] - recording status; [1] - streaming status

}

async function activateInstance(port){
    const obs = spawn('obs', ['--profile', "blank:"+port, '-m'], {detached: true
    });
    const started = "info: [obs-websocket] server started successfully on port " + port;
    obs.stdout.on("data", data =>{
        //lol idk fuck off
        //console.log("test");
        //console.log(`stdout: ${data}`);
        //console.log(data.toString());
        if(data.toString().trimEnd() == started.trimEnd()){
            //console.log(data.toString().trimEnd());
            //console.log('\n\n\nsuccess?\n\n\n');
            obsProcessList[port][0] = ['active'];
            intervalImg = setInterval(function () { obsFje.screenshotSource(port).catch((err) => { console.log("error", err) }) }, 10000);
            wsOnStart(port);
            sendStats(port);
        }
    });
    obsProcessList[port][1] = obs.pid;
    obs.stderr.on("data", data =>{
        //console.log(`stderr: ${data}`);
    });
    
    obs.on("error", (error) =>{
        console.log(`error: ${error.message}`);
    });
    
    obs.on("close", code =>{
        obsProcessList[port][0] = ["inactive"]; //sets process to inactive in obsProcessList
        clearInterval(intervalImg);
        console.log(`child process exited with: ${code}`); 
    });
    /*
    await waitfor(1000);
    await obsFje.connection(port, "test");
    obsProcessList[port][0] = "active"; // error if websocket could not be started
    obsProcessList[port][1] = obs.pid;
    obsProcessList[port][4] = await obsFje.gimmeResolutions();
    obsFje.letItGo();
    */
}

async function runInLoop() {


    //var gameReport = await gimme.apiGet(gameReportUrl);
    //console.log(gameReport["data"]["ut"][0]["status"]);


    var pathData = await gimme.apiGet(pathUrl);
    pathData = pathData.data.items;
    var pathDataLocation = Object.keys(pathData);
    //console.log(pathDataLocation);
   


    var diff = [];
    
    if (tmp !== pathDataLocation) {
        diff = pathDataLocation.filter(x => !tmp.includes(x));
        console.log(diff);
        console.log(obsProcessList);

        if (diff.length) {
            for (var i = 0; i < diff.length; i++) {
                console.log(" A change ");
                

                //console.log(obsProcessList[diff[i].substr(4, 4)][0]);
                //start obs instances
                
                if(typeof diff[i] !== 'undefined'){
                    if(obsProcessList[diff[i].substr(4, 4)][0] === "inactive"){
                        obsProcessList[diff[i].substr(4, 4)][2] = diff[i];
                        activateInstance(diff[i].substr(4, 4));  
                        //await waitfor(1000);
            
                    }
                    else{
                        await obsFje.connection("4444", "test");
                        await obsFje.vlcConnect(diff[i]);
                        //console.log(diff[i].substr(4, 4));
                        intervalImg = setInterval(function() { console.log("new screenshot"); obsFje.screenshotSource(4444).catch((err) => { console.log("error", err) }) }, 10000);
                    }
                
                    
                    

                    /*
                    if(tmpArr[1] && check date/time ){
                        obsFje.startStream();
                    };
                    */
                
                    
                    }  
                obsFje.letItGo();
            }
        }
        
        tmp = pathDataLocation;
        
    }

    
    //console.log(diff);

}

async function sendStats(port){
    if(obsProcessList[port][0] == 'active'){
        await obsFje.connection(port, "test");
        var tmp3 = await obsFje.obsStats();
        var tmp4 = await obsFje.streamStats();
        //console.log(tmp3);
        //console.log(tmp4);
        //console.log(await obsFje.obsStats() + "check");
        io.emit('rtrn', ['statsRtrn', tmp3, tmp4]);
        await obsFje.letItGo();
    }else{
        console.log('ayo no status when it aint runnin');
    }
}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('command', async(command) =>     {
        switch(command[0]){
            case 'streamserver':
                if(obsProcessList[4444][0] == 'active'){
                    //console.log('doing something');
                    await obsFje.connection(command[1], "test");
                    await obsFje.streamServer(command[2], command[3]);
                    await obsFje.letItGo();
                    io.emit('rtrn',['commandRtrn', `command successful`] );
                }else{ 
                    console.log('ayo cant set when it aint runnin');
                }
                break;
            case 'stats':
                sendStats(4444);
                break;
            case 'isActive':
                if(obsProcessList[command[1]][0] == 'active'){
                    var data = [true, obsProcessList[command[1]][4]];
                    data.unshift('isActiveRtrn');
                    console.log(obsProcessList[command[1]][4]);
                    io.emit('rtrn', data);
                }
                else if(obsProcessList[command[1]][0] == 'inactive'){
                    io.emit('rtrn', ['isActiveRtrn', false]);
                }        
                break;
            case 'toggleActive':
                if(obsProcessList[command[1]][0] == 'inactive'){
                    await activateInstance(command[1]);
                    io.emit('isActiveRtrn', true);
                    //console.log('should make bkg green');
                }
                else if(obsProcessList[command[1]][0] == 'active'){
                    execSync('kill -9 '+ obsProcessList[command[1]][1]);
                    obsProcessList[command[1]] = ["inactive"]; 
                    io.emit('isActiveRtrn', false);
                }
                break;
        }
    });

});

http.listen(6969, () => console.log('listening on http://localhost:6969') );




(async () => {          //rewriten checkIfActive()
    var defaultPort = 4444; 
    for(var i = 0; i < ports.length; i++){
        try{
            var command = 'lsof -i :'+ (defaultPort+i);
            const isPortActive = execSync(command);
            //console.log(isPortActive.toString());
            var pid = isPortActive.toString().split('NAME')[1].split("     ")[1].split(" ")[0];
            console.log(pid);
            if(pid){
                await obsFje.connection(4444, "test");      //wont work if obsFje has uncommented test() function
                obsProcessList[ports[i]][0] = "active";
                obsProcessList[ports[i]][1] = pid;
                obsProcessList[ports[i]][4] = await obsFje.gimmeResolutions();
                obsFje.letItGo();
            }      
        }catch (err){
            console.log(err);
        }
    }
})();


var intervalMain = setInterval(function () { runInLoop().catch((err) => { console.log("error", err) }) }, 1500);



//activateInstance(4449);

//var statisticApiInterval = setInterval(function () { statisticApi().catch((err) => { console.log("error", err) }) }, 1500);




