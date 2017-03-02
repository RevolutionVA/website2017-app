'use strict';

const conf = require('../config/config.js');
const request = require('request');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const marked = require('marked');
const path = require('path');

const appRoot = process.cwd();
const zipUrl = conf.get('contentZipUrl');
const contentLocalPath = conf.get('contentLocal');
const contentBuildPath = appRoot + '/public/content-build.json';

/* globals config appRoot */

module.exports = {

    checkSchedule: function () {

        console.log('existsSync: ' + contentBuildPath);

        console.log('readdirSync: ' + fs.readdirSync(appRoot + '/public/').join(', '));

        if (!fs.existsSync(contentBuildPath)) {
            console.log('Nothing to see here...');
            return;
        }

        console.log('Scheduled build starting...');

        build()
            .then(() => {
                fs.removeSync(contentBuildPath);
                console.log('Scheduled build complete.');
            });
    },

    use: (req, res, next) => {

        if (req.method === 'POST') {

            if (isValidBuildHook(req)) {

                console.log('writeFileSync: ' + contentBuildPath);

                fs.writeFileSync(contentBuildPath,
                    JSON.stringify({requested: new Date()}, null, '\t'));

                console.log('Scheduled a build.');

                return res.status(200).send('Thanks!');
            }

            console.log('Failed to schedule a build.');
        }

        if (req.method === 'GET') {

            if (isValidBuildUser(req)) {
                return next();
            }
            res.set({'WWW-Authenticate': 'Basic realm="revconf-builder"'});
        }

        return res.status(401).send('Nice try!');
    },

    run: function (req, res) {

        console.log('Manual build starting...');
        build()
            .then(function () {
                console.log('Manual build complete.');
                res.send('<pre>Done.</pre>');
            })
            .catch(err => {
                console.log('Manual build incomplete.');
                console.error(err);
                res.send('<pre style="color:red;">' + err.stack + '</pre>');
            });
    },

    build: build
};

function build() {

    return setRawContent(appRoot, zipUrl)
        .then(() => {
            console.log('Raw Content Store Created.');
            return generateData(appRoot);
        })
        .then(() => {
            console.log('Data Store Created.');
            return generatePages(appRoot);
        })

}

function setRawContent() {

    const tmpDir = appRoot + '/.tmp';
    const tmpZipPath = tmpDir + '/tmp.zip';

    fs.emptyDir(tmpDir);

    if (contentLocalPath)
        return copyLocal();

    return download()
        .then(() => {
            return extract();
        })
        .then(() => {
            return copy();
        });

    function download() {

        return new Promise((resolve, reject) => {
            return request({url: zipUrl, encoding: null}, (err, resp, body) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                fs.writeFile(tmpZipPath, body, (err) => {
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
                //noinspection JSUnresolvedFunction
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

    function copyLocal() {
        fs.readdirSync(contentLocalPath).forEach(function (file) {
            if (!file.startsWith('.')) {
                fs.copySync(process.env.CONTENT_LOCAL + '/' + file,
                    tmpDir + '/' + file);
            }
        });

        console.log("Files Copied Locally!");

        return Promise.resolve();
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
}

function generateData() {

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

            if (slug.startsWith('_') || slug.startsWith('.') || slug.toLowerCase() === 'readme.md') {
                return;
            }

            let pathItem = filePath + '/' + slug;

            let item = {
                slug: slug
            };

            let sources = [], warnings = [];

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

                    let data = fs.readJsonSync(filePath, {throws: false});

                    if (data === null) {
                        warnings.push(`JSON parse '${slug}' ${fileName} data was null.`)
                    } else {
                        sources.push(data);
                    }
                }

                if (path.extname(file) === '.png') {
                    item[fileName] =
                        '/images/' + typeName + '/' + slug + '-' + fileName + '.png';
                    fs.copySync(filePath, './content' + item[fileName]);
                }

            });

            sources.push(item);

            set.push(Object.assign({}, ...sources));

        });

        fs.writeFileSync(outputPath, JSON.stringify(set, null, '\t'));
    }
}

function generatePages() {

    return new Promise((resolve, reject) => {

        if (0 == 'Implement this later.') {
            reject();
        }

        resolve();

    });
}

function isValidBuildHook(req) {

    let secret = process.env.GITHUB_HOOK_SECRET;
    let xHubSignature = req.headers['x-hub-signature'];

    if (req.body && xHubSignature && secret) {

        let xHubSignatureGenerated = 'sha1=' + (require('crypto').createHmac('sha1', secret))
                .update(JSON.stringify(req.body))
                .digest('hex');

        return xHubSignature === xHubSignatureGenerated;
    }
    return false;
}

function isValidBuildUser(req) {

    const user = require('basic-auth')(req);

    //noinspection JSUnresolvedVariable
    return user && user.name && user.pass
        && user.name === conf.get('buildUsername')
        && user.pass === conf.get('buildPassword');
}
