const request = require("request");
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const marked = require('marked');
const path = require('path');

/*
 * Config
 */

/* globals config appRoot */

module.exports = {

    setRawContent: function (appRoot, zipUrl) {

        const tmpDir = appRoot + '/.tmp';
        const tmpZipPath = tmpDir + '/tmp.zip';

        fs.emptyDir(tmpDir);

        return download()
            .then(() => {
                return extract();
            })
            .then(() => {
                return copy();
            });

        function download() {

            return new Promise((resolve, reject) => {

                request({ url: zipUrl, encoding: null }, function (err, resp, body) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                    fs.writeFile(tmpZipPath, body, function (err) {
                        if (err) {
                            console.error(err);
                            reject(err);
                        }

                        console.log("Zip Downloaded!");
                        resolve();
                    });
                });

            });
        }

        function extract() {

            return new Promise((resolve, reject) => {

                try {
                    let zip = new AdmZip(tmpZipPath);
                    zip.extractAllTo(tmpDir, true);
                    fs.removeSync(tmpZipPath);
                    console.log("Zip Extracted!");
                    resolve();
                } catch (err) {
                    console.error(err);
                    reject(err);
                }

            });
        }

        function copy() {

            return new Promise((resolve, reject) => {

                try {
                    let unzippedFolderPath = '';
                    // move zipped file contents to tmpDir
                    fs.readdirSync(tmpDir).forEach(function (unzippedFolder) {
                        unzippedFolderPath = tmpDir + '/' + unzippedFolder;
                        fs.readdirSync(unzippedFolderPath).forEach(function (file) {
                            if (!file.startsWith('.')) {
                                fs.copySync(unzippedFolderPath + '/' + file,
                                            tmpDir + '/' + file);
                            }
                        });
                    });
                    fs.removeSync(unzippedFolderPath);
                    console.log("Files Copied!");
                    resolve();
                } catch (err) {
                    console.error(err);
                    reject(err);
                }

            });
        }
    },

    generateData: function (appRoot) {

        const tmpDir = appRoot + '/.tmp';
        const contentDir = appRoot + '/content';

        fs.ensureDirSync(contentDir);

        fs.emptyDirSync(contentDir);

        return new Promise((resolve, reject) => {

            try {

                let dataTypes = [];

                fs.readdirSync(tmpDir).forEach(function (fileType) {

                    let curPath = tmpDir + '/' + fileType;

                    if (!fs.lstatSync(curPath).isDirectory()) {

                        if (fileType.endsWith('.json')) {
                            fs.copySync(curPath, contentDir + '/' + fileType);
                            dataTypes.push(fileType);
                        }
                    } else {
                        processItemsDir(curPath, contentDir + '/' + fileType + '.json');
                        dataTypes.push(fileType + '.json');
                    }
                });

                let content = {
                    updated: new Date(),
                    dataTypes
                };

                fs.writeFileSync(appRoot + '/public/content-status.json',
                                 JSON.stringify(content, null, '\t'));

            } catch (err) {
                reject(err);
            } finally {
                fs.removeSync(tmpDir);
            }

            resolve();
        });

        function processItemsDir(filePath, outputPath) {

            let typeName = path.basename(filePath);

            let set = [];

            fs.readdirSync(filePath).forEach(slug => {

                if (slug.startsWith('_') || slug.startsWith('.')) {
                    return;
                }

                let pathItem = filePath + '/' + slug;

                let item = {
                    slug: slug
                };

                let sources = [];

                if (!fs.lstatSync(pathItem).isDirectory()) {
                    return;
                }

                fs.readdirSync(pathItem).forEach(file => {

                    let filePath = pathItem + '/' + file;
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
                        item[fileName] =
                            '/images/' + typeName + '/' + slug + '-' + fileName + '.png';
                        fs.copySync(filePath, './public' + item[fileName]);
                    }

                });

                sources.push(item);

                set.push(Object.assign({}, ...sources));

            });

            fs.writeFileSync(outputPath, JSON.stringify(set, null, '\t'));
        }
    },

    generatePages: function (appRoot) {

        return new Promise((resolve, reject) => {

            resolve();

        });
    }

};
