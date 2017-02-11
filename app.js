const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const http = require('http');

const HTTP_PORT = process.env.PORT || 80;
const redirectUrls = require('./services/redirectUrls');


// handlebars view
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/.well-known/acme-challenge/:content', function (req, res) {
    let content = req.param('content');
    res.send(process.env['CERTBOT_RESPONSE:' + content]);
});

// redirections
app.use('*', redirectUrls);

// build auth
app.use('/build', require('./services/builder').use);

// static stuff
app.use('/', express.static('public'));
app.use('/', express.static('content'));

// build getter
app.get('/build', require('./services/builder').get);

// everything else
const routes = require('./config/routes')(app);
app.get('*', require('./services/router')(routes));

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