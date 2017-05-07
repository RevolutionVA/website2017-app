// home.js

module.exports = () => {

    const promiseObjectResolver = require('../modules/promise-object-resolver');
    const content = require('../services/content')();

    return promiseObjectResolver({
        socialMedia: content.getSocialMedia(),
        pages: content.getPages(),
        organizers: content.getOrganizers(),
        panelists: content.getPanelists(),
        keynoteSpeaker: content.getKeynoteSpeaker(),
        sponsorLevels: content.getSponsors()
    })
        .then(results => {
            return Object.assign({
                locals: {
                    socialMedia: results.socialMedia,
                    bodyClass: 'home'
                }
            }, results);
        });
};