const cli = require('cac')();
const path = require('path');
const crypto = require('crypto');
const fs = require('fs-extra');
const archiver = require('archiver');
const child_process = require('child_process');

cli
    .command('make', 'Make exe for windows.')
    .option('--src <folderpath>', 'A folder that includes package.json(Default:src)')
    .option('--unique <string>', 'A blueprint ID to distinguish between files.(Default:Automatic generation with SHA256)')
    .action((options) => {
        const sourcefolderpath = options.src || path.join(__dirname,"./src");
        const unique = options.unique || crypto.createHash('sha256').update(crypto.randomBytes(16), 'utf8').digest('hex');
        console.log("Folder:",sourcefolderpath);
        console.log("UniqueID:",unique);
        // Create tmp folder for nexe's source.
        const tmpfolderpath = path.join(__dirname,"./_tmp");
        fs.mkdirSync(tmpfolderpath);
        {
            const archive = archiver('zip', {
                zlib: { level: 9 } // 圧縮レベルを指定
            });
            const output = fs.createWriteStream(tmpfolderpath + `/${unique}.zip`);
            archive.pipe(output)
            archive.directory(sourcefolderpath, '');
            archive.finalize();
            output.on('close',()=>{
                const fileList = fs.readdirSync(path.join(__dirname,"./bundler"));
                console.log(fileList);
                for(const file of fileList){
                    fs.copySync(path.join(__dirname,"./bundler",path.basename(file)),path.join(tmpfolderpath,file));
                }
                child_process.execSync(`cd ${path.join(__dirname,"./_tmp")} & nexe bundler.js --output ${path.join(process.cwd(),"./dist.exe")} --target windows-x64-14.15.1 -r "./${unique}.zip" -r "./node.exe" `);
                fs.remove(tmpfolderpath);
            });
        }
    });

cli.help()

cli.parse()