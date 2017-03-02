'use strict';

/*
 * Routes
 */

const contentService = require('../services/content');

module.exports = [
    {
        path: '/',
        view: 'home',
        cache: 'index.html',
        data: function () {
            return {
                organizers: contentService.getOrganizers(),
                panelists: contentService.getPanelists(),
                sponsors: contentService.getSponsors(),
                pages: contentService.getPages()
            };
        }
    },
    {
        path: '/code-of-conduct',
        view: 'code-of-conduct',
        data: function () {
        }
    },
    {
        path: '/404',
        view: '404',
        data: function () {
        },
        default: true
    }
];
