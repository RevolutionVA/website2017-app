/*
 * Router
 */

const routes = require('../config/routes');

module.exports = (app) => (req, res) => {

    // build getter
    if (req.path === '/build') {
        return require('./builder').run(req, res);
    }

    let route = routes.find(r => r.path === req.path);

    if (!route) {
        route = routes.find(r => r.path === '*');

        if (!route) {
            route = routes.find(r => r[404]);
        }
    }

    let data = route.viewData(req.path);

    Object.assign(app.locals, data.locals || {});

    res.render(route.view, data);
};