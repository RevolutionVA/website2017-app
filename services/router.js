'use strict';

/*
 * Router
 */

const routes = require('../config/routes');

module.exports = (app) => (req, res) => {

    let route = routes.find(r => r.path === req.path);

    if (!route) {
        route = routes.find(r => {
            if (!r.path.includes('*')) return false;
            const regExpStr = '^' + r.path.replace('*', '[^/]+');
            return new RegExp(regExpStr).test(req.path);
        });

        if (!route) {
            route = routes.find(r => r.path === '*');

            if (!route) {
                route = routes.find(r => r[404]);
            }
        }
    }

    if (route.response && (typeof route.response === 'function')) {
        return route.response(req, res);
    }

    route
        .viewData(req.path)
        .then(data => {

            if (data.redirect) {
                res.writeHead(302, {
                    'Location': data.redirect
                });
                res.end();
            }

            Object.assign(app.locals, {title: '', keywords: ''}, data.locals || {});

            res.render(route.view, data);
        })
        .catch(err => {

            res.end();
        });
};
