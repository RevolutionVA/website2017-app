/*
 * Routes
 */

const contentService = require('./../services/content');

const allRoutes =
    [
        {
            path: '/',
            view: 'home',
            cache: 'index.html',
            data: {
                organizers: contentService.getHumans()
                    .filter(h => h.role == 'Organizer')
                    .sort((h1, h2) => h1.lastName > h2.lastName),
                panelists: contentService.getHumans()
                    .filter(h => h.role == 'Panelist')
                    .sort((h1, h2) => h1.lastName > h2.lastName)
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

module.exports = {

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