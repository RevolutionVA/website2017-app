const request = require("request");
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const marked = require('marked');
const path = require('path');
const schedule = require('node-schedule');

const appRoot = process.cwd();
const zipUrl = process.env.CONTENT_ZIP_URL;
const contentLocalPath = process.env.CONTENT_LOCAL;

/* globals config appRoot */

module.exports = {

    startScheduler : function(){

        schedule.scheduleJob('*/5 * * * *', function () {

            if (fs.existsSync(appRoot + '/public/content-build.json')) {
                console.log('Scheduled build starting...');
                build();
                fs.removeSync(appRoot + '/public/content-build.json');
                console.log('Scheduled build complete.');
            } else {
                console.log('Nothing to see here...');
            }

        });

        console.log('Scheduler started.');

        return Promise.resolve();
    },

    use: (req, res, next) => {

        if (req.method === 'POST' && isValidBuildHook(req)) {

            fs.writeFileSync(appRoot + '/public/content-build.json',
                JSON.stringify({requested: new Date()}, null, '\t'));

            console.log('Scheduled a build.');
            return res.status(200).send('Thanks!');
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
        .then(function () {
            console.log('Raw Content Store Created.');
            return generateData(appRoot);
        })
        .then(function () {
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

            request({url: zipUrl, encoding: null}, function (err, resp, body) {
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

    if (req.body && req.headers['x-hub-signature'] && secret) {

        let xHubSignature = 'sha1=' + (require('crypto').createHmac('sha1', secret))
                .update(JSON.stringify(req.body))
                .digest('hex');
        return req.headers['x-hub-signature'] === xHubSignature;
    }
    return false;
}

function isValidBuildUser(req) {

    const user = require('basic-auth')(req);

    //noinspection JSUnresolvedVariable
    return user && user.name && user.pass
        && user.name === process.env.BUILD_USER
        && user.pass === process.env.BUILD_PASS;
}
