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
    install();
}else{
    run();
}

function install(){
    console.log("Extract in ",projectFolder);
    console.log("Now installing.... Please wait....");
    fs.copyFileSync(path.join(__dirname,"./"+blueprintID+".zip"),path.join(tmpfolderpath,"./"+blueprintID+".zip"));
    unzip(path.join(tmpfolderpath,"./"+blueprintID+".zip"), projectFolder).then(()=>{
        console.log("Success!");
        run();
    });
}

function run(){
    const packagejsonfilepath = path.join(projectFolder,"./package.json");
    if(!fs.existsSync(packagejsonfilepath)){
        // If package.json is deleted.
        console.log("package.json is not found. Reinstall.");
        install();
        return;
    }
    const indexfile = JSON.parse(fs.readFileSync(packagejsonfilepath))["main"];
    if(indexfile == undefined){
        throw `Not found 'main' on package.json`;
    }


    const exefilepath = path.join(tmpfolderpath,`./${blueprintID}_emb_node.exe`);
    if(!fs.existsSync(exefilepath)){
        console.log("Copying embed node....");
        fs.copyFileSync(path.join(__dirname,"./emb_node.exe"), exefilepath);
    }
    const child = spawn(exefilepath,[path.join(projectFolder,indexfile)],{
        stdio: 'ignore',
        detached: true,
        env: process.env
    });
    child.unref();
}