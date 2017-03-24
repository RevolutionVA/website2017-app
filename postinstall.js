'use strict';

const builder = require('./services/builder');

builder.build()
    .then(function () {
        console.log('Build Complete!');
    })
    .catch(err => {
        console.error(err);
    });
