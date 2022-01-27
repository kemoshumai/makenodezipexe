const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const unzipper = require('unzipper');

const blueprintID = fs.readdirSync(__dirname).filter(f=>f.endsWith('.zip'))?.[0]?.split('.zip')[0];
const tmpfolderpath = os.tmpdir()

if(!blueprintID){
    throw 'ZIP Not Found!';
}

const projectFolder = path.join(tmpfolderpath,blueprintID,"/");

if(!fs.existsSync(projectFolder)){
    // If not created, unzip.
    console.log("Extract in ",projectFolder);
    console.log("Zip file:",path.join(__dirname,"./"+blueprintID+".zip"));
    console.log("Exists:",fs.existsSync(path.join(__dirname,"./"+blueprintID+".zip")));
    const st = fs.createReadStream(path.join(__dirname,"./"+blueprintID+".zip")).pipe(unzipper.Extract({ path: projectFolder }));
    st.on('close',()=>{
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