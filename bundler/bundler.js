const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const {unzip} = require('zip-unzip-promise');

const {locale} = Intl.NumberFormat().resolvedOptions()
const i18n_dict = {
    "ZIP Not Found!":{
        "en":"ZIP Not Found!",
        "ja-JP":"ZIPファイルが見つかりません！"
    },
    "Extract in ":{
        "en":"Extract in ",
        "ja-JP":"展開します。展開先："
    },
    "Now installing.... Please wait....":{
        "en":"Now installing.... Please wait....",
        "ja-JP":"初回起動時のインストールをしています。これには数分かかる場合があります。"
    },
    "Success!":{
        "en":"Success!",
        "ja-JP":"成功しました!"
    },
    "package.json is not found. Reinstall.":{
        "en":"package.json is not found. Reinstall.",
        "ja-JP":"package.jsonが見つかりませんでした。再インストールを行います。"
    },
    "Not found 'main' on package.json":{
        "en":"Not found 'main' on package.json",
        "ja-JP":"package.jsonに'main'が見つかりませんでした。"
    },
    "Copying embed node....":{
        "en":"Copying embed node....",
        "ja-JP":"埋め込むnode.exeをコピー中...."
    }
}
const i18n = text => {
    return i18n_dict[text][locale] ?? i18n_dict[text]["en"];
}

const blueprintID = fs.readdirSync(__dirname).filter(f=>f.endsWith('.zip'))?.[0]?.split('.zip')[0];
const tmpfolderpath = os.tmpdir()

if(!blueprintID){
    throw i18n('ZIP Not Found!');
}

const projectFolder = path.join(tmpfolderpath,blueprintID,"/");

if(!fs.existsSync(projectFolder)){
    // If not created, unzip.
    install();
}else{
    run();
}

function install(){
    console.log(i18n("Extract in "),projectFolder);
    console.log(i18n("Now installing.... Please wait...."));
    fs.copyFileSync(path.join(__dirname,"./"+blueprintID+".zip"),path.join(tmpfolderpath,"./"+blueprintID+".zip"));
    unzip(path.join(tmpfolderpath,"./"+blueprintID+".zip"), projectFolder).then(()=>{
        console.log(i18n("Success!"));
        run();
    });
}

function run(){
    const packagejsonfilepath = path.join(projectFolder,"./package.json");
    if(!fs.existsSync(packagejsonfilepath)){
        // If package.json is deleted.
        console.log(i18n("package.json is not found. Reinstall."));
        install();
        return;
    }
    const indexfile = JSON.parse(fs.readFileSync(packagejsonfilepath))["main"];
    if(indexfile == undefined){
        throw i18n("Not found 'main' on package.json");
    }


    const exefilepath = path.join(tmpfolderpath,`./${blueprintID}_emb_node.exe`);
    if(!fs.existsSync(exefilepath)){
        console.log(i18n("Copying embed node...."));
        fs.copyFileSync(path.join(__dirname,"./emb_node.exe"), exefilepath);
    }
    const child = spawn(exefilepath,[path.join(projectFolder,indexfile)],{
        stdio: 'ignore',
        detached: true,
        env: process.env
    });
    child.unref();
}