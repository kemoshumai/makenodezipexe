const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const {unzip} = require('zip-unzip-promise');

const blueprintID = fs.readdirSync(__dirname).filter(f=>f.endsWith('.zip'))?.[0]?.split('.zip')[0];
const tmpfolderpath = os.tmpdir()

if(!blueprintID){
    throw 'ZIP Not Found!';
}

const projectFolder = path.join(tmpfolderpath,blueprintID,"/");

if(!fs.existsSync(projectFolder)){
    // If not created, unzip.
    console.log("Extract in ",projectFolder);
    console.log("Please wait a second....")
    fs.copyFileSync(path.join(__dirname,"./"+blueprintID+".zip"),path.join(tmpfolderpath,"./"+blueprintID+".zip"));
    unzip(path.join(tmpfolderpath,"./"+blueprintID+".zip"), projectFolder).then(()=>{
        console.log("Success!");
        run();
    });
}else{
    run();
}

function run(){
    const indexfile = JSON.parse(fs.readFileSync(path.join(projectFolder,"./package.json")))["main"];
    if(indexfile == undefined){
        throw `Not found 'main' on package.json`;
    }


    const child = spawn("node.exe",[path.join(projectFolder,indexfile)],{
        stdio: 'ignore',
        detached: true,
        env: process.env
    });
    child.unref();
}