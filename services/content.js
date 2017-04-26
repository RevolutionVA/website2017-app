'use strict';

/*
 * Module
 */
const _ = require('lodash');
const moment = require('moment');
const pg = require('pg');
const conf = require('../config/config.js');

const pool = new pg.Pool({
    user: conf.get('dbUser'),
    database: conf.get('dbName'),
    password: conf.get('dbPassword'),
    host: conf.get('dbHost'),
    port: conf.get('dbPort'),
    max: conf.get('dbMax'),
    idleTimeoutMillis: conf.get('dbIdleTimeoutMillis')
});

function query(sql, vars) {
    return new Promise((resolve, reject) => {
        pool.connect(function (err, client, done) {
            if (err) {
                console.error(err);
                reject(err);
            }
            client.query(sql, vars || [], function (err, result) {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve(result);
                done();
            });
        });

    });
}

function sourcesClear() {

    return query('DROP TABLE IF EXISTS sources;')
        .then(() => {
            return query('CREATE TABLE sources ( source_type varchar(50), items text );');
        });
}

function sourceExists(type) {

    return query('SELECT COUNT(*) FROM sources WHERE source_type = $1', [type])
        .then(count => {
            return count === '1';
        });
}

function sourceCreate(type, store) {

    return query('INSERT INTO sources (source_type,items) VALUES ($1, $2)', [type, store]);
}

function sourceGet(type, process) {

    return query('SELECT items FROM sources WHERE source_type = $1', [type])
        .then(result => {

            return process(JSON.parse(result.rows[0].items));
        });
}

function getType(type, process) {

    process = typeof process === 'function' ? process : (data => data);

    return sourceGet(type, process);
}

function getSpeaker(slug) {
    return getType('humans').find(human => human.slug === slug);
}

function getTalksBySpeaker() {

    return getType('talks')
        .then(talks => {

            const talksBySpeaker = {};

            talks.forEach(talk => {
                talksBySpeaker[talk.speaker] = talk;
            });

            return talksBySpeaker;
        });
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

    sourcesClear,

    sourceExists,

    sourceCreate,

    getPages: function () {
        return getType('pages', pages => {

            const pagesObject = {list: pages};

            pages.forEach(page => {
                pagesObject[page.slug] = page;
            });

            return pagesObject;
        });
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
        });
    },

    getSpeakers: function () {

        return getTalksBySpeaker()
            .then(talksBySpeaker => {

                return getType('humans', data => {
                    return data
                        .filter(h => h.role.includes('Speaker'))
                        .sort((h1, h2) => h1.lastName > h2.lastName)
                        .map(human => {
                            human.talk = talksBySpeaker[human.slug];
                            return human;
                        });
                });
            });
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

        return getTalksBySpeaker()
            .then(talksBySpeaker => {

                return getType('humans', humans => {
                    return humans
                        .filter(h => h.role.includes('Panelist'))
                        .sort((h1, h2) => h1.lastName > h2.lastName)
                        .map(human => {
                            human.talk = talksBySpeaker[human.slug];
                            return human;
                        });
                });
            });
    },

    getSponsors: function () {
        return getType('sponsors', sponsors => {
            return getType('sponsorship-levels')
                .then(levels => {

                    const groupedSponsors = _.groupBy(sponsors, 'level');

                    return levels.map(level => {
                        return {
                            title: level,
                            sponsors: (groupedSponsors[level] || [])
                                .sort((h1, h2) => h1.title > h2.title)
                        };
                    });
                });
        });
    }

};
