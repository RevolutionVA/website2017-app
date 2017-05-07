// about.js

const contentService = require('../services/content');
const promiseObjectResolver = require('../modules/promise-object-resolver');

module.exports = () => {

    const content = contentService();

    return promiseObjectResolver({
        socialMedia: content.getSocialMedia(),
        pages: content.getPages(),
        organizers: content.getOrganizers(),
        volunteers: content.getVolunteers()
    })
        .then(results => ({
            locals: {
                title: 'About',
                socialMedia: results.socialMedia,
                bodyClass: 'page-about'
            },
            intro: results.pages.about.intro,
            organizers: results.organizers,
            volunteers: results.volunteers
        }));
}
