'use strict';

const convict = require('convict');

// Define a schema
const conf = convict({
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
    contentCdnUrl: {
        doc: 'The content CDN root url.',
        format: 'url',
        default: 'https://raw.githubusercontent.com/revolutionva/website2017/master',
        env: 'CONTENT_CDN_URL'
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
    },
    dbUser: {
        doc: 'Database user.',
        format: String,
        default: 'revconf2017',
        env: 'PGUSER'
    },
    dbName: {
        doc: 'Database name.',
        format: String,
        default: 'revconf2017',
        env: 'PGDATABASE'
    },
    dbPassword: {
        doc: 'Database password.',
        format: String,
        default: 'revconfrevconf',
        env: 'PGPASSWORD'
    },
    dbHost: {
        doc: 'Server hosting the postgres database.',
        format: String,
        default: 'localhost',
        env: 'PGHOST'
    },
    dbPort: {
        doc: 'Database port.',
        format: 'port',
        default: 5432,
        env: 'PGPORT'
    },
    dbMax: {
        doc: 'Max number of clients in the pool.',
        format: Number,
        default: 10,
        env: 'PGMAX'
    },
    dbIdleTimeoutMillis: {
        doc: 'How long a client is allowed to remain idle before being closed.',
        format: Number,
        default: 30000,
        env: 'PGITM'
    }
});

// Perform validation
conf.validate({strict: true});

module.exports = conf;
