'use strict';

/*
 * Routes
 */

const contentService = require('../services/content');
const route = require('../module/route');
const moment = require('moment');

module.exports = [
    new route(
        '/build',
        false,
        false,
        require('../services/builder').run
    ),
    new route(
        '/',
        'pages/home',
        () => {

            return Promise.all([
                contentService.getSocialMedia(),
                contentService.getOrganizers(),
                contentService.getPanelists(),
                contentService.getSponsors(),
                contentService.getPages()
            ])
                .then(results => {
                    return {
                        locals: {
                            socialMedia: results[0],
                            bodyClass: 'home'
                        },
                        organizers: results[1],
                        panelists: results[2],
                        sponsorLevels: results[3],
                        pages: results[4]
                    };
                });
        }
    ),
    new route(
        '*',
        'pages/index',
        path => {

            return Promise.all([
                contentService.getSocialMedia(),
                contentService.getPages()
            ])
                .then(results => {

                    const pages = results[1];

                    const data = {
                        locals: {
                            socialMedia: results[0],
                            bodyClass: 'page ' + slugify(path)
                        }
                    };

                    const pageSlug = path.substr(1);

                    if (pageSlug in pages) {

                        Object.assign(data, pages[pageSlug]);
                        return data;
                    }

                    return null;
                });
        }
    ),
    new route(
        '/speakers',
        'pages/speakers',
        () => {

            return Promise.all([
                contentService.getSocialMedia(),
                contentService.getPages(),
                contentService.getSpeakers(),
                contentService.getPanelists()
            ])
                .then(results => {

                    return {
                        locals: {
                            title: 'Speakers',
                            socialMedia: results[0],
                            bodyClass: 'page-speaker'
                        },
                        intro: results[1].speakers.intro,
                        speakers: results[2],
                        panelists: results[3]
                    };

                });
        }
    ),
    new route(
        '/talk/*',
        'pages/talk',
        (path) => {

            const slug = path.replace('/talk/', '');

            return Promise.all([
                contentService.getSocialMedia(),
                contentService.getTalk(slug)
            ])
                .then(results => {

                    if (!results[1]) {
                        return {redirect: '/404'};
                    }

                    return {
                        locals: {
                            title: ' Talk - ' + results[1].title,
                            keywords: results[1].tags.join(','),
                            socialMedia: results[0],
                            bodyClass: 'page-speaker'
                        },
                        intro: '',
                        talk: results[1]
                    };
                });
        }
    ),
    new route(
        '/about',
        'pages/about',
        () => {

            return Promise.all([
                contentService.getSocialMedia(),
                contentService.getPages(),
                contentService.getOrganizers()
            ])
                .then(results => {

                    return {
                        locals: {
                            title: 'About',
                            socialMedia: results[0],
                            bodyClass: 'page-about'
                        },
                        intro: results[1].about.intro,
                        organizers: results[2],
                        volunteers: []
                    };
                });
        }
    ),
    new route(
        '/schedule',
        'pages/schedule',
        () => {

            return Promise.all([
                contentService.getSocialMedia(),
                contentService.getPages(),
                contentService.getSchedule()
            ])
                .then(results => {

                    return {
                        locals: {
                            title: 'Schedule',
                            socialMedia: results[0],
                            bodyClass: 'page-schedule'
                        },
                        moment: moment,
                        intro: results[1].schedule.intro,
                        schedule: results[2]
                    };
                });
        }
    ),
    new route(
        '/404',
        'pages/404',
        () => {

            return Promise.all([
                contentService.getSocialMedia()
            ])
                .then(results => {

                    return {
                        locals: {
                            title: 'Page not Found',
                            socialMedia: results[0],
                            bodyClass: '404'
                        }
                    };
                });
        },
        true
    )
];

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}
