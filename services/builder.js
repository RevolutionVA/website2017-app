'use strict';

const conf = require('../config/config.js');
const fs = require('fs-extra');
const cdcm = require('cdcm');

const contentService = require('../services/content');

const appRoot = process.cwd();

const contentZipUrl = conf.get('contentZipUrl');
const contentCdnUrl = conf.get('contentCdnUrl');

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

    const config = {
        zipUrl: contentZipUrl,
        cdnUrl: contentCdnUrl
    };

    return cdcm(config)
        .getData()
        .then(dataTypes => {

            contentService.sourcesClear()
                .then(() => {
                    console.log('Data Generated.');

                    const promises = dataTypes.map(dataType => {
                        const json = JSON.stringify(dataType.items);
                        return contentService.sourceCreate(dataType.type, json);
                    });

                    return Promise.all(promises);
                })
                .then(() => {
                    console.log('Data Store Created.');
                });
        })
        .catch(err => {
            console.error(err);
        });
}

function isValidBuildHook(req) {

    const secret = process.env.GITHUB_HOOK_SECRET;
    const xHubSignature = req.headers['x-hub-signature'];

    if (req.body && xHubSignature && secret) {

        const xHubSignatureGenerated = 'sha1=' + (require('crypto').createHmac('sha1', secret))
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
