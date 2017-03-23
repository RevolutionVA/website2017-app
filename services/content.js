/*
 * Module
 */
const fs = require('fs-extra');
const _ = require('lodash');

global.dataStore = {};

function getType(type) {

    if (!global.dataStore[type]) {

        if (fs.existsSync('./content/' + type + '.json'))
            global.dataStore[type] = fs.readJsonSync('./content/' + type + '.json');
        else
            global.dataStore[type] = [];
    }

    return global.dataStore[type];
}

function getSpeaker(slug) {

    return getType('humans').find(human => human.slug === slug);
}

module.exports = {

    getPages: function () {
        let pages = {list: getType('pages')};
        pages.list.forEach(page => {
            pages[page.slug] = page;
        });
        return pages;
    },

    getTalks: function () {
        return getType('talks');
    },

    getTalk: function (slug) {

        let talk = getType('talks').find(talk => talk.slug === slug);

        if (talk && !talk.speakerSlug) {
            talk.speakerSlug = talk.speaker + '';
            talk.speaker = getSpeaker(talk.speakerSlug);
        }

        return talk;
    },

    getSocialMedia: function () {
        return getType('social-media').map(link => {
            link.iconClass = (link.icon === 'lanyrd' ? 'icon icon-' : 'fa fa-') + link.icon;
            return link;
        }).reverse();
    },

    getOrganizers: function () {
        return getType('humans').filter(h => h.role.includes('Organizer'))
            .sort((h1, h2) => h1.lastName > h2.lastName);
    },

    getSpeakers: function () {

        let speakers = getType('humans')
            .filter(h => h.role.includes('Speaker'))
            .sort((h1, h2) => h1.lastName > h2.lastName);

        if (speakers[0].talk !== null && typeof speakers[0].talk !== 'object') {

            let talksBySpeaker = {};
            let talks = getType('talks') || [];

            talks.forEach(talk => {
                talksBySpeaker[talk.speaker] = talk;
            });

            speakers = speakers.map(speaker => {
                speaker.talk = talksBySpeaker[speaker.slug];
                return speaker;
            });
        }

        return speakers;
    },

    getSpeaker,

    getPanelists: function () {
        return getType('humans').filter(h => h.role.includes('Panelist'))
            .sort((h1, h2) => h1.lastName > h2.lastName);
    },

    getSponsors: function () {
        let levels = getType('sponsorship-levels');
        let sponsors = getType('sponsors');
        let groupedSponsors = _.groupBy(sponsors, 'level');
        return levels.map(level => {
            return {
                title: level,
                sponsors: (groupedSponsors[level] || [])
                    .sort((h1, h2) => h1.title > h2.title)
            };
        });
    }

};