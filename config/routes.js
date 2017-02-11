/*
 * Routes
 */

const contentService = require('../services/content');

const allRoutes =
    [
        {
            path: '/',
            view: 'home',
            cache: 'index.html',
            data: function () {
                return {
                    organizers: contentService.getOrganizers(),
                    panelists: contentService.getPanelists(),
                    sponsors: contentService.getSponsors()
                };
            }
        },
        {
            path: '/code-of-conduct',
            view: 'code-of-conduct'
        },
        {
            path: '/404',
            view: '404',
            default: true
        }
    ];

module.exports = function (app) {

    app.locals.socialMedia = contentService.getSocialMedia();

    return {

        all: allRoutes.map(r => {
            if (!r.cached) {
                r.cached = (r.path + '/index.html').replace('//', '/');
            }
            return r;
        }),

        find: path => {
            return allRoutes.find(r => r.path == path)
                || allRoutes.find(r => r.default)
                || allRoutes[0];
        }
    };
}