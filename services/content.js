'use strict';

/*
 * Module
 */
const _ = require('lodash');
const slugify = require('../modules/slugify');
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

module.exports = function () {

    const store = {};

    return {

        sourcesClear,

        sourceExists,

        sourceCreate,

        getPages: function () {
            return getType('pages')
                .then(pages => {

                    const pagesObject = {list: pages};

                    pages.forEach(page => {
                        pagesObject[page.slug] = page;
                    });

                    return pagesObject;
                });
        },

        getTalk,

        getSocialMedia: function () {
            return getType('social-media')
                .then(data => {
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
            return getType('humans')
                .then(data => {
                    return data
                        .filter(h => h.role.includes('Organizer'))
                        .sort((h1, h2) => h1.lastName > h2.lastName);
                });
        },

        getSpeakers: function () {

            return getTalksBySpeaker()
                .then(talksBySpeaker => {

                    return getType('humans')
                        .then(humans => {
                            return humans
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
            return Promise.all([
                getTalks(),
                getType('schedule')
            ])
                .then(results => {

                    const talks = results[0];
                    const events = results[1];

                    return events
                        .map(event => {

                            event.slug = slugify([event.location, event.start, event.end]);

                            event.startMomemt = parseDate(event.start);
                            event.endMomemt = parseDate(event.end);

                            event.startTime = event.startMomemt.format('LT').toLowerCase();
                            event.endTime = event.endMomemt.format('LT').toLowerCase();

                            event.dateDay = event.startMomemt.format('MMMM D');

                            event.timeSlot = event.start + '_' + event.end;

                            if (event.talk)
                                event.talk = talks.find(talk => event.talk === talk.slug);

                            return event;
                        })
                        .sort((event1, event2) => {

                            if (event1.timeSlot === event2.timeSlot) {
                                return (event1.location < event2.location) ? -1
                                    : (event1.location > event2.location) ? 1 : 0;
                            }

                            return event1.timeSlot < event2.timeSlot ? -1 : 1;
                        });
                });
        },

        getPanelists: function () {

            return getTalksBySpeaker()
                .then(talksBySpeaker => {

                    return getType('humans')
                        .then(humans => {
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

        getKeynoteSpeaker: function () {

            return getType('humans')
                .then(humans => {
                    const speakers = humans.filter(h => h.role.includes('Keynote Speaker'));
                    return speakers.length && speakers[0];
                });
        },

        getSponsors: function () {
            return Promise.all([
                getType('sponsors'),
                getType('sponsorship-levels')
            ])
                .then(results => {
                    const sponsors = results[0];
                    const sponsorshipLevels = results[0];

                    const groupedSponsors = _.groupBy(sponsors, 'level');

                    return sponsorshipLevels.map(level => {
                        return {
                            title: level,
                            sponsors: (groupedSponsors[level] || [])
                                .sort((h1, h2) => h1.title > h2.title)
                        };
                    });
                });
        }

    };

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

    function getType(type) {

        if (store.hasOwnProperty(type))
            return Promise.resolve(store[type]);

        return query('SELECT items FROM sources WHERE source_type = $1', [type])
            .then(result => {

                const response = JSON.parse(result.rows[0].items);
                store[type] = response;
                return Promise.resolve(response);
            });
    }

    function getSpeaker(slug) {
        return getType('humans')
            .then(humans => humans.find(human => human.slug === slug));
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

    function getTalks() {

        return Promise.all([
            getType('talks'),
            getType('humans')
        ])
            .then(results => {

                const talks = results[0];
                const humans = results[1];

                talks.map(talk => {
                    talk.speaker = humans.find(human => human.slug === talk.speaker);
                });

                return talks;
            });
    }

    function getTalk(slug) {

        return getTalks()
            .then(talks => {
                return talks.find(talk => talk.slug === slug);
            });
    }

    function parseDate(strDate) {

        return moment(
            strDate.substring(0, 10) + ' ' +
            strDate.substring(11, 11 + 2) + ':' +
            strDate.substring(13, 13 + 2)
        );
    }
}
;

