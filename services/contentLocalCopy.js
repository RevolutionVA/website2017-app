const fs = require('fs');
const ncp = require('ncp').ncp;

const contentRawDir = './.contentRaw';

deleteFolderRecursive(contentRawDir);

fs.mkdirSync(contentRawDir);

let ncpOptions = { filter: name => name.indexOf('\/.') === -1 };

ncp('/Volumes/www/revconf2017', contentRawDir, ncpOptions, function (err) {
    if (err) {
        return console.error(err);
    }
    console.log('Local files copied!');
});

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            let curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}
