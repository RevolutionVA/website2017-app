/*
 * Module
 */
const fs = require('fs-extra');
const _ = require('lodash');

global.dataStore = {};

function getSet(type) {
    global.dataStore[type] = global.dataStore[type] || fs.readJsonSync('./content/' + type + '.json');
    return global.dataStore[type];
}

module.exports = {

    getPages: function () {
        let pages = {list: getSet('pages')};
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
        return getSet('humans').filter(h => h.role == 'Organizer')
            .sort((h1, h2) => h1.lastName > h2.lastName);
    },

    getPanelists: function () {
        return getSet('humans').filter(h => h.role == 'Panelist')
            .sort((h1, h2) => h1.lastName > h2.lastName);
    },

    getSponsors: function () {
        let levels = getSet('sponsorship-levels');
        let sponsors = getSet('sponsors');
        let groupedSponsors = _.groupBy(sponsors, 'level');
        return levels.map(level => {
            return {
                level: level,
                sponsors: (groupedSponsors[level] || [])
                    .sort((h1, h2) => h1.title > h2.title)
            };
        });
    }

};