const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const http = require('http');

const HTTP_PORT = process.env.PORT || 80;
const redirectUrls = require('./services/redirectUrls');

// handlebars view
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// redirections
app.use('*', redirectUrls);

// build auth
app.use('/build', require('./services/builder').use);

// static stuff
app.use('/', express.static('public'));

// build getter
app.get('/build', require('./services/builder').get);

// everything else
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