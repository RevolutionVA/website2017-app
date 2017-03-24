'use strict';

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

module.exports = {
  getPages: function() {
    const pages = { list: getType('pages') };
    pages.list.forEach(page => {
      pages[page.slug] = page;
    });
    return pages;
  },

  getTalks: function() {
    return getType('talks');
  },

  getTalk: function(slug) {
    const talk = getType('talks').find(talk => talk.slug === slug);

    if (talk && !talk.speakerSlug) {
      talk.speakerSlug = talk.speaker + '';
      talk.speaker = getSpeaker(talk.speakerSlug);
    }

    return talk;
  },

  getSocialMedia: function() {
    return getType('social-media')
      .map(link => {
        link.iconClass = (link.icon === 'lanyrd' ? 'icon icon-' : 'fa fa-') +
          link.icon;
        return link;
      })
      .reverse();
  },

  getOrganizers: function() {
    return getType('humans')
      .filter(h => h.role.includes('Organizer'))
      .sort((h1, h2) => h1.lastName > h2.lastName);
  },

  getSpeakers: function() {
    let speakers = getType('humans')
      .filter(h => h.role.includes('Speaker'))
      .sort((h1, h2) => h1.lastName > h2.lastName);

    speakers = speakers.map(human => {
      human.talk = getTalksBySpeaker()[human.slug];
      return human;
    });

    return speakers;
  },

  getSpeaker,

  getPanelists: function() {
    let panelists = getType('humans')
      .filter(h => h.role.includes('Panelist'))
      .sort((h1, h2) => h1.lastName > h2.lastName);

    panelists = panelists.map(human => {
      human.talk = getTalksBySpeaker()[human.slug];
      return human;
    });

    return panelists;
  },

  getSponsors: function() {
    const levels = getType('sponsorship-levels');
    const sponsors = getType('sponsors');
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
