const express = require('express');
const app = express();
const routes = require('./routes');
const fs = require('fs');
const https = require('https');
const http = require('http');

const privateKey = fs.readFileSync('/etc/letsencrypt/live/revolutionconf.com/privkey.pem');
const certificate = fs.readFileSync('/etc/letsencrypt/live/revolutionconf.com/cert.pem');
const HTTP_PORT = 80;
const HTTPS_PORT = 443;

app.set('view engine', 'ejs');

app.use('/', express.static('public'));

app.all('*', function (req, res, next) {

    if (req.secure) {
        return next();
    }
    res.redirect('https://' + req.hostname + ':' + HTTPS_PORT + req.url);
});

app.get('*', (req, res) => {

    let route = routes.find(req.path);
    res.render(route.view, route.data || {});

});

https.createServer({ key: privateKey, cert: certificate }, app)
    .listen(HTTPS_PORT, function () {
        console.log('Secure Server listening on port ' + HTTPS_PORT);
    });

http.createServer(app).listen(HTTP_PORT, function () {
    console.log('Insecure Server listening on port ' + HTTP_PORT);
});