const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const http = require('http');
const auth = require('basic-auth');
const routes = require('./config/routes');

const zipUrl = process.env.contentZipUrl;
const appRoot = process.cwd();

const HTTP_PORT = process.env.PORT || 80;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));

app.set('view engine', 'handlebars');

app.use('/', express.static('public'));

app.use('/build', (req, res, next) => {

    if (isValidBuildUser(auth(req))) {
        next();
    } else {
        res.set({ 'WWW-Authenticate': 'Basic realm="revconf-builder"' }).send(401);
    }
});

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

    res.render(route.view, route.data || {});

});

http.createServer(app).listen(HTTP_PORT, function () {
    console.log('Insecure Server listening on port ' + HTTP_PORT);
});

function isValidBuildUser(user) {
    return user && user.name && user.pass
           && user.name === process.env.buildUsername
           && user.pass === process.env.buildPassword;
}