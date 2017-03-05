/*
 * Router
 */

const routes = require('../config/routes');
const contentService = require('../services/content');

module.exports = (app) => (req, res) => {

    let locals = {
        socialMedia: contentService.getSocialMedia(),
        bodyClass: []
    };

    // build getter
    if (req.path === '/build') {
        return require('./builder').run(req, res);
    }

    let route = routes.find(r => r.path == req.path);
    let renderData = null;

    if (!route) {

        let pages = contentService.getPages();

        let pageSlug = req.path.substr(1);

        if (pageSlug in pages) {

            // defined route by page
            route = routes.find(r => r.path === '*');
            locals.bodyClass.push(pageSlug);
            renderData = pages[pageSlug];

        } else {

            // anything else
            route = routes.find(r => r[404]);
        }
    }

    if (route.bodyClass) {
        locals.bodyClass.push(route.bodyClass);
    }

    app.locals = Object.assign(locals, app.locals);

    res.render(route.view, renderData || route.data(app, req, res));
};