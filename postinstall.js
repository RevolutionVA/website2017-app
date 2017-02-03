const appRoot = process.cwd();
const zipUrl = process.env.contentZipUrl;

let builder = require('./services/builder');

builder.setRawContent(appRoot, zipUrl)
    .then(function () {
        console.log('Raw Content Store Created.');
        return builder.generateData(appRoot);
    })
    .then(function () {
        console.log('Data Store Created.');
        return builder.generatePages(appRoot);
    })
    .then(function () {
        console.error('Build Complete!');
    })
    .catch(err => {
        console.error(err);
    });