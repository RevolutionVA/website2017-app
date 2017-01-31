/*
 * Routes
 */

const _ = require('lodash');

const allRoutes =
    [
        {
            path: '/',
            view: 'home',
            data: {
                'discussionPanel': [
                    {
                        img : ''
                    }
                ]
            }
        },
        {
            path: '/code-of-conduct',
            view: 'code-of-conduct',
            data: {}
        }
    ];

const defaultRoute =
    {
        path: '/404',
        view: '404',
        data: {}
    };

module.exports = {

    all: allRoutes,

    default: defaultRoute,

    find: path => {
        let route = _.find(allRoutes, { path: path });
        return route || defaultRoute;
    }
};