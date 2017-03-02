'use strict';

const convict = require('convict');

// Define a schema
let conf = convict({
    env: {
        doc: 'The applicaton environment.',
        format: ['production', 'development', 'test'],
        default: 'development',
        env: 'NODE_ENV'
    },
    port: {
        doc: 'The port to bind.',
        format: 'port',
        default: 8080,
        env: 'PORT'
    },
    contentZipUrl: {
        doc: 'The content zip file url.',
        format: 'url',
        default: 'http://github.com/revolutionva/website2017/archive/master.zip',
        env: 'CONTENT_ZIP_URL'
    },
    contentLocal: {
        doc: 'The directory path for a local copy of the content repo.',
        format: String,
        default: '',
        env: 'CONTENT_LOCAL'
    },
    buildUsername: {
        doc: 'The basic authentication user name for manual content builds.',
        format: String,
        default: 'revconf',
        env: 'BUILD_USER'
    },
    buildPassword: {
        doc: 'The basic authentication password for manual content builds.',
        format: String,
        default: '2017',
        env: 'BUILD_PASS'
    }
});

// Perform validation
conf.validate({strict: true});

module.exports = conf;
