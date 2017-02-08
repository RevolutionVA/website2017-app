const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const http = require('http');

const HTTP_PORT = process.env.PORT || 80;
const redirectUrls = require('./services/redirectUrls');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));

app.set('view engine', 'handlebars');

app.use('*', redirectUrls);

app.use('/build', require('./services/builder').use);

app.use('/', express.static('public'));

app.get('/build', require('./services/builder').get);

app.get('*', require('./services/router'));

http.createServer(app).listen(HTTP_PORT, function () {
    console.log('Unsecured server listening on port ' + HTTP_PORT + `.
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
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝`);
});