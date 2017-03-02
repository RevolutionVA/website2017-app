/*
 * Router
 */


module.exports = (app) => (req, res) => {

    app.locals = Object.assign(require('../config/localVars'), app.locals);

    // build getter
    if (req.path === '/build') {
        return require('./builder').run(req, res);
    }

    // everything else
    const routes = require('../config/routes');

    let route = findRoute(req.path);
    res.render(route.view, route.data(app, req, res));

    function findRoute(path) {
        return routes.find(r => r.path == path)
            || routes.find(r => r.default)
            || routes[0];
    }
};