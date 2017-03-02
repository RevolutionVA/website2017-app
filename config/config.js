'use strict';

const convict = require('convict');

// Define a schema
var conf = convict({
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
  }
});

// Perform validation
conf.validate({strict: true});

module.exports = conf;
