/*
 * Router
 */


module.exports = (app) => (req, res) => {

    // build getter
    if (req.path === '/build') {
        return require('./builder').get(req, res);
    }

    // everything else
    const routes = require('../config/routes')(app);

    let route = routes.find(req.path);
    res.render(route.view, route.data(app, req, res));

};