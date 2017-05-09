// speakers.js

const contentService = require('../services/content');
const promiseObjectResolver = require('../modules/promise-object-resolver');

module.exports = () => {

    const content = contentService();

    return promiseObjectResolver({
        socialMedia: content.getSocialMedia(),
        pages: content.getPages(),
        keynoteSpeaker: content.getKeynoteSpeaker(),
        speakers: content.getSpeakers(),
        panelists: content.getPanelists()
    })
        .then(results => ({
            locals: {
                title: 'Speakers',
                socialMedia: results.socialMedia,
                bodyClass: 'page-speaker'
            },
            intro: results.pages.speakers.intro,
            speakers: results.speakers,
            keynoteSpeaker: results.keynoteSpeaker,
            panelists: results.panelists
        }));
};
