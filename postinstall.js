let builder = require('./services/builder');

builder.setRawContent()
    .then(function () {
        console.log('Raw Content Store Created.');
        return builder.generateData();
    })
    .then(function () {
        console.log('Data Store Created.');
        return builder.generatePages();
    })
    .then(function () {
        console.error('Build Complete!');
    })
    .catch(err => {
        console.error(err);
    });