const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const http = require('http');
const auth = require('basic-auth');
const routes = require('./config/routes');

const appRoot = process.cwd();
const zipUrl = process.env.contentZipUrl;

const HTTP_PORT = process.env.PORT || 80;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));

app.set('view engine', 'handlebars');

app.use('*', (req, res, next) => {

    if (process.env.SSL_REDIRECT && 'http' === req.protocol) {
        res.redirect("https://" + req.headers.host + req.url);
    }

    return next();
});

app.use('/', express.static('public'));

app.use('/build', (req, res, next) => {

    if (isValidBuildUser(auth(req))) {
        next();
    } else {
        res.set({ 'WWW-Authenticate': 'Basic realm="revconf-builder"' }).send(401);
    }
});

/* Maybe needed for cert expiration

 const letsEncryptResponse = process.env.CERTBOT_RESPONSE;

 app.get('/.well-known/acme-challenge/:content', function(req, res) {
 res.send(letsEncryptResponse);
 });
 */

app.get('/build', (req, res) => {

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
            res.send('<pre>Done.</pre>');
        })
        .catch(err => {
            res.send('<pre style="color:red;">' + err.stack + '</pre>');
        });

});

app.get('*', (req, res) => {

    let route = routes.find(req.path);

    let data = route.data || {};

    if (typeof(data) === 'function') {
        data = data();
    }

    res.render(route.view, data);

});

http.createServer(app).listen(HTTP_PORT, function () {
    console.log('Insecure Server listening on port ' + HTTP_PORT);
});

function isValidBuildUser(user) {
    return user && user.name && user.pass
           && user.name === process.env.buildUsername
           && user.pass === process.env.buildPassword;
}