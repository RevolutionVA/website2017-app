const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const routes = require('./routes');
const http = require('http');

const HTTP_PORT = process.env.PORT || 80;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));

app.set('view engine', 'handlebars');

app.use('/', express.static('public'));

app.get('*', (req, res) => {

    let route = routes.find(req.path);
    res.render(route.view, route.data || {});

});

http.createServer(app).listen(HTTP_PORT, function () {
    console.log('Insecure Server listening on port ' + HTTP_PORT);
});
