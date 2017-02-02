const express = require('express');
const app = express();
const routes = require('./routes');
const http = require('http');

const HTTP_PORT = process.env.PORT || 80;

if (process.env.SSL) {
    const https = require('https');
    const HTTPS_PORT = 443;
    const fs = require('fs');
    const httpsOptions = {
        key: fs.readFileSync('/etc/letsencrypt/live/revolutionconf.com/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/revolutionconf.com/cert.pem'),
        ca: fs.readFileSync('/etc/letsencrypt/live/revolutionconf.com/chain.pem')
    };

    app.all('*', function (req, res, next) {

        if (req.secure) {
            return next();
        }

        res.redirect('https://' + req.hostname + ':' + HTTPS_PORT + req.url);
    });

    https.createServer(httpsOptions, app)
        .listen(HTTPS_PORT, function () {

            console.log('Secure Server listening on port ' + HTTPS_PORT);
        });
}

app.set('view engine', 'ejs');

app.use('/', express.static('public'));

app.get('*', (req, res) => {

    let route = routes.find(req.path);
    res.render(route.view, route.data || {});

});

http.createServer(app).listen(HTTP_PORT, function () {
    console.log('Insecure Server listening on port ' + HTTP_PORT);
});
