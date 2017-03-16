'use strict';

/*
 * Module
 */
const fs = require('fs-extra');
const _ = require('lodash');

global.dataStore = {};

function getSet(type) {

    if (!global.dataStore[type]) {

        if (fs.existsSync('./content/' + type + '.json'))
            global.dataStore[type] = fs.readJsonSync('./content/' + type + '.json');
        else
            global.dataStore[type] = [];
    }

    return global.dataStore[type];
}

module.exports = {

    getPages: function () {
        const pages = {list: getSet('pages')};
        pages.list.forEach(page => {
            pages[page.slug] = page;
        });
        return pages;
    },

    getSocialMedia: function () {
        return getSet('social-media').map(link => {
            link.iconClass = (link.icon === 'lanyrd' ? 'icon icon-' : 'fa fa-') + link.icon;
            return link;
        }).reverse();
    },

    getOrganizers: function () {
        return getSet('humans').filter(h => h.role.includes('Organizer'))
            .sort((h1, h2) => h1.lastName > h2.lastName);
    },

    getSpeakers: function () {
        return getSet('humans').filter(h => h.role.includes('Speaker'))
            .sort((h1, h2) => h1.lastName > h2.lastName);
    },

    getPanelists: function () {
        return getSet('humans').filter(h => h.role.includes('Panelist'))
            .sort((h1, h2) => h1.lastName > h2.lastName);
    },

    getSponsors: function () {
        const levels = getSet('sponsorship-levels');
        const sponsors = getSet('sponsors');
        const groupedSponsors = _.groupBy(sponsors, 'level');
        return levels.map(level => {
            return {
                title: level,
                sponsors: (groupedSponsors[level] || [])
                    .sort((h1, h2) => h1.title > h2.title)
            };
        });
    }
};
