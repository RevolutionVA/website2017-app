'use strict';

const conf = require('./config/config.js');
const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const builder = require('./services/builder');

const HTTP_PORT = conf.get('port');
const redirectUrls = require('./services/redirectUrls');

app.set('view engine', 'ejs');

app.get('/.well-known/acme-challenge/:content', (req, res) => {
    const content = req.param('content');
    res.send(process.env['CERTBOT_RESPONSE:' + content]);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// redirections
app.use('*', redirectUrls);

// build use
app.use('/build', builder.use);

// static stuff
app.use('/', express.static('public'));
app.use('/', express.static('content'));

// everything else
app.get('*', require('./services/router')(app));
app.post('*', require('./services/router')(app));

http.createServer(app).listen(HTTP_PORT, () => {
    console.log(`
██████╗ ███████╗██╗   ██╗ ██████╗ ██╗     ██╗   ██╗████████╗██╗ ██████╗ ███╗   ██╗
██╔══██╗██╔════╝██║   ██║██╔═══██╗██║     ██║   ██║╚══██╔══╝██║██╔═══██╗████╗  ██║
██████╔╝█████╗  ██║   ██║██║   ██║██║     ██║   ██║   ██║   ██║██║   ██║██╔██╗ ██║
██╔══██╗██╔══╝  ╚██╗ ██╔╝██║   ██║██║     ██║   ██║   ██║   ██║██║   ██║██║╚██╗██║
██║  ██║███████╗ ╚████╔╝ ╚██████╔╝███████╗╚██████╔╝   ██║   ██║╚██████╔╝██║ ╚████║
╚═╝  ╚═╝╚══════╝  ╚═══╝   ╚═════╝ ╚══════╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
 ██████╗ ██████╗ ███╗   ██╗███████╗
██╔════╝██╔═══██╗████╗  ██║██╔════╝
██║     ██║   ██║██╔██╗ ██║█████╗
██║     ██║   ██║██║╚██╗██║██╔══╝
╚██████╗╚██████╔╝██║ ╚████║██║
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝

Unsecured server listening on port ` + HTTP_PORT );
});
