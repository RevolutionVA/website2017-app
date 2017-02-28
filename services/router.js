'use strict';

/*
 * Router
 */


module.exports = (app) => (req, res) => {

    // build getter
    if (req.path === '/build') {
        return require('./builder').run(req, res);
    }

    // everything else
    const routes = require('../config/routes')(app);

    const route = routes.find(req.path);
    res.render(route.view, route.data(app, req, res));

};
