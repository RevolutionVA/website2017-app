/*
 * Human Compiler
 */

const fs = require('fs-extra');
const marked = require('marked');
const path = require('path');

module.exports = function (filePath) {

    let typeName = path.basename(filePath), set = [], warnings = [];

    fs.readdirSync(filePath).forEach(slug => {

        let pathHuman = filePath + '/' + slug;

        let item = {
            slug: slug
        };

        let sources = [];

        if (!fs.lstatSync(pathHuman).isDirectory()) {
            return;
        }

        fs.readdirSync(pathHuman).forEach(file => {

            let filePath = pathHuman + '/' + file;
            let fileName = path.basename(file, path.extname(file));

            if (path.extname(file) === '.md') {

                let markdownContent = fs.readFileSync(filePath, 'utf-8');
                item[fileName] = marked(markdownContent);
            }

            if (path.extname(file) === '.json') {

                let data = fs.readJsonSync(filePath, { throws: false });

                if (data === null) {
                    warnings.push(`JSON parse '${slug}' ${fileName} data was null.`)
                } else {
                    sources.push(data);
                }
            }

            if (path.extname(file) === '.png') {
                item[fileName] = '/content/images/' + typeName + '/' + slug + '-' + fileName + '.png';
                fs.copySync(filePath, './public' + item[fileName]);
            }

        });

        sources.push(item);

        set.push(Object.assign({}, ...sources));

    });

    return { output: JSON.stringify(set, null, '\t'), warnings: warnings };

};