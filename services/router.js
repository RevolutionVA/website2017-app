'use strict';

/*
 * Router
 */

const Route = require('route-parser');
const fs = require('fs-extra');
const routes = fs.readJsonSync('./config/routes.json');

module.exports = (app) => (req, res) => {

    let routeFound = null, urlParams = {};

    const requestPath = req.path;

    routes.forEach(route => {

        if (routeFound) return;

        const testUrlParams = new Route(route.path).match(requestPath);

        if (testUrlParams) {
            urlParams = testUrlParams;
            routeFound = route;
        }
    });

    const controller = require('../controllers/' + routeFound.controller);


    controller(urlParams)
        .then(data => {

            if (data.response && (typeof data.response === 'function')) {
                return data.response(req, res);
            }

            if (data.redirect) {
                res.writeHead(302, {
                    'Location': data.redirect
                });
                res.end();
                return;
            }

            Object.assign(app.locals, {title: '', keywords: ''}, data.locals || {});

            res.render(data.view || routeFound.view, data);
        })
        .catch(err => {

            res.end();
        });
};
