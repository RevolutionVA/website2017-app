'use strict';

/*
 * Module
 */
const fs = require('fs-extra');
const _ = require('lodash');
const moment = require('moment');

global.dataStore = {};

function getType(type, process, subType) {

    let storeKey = subType || type;

    if (!global.dataStore[storeKey]) {

        process = typeof process === 'function' ? process : (data => data);

        if (fs.existsSync('./content/' + type + '.json'))
            global.dataStore[storeKey] = process(fs.readJsonSync('./content/' + type + '.json'));
        else
            global.dataStore[storeKey] = [];
    }

    return global.dataStore[storeKey];
}

function getSpeaker(slug) {
    return getType('humans').find(human => human.slug === slug);
}

function getTalksBySpeaker() {

    if (!global.dataStore['talksBySpeaker']) {

        global.dataStore['talksBySpeaker'] = {};

        const talks = getType('talks') || [];

        talks.forEach(talk => {
            global.dataStore['talksBySpeaker'][talk.speaker] = talk;
        });
    }

    return global.dataStore['talksBySpeaker'];
}

function getTalk(slug) {

    const talk = getType('talks').find(talk => talk.slug === slug);

    if (talk && !talk.speakerSlug) {
        talk.speakerSlug = talk.speaker + '';
        talk.speaker = getSpeaker(talk.speakerSlug);
    }

    return talk;
}

function parseDate(strDate) {

    return moment(
        strDate.substring(0, 10) + ' ' +
        strDate.substring(11, 11 + 2) + ':' +
        strDate.substring(13, 13 + 2)
    );
}

module.exports = {

    getPages: function () {
        return getType('pages', pages => {

            const pagesObject = {list: pages};

            pages.forEach(page => {
                pagesObject[page.slug] = page;
            });

            return pagesObject;
        });
    },

    getTalks: function () {
        return getType('talks');
    },

    getTalk,

    getSocialMedia: function () {
        return getType('social-media', data => {
            return data
                .map(link => {
                    link.iconClass = (link.icon === 'lanyrd' ? 'icon icon-' : 'fa fa-') +
                        link.icon;
                    return link;
                })
                .reverse();
        });
    },

    getOrganizers: function () {
        return getType('humans', data => {
            return data
                .filter(h => h.role.includes('Organizer'))
                .sort((h1, h2) => h1.lastName > h2.lastName);
        }, 'organizers');
    },

    getSpeakers: function () {
        return getType('humans', data => {
            return data
                .filter(h => h.role.includes('Speaker'))
                .sort((h1, h2) => h1.lastName > h2.lastName)
                .map(human => {
                    human.talk = getTalksBySpeaker()[human.slug];
                    return human;
                });
        }, 'speakers')

    },

    getSpeaker,

    getSchedule: function () {
        return getType('schedule', events => {
            return events
                .map(event => {
                    if (event.talk) {
                        event.talk = getTalk(event.talk);
                    }

                    event.startMomemt = parseDate(event.start);
                    event.endMomemt = parseDate(event.end);

                    event.startTime = event.startMomemt.format('LT').toLowerCase();
                    event.endTime = event.endMomemt.format('LT').toLowerCase();

                    event.dateDay = event.startMomemt.format('MMMM D');

                    event.timeSlot = event.start + '_' + event.end;
                    return event;
                })
                .sort((event1, event2) => {

                    if (event1.timeSlot === event2.timeSlot) {
                        return (event1.location < event2.location) ? -1 : (event1.location > event2.location) ? 1 : 0;
                    }

                    return event1.timeSlot < event2.timeSlot ? -1 : 1;
                });
        });
    },

    getPanelists: function () {
        return getType('humans', humans => {
            return humans
                .filter(h => h.role.includes('Panelist'))
                .sort((h1, h2) => h1.lastName > h2.lastName)
                .map(human => {
                    human.talk = getTalksBySpeaker()[human.slug];
                    return human;
                });
        }, 'panelists');
    },

    getSponsors: function () {
        return getType('sponsors', sponsors => {
            const levels = getType('sponsorship-levels');
            const groupedSponsors = _.groupBy(sponsors, 'level');
            return levels.map(level => {
                return {
                    title: level,
                    sponsors: (groupedSponsors[level] || [])
                        .sort((h1, h2) => h1.title > h2.title)
                };
            });
        });
    }

};