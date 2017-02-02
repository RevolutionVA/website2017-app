const fs = require('fs-extra');

const pathRaw = './contentRaw';
const pathOutput = './content';

let warnings = [];

console.log("The current working directory is " + process.cwd());
console.log();

fs.readdirSync(pathRaw).forEach(function (fileType) {

    let curPath = pathRaw + '/' + fileType;

    if (!fs.lstatSync(curPath).isDirectory()) {

        if (fileType.endsWith('.json')) {
            fs.copySync(curPath, pathOutput + '/' + fileType);
        }

        return;
    }

    let compilerFile = process.cwd() + '/services/' + fileType + 'Compiler.js';

    if (fs.existsSync(compilerFile)) {

        let compiled = require('./' + fileType + 'Compiler')(curPath);
        fs.writeFileSync(pathOutput + '/' + fileType + '.json', compiled.output);
        warnings.push(compiled);

    } else {

        console.error('./' + fileType + 'Compiler found!');
    }

});