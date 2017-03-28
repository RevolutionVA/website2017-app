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
            return {
                locals: {
                    socialMedia: contentService.getSocialMedia(),
                    bodyClass: 'home'
                },
                organizers: contentService.getOrganizers(),
                panelists: contentService.getPanelists(),
                sponsorLevels: contentService.getSponsors(),
                pages: contentService.getPages()
            };
        }
    ),
    new route(
        '*',
        'pages/index',
        path => {
            const data = {
                locals: {
                    socialMedia: contentService.getSocialMedia(),
                    bodyClass: 'page ' + slugify(path)
                }
            };

            const pages = contentService.getPages();

            const pageSlug = path.substr(1);

            if (pageSlug in pages) {

                Object.assign(data, pages[pageSlug]);
                return data;
            }

            return null;
        }
    ),
    new route(
        '/speakers',
        'pages/speakers',
        () => {

            const pages = contentService.getPages();

            return {
                locals: {
                    title: 'Speakers',
                    socialMedia: contentService.getSocialMedia(),
                    bodyClass: 'page-speaker'
                },
                intro: pages.speakers.intro,
                speakers: contentService.getSpeakers(),
                panelists: contentService.getPanelists()
            };
        }
    ),
    new route(
        '/talk/*',
        'pages/talk',
        (path) => {

            let slug = path.replace('/talk/', '');
            let talk = contentService.getTalk(slug);

            if (!talk) {
                return {redirect: '/404'}
            }

            return {
                locals: {
                    title: ' Talk - ' + talk.title,
                    keywords: talk.tags.join(','),
                    socialMedia: contentService.getSocialMedia(),
                    bodyClass: 'page-speaker'
                },
                intro: '',
                talk: talk
            };
        }
    ),
    new route(
        '/about',
        'pages/about',
        () => {

            const pages = contentService.getPages();

            return {
                locals: {
                    title: 'About',
                    socialMedia: contentService.getSocialMedia(),
                    bodyClass: 'page-about'
                },
                intro: pages.about.intro,
                organizers: contentService.getOrganizers(),
                volunteers: []
            };
        }
    ),
    new route(
        '/schedule',
        'pages/schedule',
        () => {

            const pages = contentService.getPages();

            return {
                locals: {
                    title: 'Schedule',
                    socialMedia: contentService.getSocialMedia(),
                    bodyClass: 'page-schedule'
                },
                moment : moment,
                intro: pages.schedule.intro,
                schedule: contentService.getSchedule()
            };
        }
    ),
    new route(
        '/404',
        'pages/404',
        () => {
            return {
                locals: {
                    title: 'Page not Found',
                    socialMedia: contentService.getSocialMedia(),
                    bodyClass: '404'
                }
            };
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
