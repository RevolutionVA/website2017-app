/*
 * Routes
 */

const contentService = require('../services/content');

module.exports = [
    {
        path: '/',
        view: 'pages/home',
        bodyClass : 'home',
        data: function () {
            return {
                organizers: contentService.getOrganizers(),
                panelists: contentService.getPanelists(),
                sponsorLevels: contentService.getSponsors(),
                pages: contentService.getPages()
            };
        }
    },
    {
        path: '*',
        view: 'pages/index',
        bodyClass : 'page',
        data: function () {
            return {};
        }
    },
    {
        path: '/404',
        view: 'pages/404',
        bodyClass : '404',
        data: function () {
            return {};
        },
        404: true
    }
];